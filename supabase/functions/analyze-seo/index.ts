
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
import { calculateSeoScore, generateSuggestions } from "./seoAnalysis.ts";

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
      let cleanUrl = url.trim().replace(/:\/*$/, '');
      
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = `https://${cleanUrl}`;
      }

      formattedUrl = new URL(cleanUrl);

      if (!formattedUrl.hostname.includes('.')) {
        throw new Error('Invalid domain format');
      }

      console.log('Formatted URL:', formattedUrl.toString());
    } catch (error) {
      console.error('URL Validation Error:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid URL format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const SCRAPING_BEE_API_KEY = Deno.env.get('SCRAPING_BEE_API_KEY')
    if (!SCRAPING_BEE_API_KEY) {
      console.error('ScrapingBee API key not configured');
      return new Response(
        JSON.stringify({ error: 'ScrapingBee API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Use a try-catch block specifically for the fetch operation
    let response;
    try {
      const scrapingBeeUrl = `https://app.scrapingbee.com/api/v1?api_key=${SCRAPING_BEE_API_KEY}&url=${encodeURIComponent(formattedUrl.toString())}&render_js=false`
      console.log('Calling ScrapingBee with URL:', scrapingBeeUrl);
      
      response = await fetch(scrapingBeeUrl, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        redirect: 'follow',
      });
      
      if (!response.ok) {
        console.error('ScrapingBee API error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error details:', errorText);
        throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
      }
    } catch (fetchError) {
      console.error('Fetch operation failed:', fetchError);
      return new Response(
        JSON.stringify({ 
          error: fetchError.message || 'Failed to fetch website content',
          details: fetchError.stack
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Parse the HTML content
    const html = await response.text();
    if (!html || html.trim() === '') {
      console.error('Empty HTML response received');
      return new Response(
        JSON.stringify({ error: 'Empty response from website' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    if (!doc) {
      console.error('Failed to parse HTML document');
      return new Response(
        JSON.stringify({ error: 'Failed to parse HTML document' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const title = doc.querySelector('title')?.textContent || '';
    const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const content = doc.body?.textContent || '';

    if (!content || content.trim() === '') {
      console.error('Empty page content detected');
      return new Response(
        JSON.stringify({ error: 'Empty page content, unable to analyze' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Call the analyze-keywords function
    const projectId = 'xmyhncwloxszvlckinik';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!serviceRoleKey) {
      console.error('Service role key not configured');
      return new Response(
        JSON.stringify({ error: 'Service role key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Calling analyze-keywords function...');
    let keywordsResponse;
    try {
      keywordsResponse = await fetch(
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
        
        // Check if it's a quota exceeded error and forward it
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
    } catch (keywordsError) {
      console.error('Keywords API call failed:', keywordsError);
      return new Response(
        JSON.stringify({ 
          error: keywordsError.message || 'Failed to analyze keywords', 
          details: keywordsError.stack
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const keywordsData = await keywordsResponse.json();
    console.log('Keywords analysis result:', keywordsData);
    
    if (!keywordsData.keywords || !Array.isArray(keywordsData.keywords)) {
      console.error('Invalid keywords analysis response', keywordsData);
      return new Response(
        JSON.stringify({ error: 'Invalid keywords analysis response' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const keywords = keywordsData.keywords;

    // Process links
    const links = Array.from(doc.querySelectorAll('a') || [])
      .map(link => {
        const href = link.getAttribute('href') || '';
        const text = link.textContent || '';
        let isInternal = false;

        try {
          // Check if the link is relative or has the same hostname
          if (href.startsWith('/') || href.startsWith('./') || href.startsWith('#')) {
            isInternal = true;
          } else {
            const linkUrl = new URL(href, formattedUrl.toString());
            isInternal = linkUrl.hostname === formattedUrl.hostname;
          }
        } catch (e) {
          // If URL parsing fails, we'll default to treating it as external
          console.warn(`Could not parse URL for link: ${href}`, e);
        }

        return {
          url: href,
          text: text.trim(),
          type: isInternal ? 'internal' : 'external' as const
        };
      })
      .filter(link => link.url && link.text);

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

    // Store in Supabase
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error: insertError } = await supabase
        .from('seo_analyses')
        .insert({
          url: formattedUrl.toString(),
          title,
          description: metaDescription,
          page_count: pageCount,
          keywords,
          links,
          suggestions
        });

      if (insertError) {
        console.error('Error inserting analysis:', insertError);
        // Continue even if storage fails, as we want to return the analysis
      }
    } catch (storageError) {
      console.error('Error storing analysis:', storageError);
      // Continue even if storage fails
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
        error: error.message || 'An unknown error occurred',
        details: error.stack || 'No stack trace available'
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
