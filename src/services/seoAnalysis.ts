interface SeoAnalysisResult {
  title: string;
  description: string;
  pageCount: number;
  keywords: { text: string; count: number }[];
  links: { url: string; text: string; type: "internal" | "external" }[];
}

export const analyzeSeo = async (url: string): Promise<SeoAnalysisResult> => {
  // This is a temporary mock implementation
  // Will be replaced with real API calls after Supabase integration
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    title: "Example Website - Home",
    description: "This is an example website meta description for demonstration purposes.",
    pageCount: 5,
    keywords: [
      { text: "example", count: 10 },
      { text: "website", count: 8 },
      { text: "seo", count: 6 },
      { text: "analysis", count: 5 },
      { text: "content", count: 4 },
    ],
    links: [
      { url: "/about", text: "About Us", type: "internal" },
      { url: "/contact", text: "Contact", type: "internal" },
      { url: "https://example.com", text: "External Link", type: "external" },
    ],
  };
};