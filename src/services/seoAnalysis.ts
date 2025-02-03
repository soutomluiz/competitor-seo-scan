import { supabase } from "@/integrations/supabase/client";

interface SeoAnalysisResult {
  title: string;
  description: string;
  pageCount: number;
  keywords: { text: string; count: number }[];
  links: { url: string; text: string; type: "internal" | "external" }[];
}

export const analyzeSeo = async (url: string): Promise<SeoAnalysisResult> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User must be authenticated to perform analysis");
  }

  const { data, error } = await supabase.functions.invoke('analyze-seo', {
    body: { url, userId: user.id }
  });

  if (error) {
    console.error('Analysis error:', error);
    throw new Error('Failed to analyze website');
  }

  return data;
};