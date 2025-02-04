import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
import { extractKeywords } from "./textProcessing.ts";
import { generateSuggestions, calculateSeoScore } from "./seoAnalysis.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    console.log(`Analyzing URL: ${url}`)

    // Validate and format URL
    let formattedUrl;
    try {
      // Remove trailing colon and slash if present
      let cleanUrl = url.replace(/:\/*$/, '');
      
      // Ensure URL has protocol
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = `https://${cleanUrl}`;
      }

      formattedUrl = new URL(cleanUrl);

      // Validate domain format (must include at least one dot)
      if (!formattedUrl.hostname.includes('.')) {
        throw new Error('Invalid domain format');
      }

      console.log('Formatted URL:', formattedUrl.toString());
    } catch (error) {
      console.error('URL Validation Error:', error);
      return new Response(
        JSON.stringify({
          error: 'Invalid URL format',
          details: error.message
        }),
        { 
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const SCRAPING_BEE_API_KEY = Deno.env.get('SCRAPING_BEE_API_KEY')
    if (!SCRAPING_BEE_API_KEY) {
      throw new Error('ScrapingBee API key not configured')
    }

    // Call ScrapingBee API with properly formatted URL
    const scrapingBeeUrl = `https://app.scrapingbee.com/api/v1?api_key=${SCRAPING_BEE_API_KEY}&url=${encodeURIComponent(formattedUrl.toString())}&render_js=false`
    console.log('Calling ScrapingBee with URL:', scrapingBeeUrl);
    
    const response = await fetch(scrapingBeeUrl)
    if (!response.ok) {
      console.error('ScrapingBee API error:', response.status, response.statusText);
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text()

    // Parse HTML
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    
    if (!doc) {
      throw new Error('Failed to parse HTML document')
    }

    // Extract page data
    const title = doc.querySelector('title')?.textContent || ''
    const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || ''
    const content = doc.body?.textContent || ''
    
    // Extract keywords using NLP
    const keywords = extractKeywords(content)

    // Extract and analyze links
    const links = Array.from(doc.querySelectorAll('a'))
      .map(link => {
        const href = link.getAttribute('href') || ''
        const text = link.textContent || ''
        const isInternal = href.startsWith('/') || href.includes(new URL(url).hostname)
        return {
          url: href,
          text: text.trim(),
          type: isInternal ? 'internal' : 'external' as const
        }
      })
      .filter(link => link.url && link.text)

    // Count pages
    const pageCount = new Set(
      links
        .filter(link => link.type === 'internal')
        .map(link => link.url)
    ).size

    // Generate analysis
    const analysis = {
      title,
      description: metaDescription,
      keywords,
      links
    }

    const seoScore = calculateSeoScore(analysis)
    const suggestions = generateSuggestions(analysis)

    const analysisResult = {
      title,
      description: metaDescription,
      pageCount,
      keywords,
      links,
      seoScore,
      suggestions
    }

    // Store in Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

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
      })

    if (insertError) {
      console.error('Error inserting analysis:', insertError)
      throw new Error('Failed to store analysis results')
    }

    return new Response(
      JSON.stringify(analysisResult),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error in analyze-seo function:', error)
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
    )
  }
})