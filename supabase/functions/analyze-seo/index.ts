import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Common words to filter out
const stopWords = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were',
  'will', 'with', 'home', 'contact', 'terms', 'privacy', 'policy', 'about',
  'menu', 'click', 'here', 'read', 'more', 'this', 'page', 'website'
]);

// SEO scoring criteria
const seoScoring = {
  titleLength: {
    min: 30,
    max: 60,
    weight: 15
  },
  descriptionLength: {
    min: 120,
    max: 160,
    weight: 25
  },
  keywordsCount: {
    min: 5,
    max: 15,
    weight: 20
  },
  internalLinksCount: {
    min: 3,
    weight: 20
  },
  externalLinksCount: {
    min: 2,
    weight: 20
  }
};

function generateSuggestions(analysis: {
  title: string;
  description: string;
  keywords: { text: string; count: number }[];
  links: { type: 'internal' | 'external' }[];
}): string[] {
  const suggestions: string[] = [];

  // Title suggestions
  if (!analysis.title) {
    suggestions.push("Adicione um título à sua página - é um elemento SEO crucial.");
  } else if (analysis.title.length < seoScoring.titleLength.min) {
    suggestions.push(`Seu título tem apenas ${analysis.title.length} caracteres. Considere expandí-lo para pelo menos ${seoScoring.titleLength.min} caracteres para melhor SEO.`);
  } else if (analysis.title.length > seoScoring.titleLength.max) {
    suggestions.push(`Seu título tem ${analysis.title.length} caracteres. Considere reduzi-lo para no máximo ${seoScoring.titleLength.max} caracteres para melhor SEO.`);
  }

  // Description suggestions
  if (!analysis.description) {
    suggestions.push("Adicione uma meta descrição à sua página para melhorar a visibilidade nos resultados de busca.");
  } else if (analysis.description.length < seoScoring.descriptionLength.min) {
    suggestions.push(`Sua meta descrição tem apenas ${analysis.description.length} caracteres. Considere expandí-la para pelo menos ${seoScoring.descriptionLength.min} caracteres.`);
  } else if (analysis.description.length > seoScoring.descriptionLength.max) {
    suggestions.push(`Sua meta descrição tem ${analysis.description.length} caracteres. Considere reduzi-la para no máximo ${seoScoring.descriptionLength.max} caracteres.`);
  }

  // Keywords suggestions
  if (analysis.keywords.length < seoScoring.keywordsCount.min) {
    suggestions.push(`Seu site tem poucas palavras-chave (${analysis.keywords.length}). Tente incluir mais termos relevantes para seu conteúdo.`);
  }

  // Links suggestions
  const internalLinks = analysis.links.filter(link => link.type === 'internal').length;
  const externalLinks = analysis.links.filter(link => link.type === 'external').length;

  if (internalLinks < seoScoring.internalLinksCount.min) {
    suggestions.push(`Seu site tem poucos links internos (${internalLinks}). Adicione mais links entre suas páginas para melhorar a navegação.`);
  }
  if (externalLinks < seoScoring.externalLinksCount.min) {
    suggestions.push(`Seu site tem poucos links externos (${externalLinks}). Considere adicionar links para recursos relevantes e confiáveis.`);
  }

  return suggestions;
}

function calculateSeoScore(analysis: {
  title: string;
  description: string;
  keywords: { text: string; count: number }[];
  links: { type: 'internal' | 'external' }[];
}): {
  score: number;
  details: {
    titleScore: number;
    descriptionScore: number;
    keywordsScore: number;
    internalLinksScore: number;
    externalLinksScore: number;
  };
} {
  // Title score
  const titleLength = analysis.title.length;
  const titleScore = titleLength >= seoScoring.titleLength.min && 
    titleLength <= seoScoring.titleLength.max ? 
    seoScoring.titleLength.weight : 
    (seoScoring.titleLength.weight * 0.5);

  // Description score
  const descLength = analysis.description.length;
  const descriptionScore = descLength >= seoScoring.descriptionLength.min && 
    descLength <= seoScoring.descriptionLength.max ? 
    seoScoring.descriptionLength.weight : 
    (seoScoring.descriptionLength.weight * 0.5);

  // Keywords score
  const keywordsCount = analysis.keywords.length;
  const keywordsScore = keywordsCount >= seoScoring.keywordsCount.min && 
    keywordsCount <= seoScoring.keywordsCount.max ? 
    seoScoring.keywordsCount.weight : 
    (seoScoring.keywordsCount.weight * 0.5);

  // Links scores
  const internalLinks = analysis.links.filter(link => link.type === 'internal').length;
  const externalLinks = analysis.links.filter(link => link.type === 'external').length;
  
  const internalLinksScore = internalLinks >= seoScoring.internalLinksCount.min ? 
    seoScoring.internalLinksCount.weight : 
    (seoScoring.internalLinksCount.weight * internalLinks / seoScoring.internalLinksCount.min);

  const externalLinksScore = externalLinks >= seoScoring.externalLinksCount.min ? 
    seoScoring.externalLinksCount.weight : 
    (seoScoring.externalLinksCount.weight * externalLinks / seoScoring.externalLinksCount.min);

  const totalScore = Math.round(
    titleScore + 
    descriptionScore + 
    keywordsScore + 
    internalLinksScore + 
    externalLinksScore
  );

  return {
    score: totalScore,
    details: {
      titleScore,
      descriptionScore,
      keywordsScore,
      internalLinksScore,
      externalLinksScore
    }
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    console.log(`Analyzing URL: ${url}`)

    const SCRAPING_BEE_API_KEY = Deno.env.get('SCRAPING_BEE_API_KEY')
    if (!SCRAPING_BEE_API_KEY) {
      throw new Error('ScrapingBee API key not configured')
    }

    // Call ScrapingBee API
    const scrapingBeeUrl = `https://app.scrapingbee.com/api/v1?api_key=${SCRAPING_BEE_API_KEY}&url=${encodeURIComponent(url)}&render_js=false`
    const response = await fetch(scrapingBeeUrl)
    const html = await response.text()

    // Parse HTML using deno-dom
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    
    if (!doc) {
      throw new Error('Failed to parse HTML document')
    }

    // Extract title
    const title = doc.querySelector('title')?.textContent || ''
    
    // Extract meta description
    const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || ''
    
    // Extract and analyze keywords from content
    const content = doc.body?.textContent || ''
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word.toLowerCase()))
    
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

    // Calculate SEO score and generate suggestions
    const seoAnalysis = {
      title,
      description: metaDescription,
      keywords,
      links
    };
    const seoScore = calculateSeoScore(seoAnalysis);
    const suggestions = generateSuggestions(seoAnalysis);

    const analysisResult = {
      title,
      description: metaDescription,
      pageCount,
      keywords,
      links,
      seoScore,
      suggestions
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
