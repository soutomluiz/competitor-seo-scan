import { supabase } from "@/integrations/supabase/client";

interface SeoAnalysisResult {
  title: string;
  description: string;
  pageCount: number;
  keywords: { text: string; count: number }[];
  links: { url: string; text: string; type: "internal" | "external" }[];
}

export const analyzeSeo = async (url: string): Promise<SeoAnalysisResult> => {
  // Check authentication first
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("Authentication required to perform analysis");
  }

  try {
    const { data, error } = await supabase.functions.invoke('analyze-seo', {
      body: { url, userId: session.user.id }
    });

    if (error) {
      console.error('Analysis error:', error);
      throw new Error('Failed to analyze website');
    }

    return data;
  } catch (error) {
    console.error('Service error:', error);
    throw new Error('Failed to analyze website. Please try again.');
  }
};