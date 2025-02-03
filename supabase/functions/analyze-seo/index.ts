import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SeoAnalysisResult {
  title: string;
  description: string;
  pageCount: number;
  keywords: { text: string; count: number }[];
  links: { url: string; text: string; type: "internal" | "external" }[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { url, userId } = await req.json()
    console.log(`Analyzing URL: ${url} for user: ${userId}`)

    const SCRAPING_BEE_API_KEY = Deno.env.get('SCRAPING_BEE_API_KEY')
    if (!SCRAPING_BEE_API_KEY) {
      throw new Error('ScrapingBee API key not configured')
    }

    // Call ScrapingBee API
    const scrapingBeeUrl = `https://app.scrapingbee.com/api/v1?api_key=${SCRAPING_BEE_API_KEY}&url=${encodeURIComponent(url)}&render_js=false`
    const response = await fetch(scrapingBeeUrl)
    const html = await response.text()

    // Parse HTML using DOMParser
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    // Extract title
    const title = doc.querySelector('title')?.textContent || ''
    
    // Extract meta description
    const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || ''
    
    // Extract and analyze keywords from content
    const content = doc.body.textContent || ''
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
    
    const keywordCount: Record<string, number> = {}
    words.forEach(word => {
      keywordCount[word] = (keywordCount[word] || 0) + 1
    })
    
    const keywords = Object.entries(keywordCount)
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)

    // Extract links
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

    // Count pages (estimate based on internal links)
    const pageCount = new Set(
      links
        .filter(link => link.type === 'internal')
        .map(link => link.url)
    ).size

    const analysisResult: SeoAnalysisResult = {
      title,
      description: metaDescription,
      pageCount,
      keywords,
      links
    }

    // Store results in Supabase
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
        user_id: userId
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
      JSON.stringify({ error: error.message }),
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