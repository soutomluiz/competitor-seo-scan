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

    return {
      ...data,
      suggestions: data.suggestions || [],
      reportUrl: data.report_url
    };
  } catch (error) {
    console.error('Service error:', error);
    throw new Error('Failed to analyze website. Please try again.');
  }
};