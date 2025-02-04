import { supabase } from "@/integrations/supabase/client";

interface SeoAnalysisResult {
  title: string;
  description: string;
  pageCount: number;
  keywords: { text: string; count: number }[];
  links: { url: string; text: string; type: "internal" | "external" }[];
  seoScore: {
    score: number;
    details: {
      titleScore: number;
      descriptionScore: number;
      keywordsScore: number;
      internalLinksScore: number;
      externalLinksScore: number;
    };
  };
  suggestions: string[];
  reportUrl?: string;
}

export const analyzeSeo = async (url: string): Promise<SeoAnalysisResult> => {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-seo', {
      body: { url }
    });

    if (error) {
      console.error('Analysis error:', error);
      throw new Error('Failed to analyze website');
    }

    // Generate PDF report
    const { data: pdfData, error: pdfError } = await supabase.functions.invoke('generate-pdf', {
      body: {
        url,
        title: data.title,
        description: data.description,
        keywords: data.keywords,
        links: data.links,
        seoScore: data.seoScore,
        suggestions: data.suggestions
      }
    });

    if (pdfError) {
      console.error('PDF generation error:', pdfError);
      throw new Error('Failed to generate PDF report');
    }

    let reportUrl;
    if (pdfData && typeof pdfData === 'string') {
      try {
        // Convert the base64 data to a Blob
        const binaryData = atob(pdfData);
        const bytes = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
          bytes[i] = binaryData.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        reportUrl = URL.createObjectURL(blob);
      } catch (e) {
        console.error('Error creating PDF URL:', e);
        throw new Error('Failed to create PDF URL');
      }
    }

    return {
      ...data,
      suggestions: data.suggestions || [],
      reportUrl
    };
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};