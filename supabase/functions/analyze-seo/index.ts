import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
import { calculateSeoScore, generateSuggestions } from "./seoAnalysis.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple in-memory cache for URL analysis results
const analysisCache = new Map();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    console.log(`Analyzing URL: ${url}`)

    // Check cache first
    const cachedResult = analysisCache.get(url);
    if (cachedResult && (Date.now() - cachedResult.timestamp) < CACHE_DURATION) {
      console.log('Returning cached result for:', url);
      return new Response(
        JSON.stringify(cachedResult.data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let formattedUrl;
    try {
      let cleanUrl = url.replace(/:\/*$/, '');
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = `https://${cleanUrl}`;
      }
      formattedUrl = new URL(cleanUrl);
      if (!formattedUrl.hostname.includes('.')) {
        throw new Error('Invalid domain format');
      }
    } catch (error) {
      console.error('URL Validation Error:', error);
      throw new Error('Invalid URL format');
    }

    const SCRAPING_BEE_API_KEY = Deno.env.get('SCRAPING_BEE_API_KEY')
    if (!SCRAPING_BEE_API_KEY) {
      throw new Error('ScrapingBee API key not configured')
    }

    const scrapingBeeUrl = `https://app.scrapingbee.com/api/v1?api_key=${SCRAPING_BEE_API_KEY}&url=${encodeURIComponent(formattedUrl.toString())}&render_js=false`
    
    const response = await fetch(scrapingBeeUrl)
    if (!response.ok) {
      console.error('ScrapingBee API error:', response.status, response.statusText);
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    
    if (!doc) {
      throw new Error('Failed to parse HTML document')
    }

    const title = doc.querySelector('title')?.textContent || ''
    const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || ''
    const content = doc.body?.textContent || ''

    const projectId = 'xmyhncwloxszvlckinik';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!serviceRoleKey) {
      throw new Error('Service role key not configured');
    }

    console.log('Calling analyze-keywords function...');
    const keywordsResponse = await fetch(
      `https://${projectId}.supabase.co/functions/v1/analyze-keywords`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          title,
          description: metaDescription,
        }),
      }
    );

    if (!keywordsResponse.ok) {
      const errorData = await keywordsResponse.json();
      console.error('Keywords analysis error:', keywordsResponse.status, errorData);
      
      if (keywordsResponse.status === 429 && errorData.error === 'QUOTA_EXCEEDED') {
        return new Response(
          JSON.stringify(errorData),
          { 
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      throw new Error(`Failed to analyze keywords: ${JSON.stringify(errorData)}`);
    }

    const keywordsData = await keywordsResponse.json();
    console.log('Keywords analysis result:', keywordsData);
    
    if (!keywordsData.keywords) {
      throw new Error('Invalid keywords analysis response');
    }

    const keywords = keywordsData.keywords;

    // Optimize links extraction
    const links = Array.from(doc.querySelectorAll('a'))
      .reduce((acc, link) => {
        const href = link.getAttribute('href')
        const text = link.textContent?.trim()
        if (href && text) {
          const isInternal = href.startsWith('/') || href.includes(new URL(url).hostname)
          acc.push({
            url: href,
            text,
            type: isInternal ? 'internal' : 'external'
          })
        }
        return acc
      }, [] as Array<{ url: string; text: string; type: 'internal' | 'external' }>);

    const pageCount = new Set(
      links
        .filter(link => link.type === 'internal')
        .map(link => link.url)
    ).size;

    const analysis = {
      title,
      description: metaDescription,
      keywords,
      links
    };

    const seoScore = calculateSeoScore(analysis);
    const suggestions = generateSuggestions(analysis);

    const analysisResult = {
      title,
      description: metaDescription,
      pageCount,
      keywords,
      links,
      seoScore,
      suggestions,
      niche: keywordsData.niche
    };

    // Cache the result
    analysisCache.set(url, {
      data: analysisResult,
      timestamp: Date.now()
    });

    // Store in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: insertError } = await supabase
      .from('seo_analyses')
      .insert({
        url,
        title,
        description: metaDescription,
        page_count: pageCount,
        keywords,
        links,
        suggestions
      });

    if (insertError) {
      console.error('Error inserting analysis:', insertError);
      // Don't throw error here, just log it to not block the response
    }

    return new Response(
      JSON.stringify(analysisResult),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error in analyze-seo function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});