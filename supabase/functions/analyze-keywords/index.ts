import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('Gemini API key not configured');
      throw new Error('Gemini API key not configured');
    }

    const { content, title, description } = await req.json();
    
    if (!content) {
      throw new Error('Content is required for analysis');
    }

    const prompt = `
      Analyze the following website content and identify:
      1. The main niche/topic of the website
      2. The 15 most relevant SEO keywords, with their estimated frequencies

      Website Title: ${title}
      Description: ${description}
      Content: ${content.substring(0, 2000)}...

      Respond in JSON format with this structure:
      {
        "niche": "identified niche",
        "keywords": [
          {"text": "keyword", "count": frequency_number}
        ]
      }

      Make sure to:
      1. Only include relevant keywords
      2. Provide realistic frequency counts
      3. Focus on SEO-valuable terms
      4. Return valid JSON
    `;

    console.log('Sending request to Gemini API...');
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 1,
          topP: 1,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      // Check for quota exceeded error
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'QUOTA_EXCEEDED',
            message: 'Gemini API quota exceeded. Please check your billing details or try again later.'
          }),
          { 
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response:', data);

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API');
    }

    // Extract the JSON string from the response text
    const jsonString = data.candidates[0].content.parts[0].text.trim();
    // Remove any markdown code block markers if present
    const cleanJsonString = jsonString.replace(/```json\n?|\n?```/g, '').trim();
    
    const result = JSON.parse(cleanJsonString);
    console.log('Parsed result:', result);

    if (!result.keywords || !Array.isArray(result.keywords)) {
      throw new Error('Invalid keywords format in Gemini response');
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in analyze-keywords function:', error);
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