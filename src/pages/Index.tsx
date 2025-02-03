import { useState } from "react";
import { UrlInput } from "@/components/UrlInput";
import { KeywordsChart } from "@/components/KeywordsChart";
import { LinksTable } from "@/components/LinksTable";
import { SeoMetrics } from "@/components/SeoMetrics";
import { useToast } from "@/components/ui/use-toast";

interface AnalysisResult {
  title: string;
  description: string;
  pageCount: number;
  keywords: { text: string; count: number }[];
  links: { url: string; text: string; type: "internal" | "external" }[];
}

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async (url: string) => {
    setIsLoading(true);
    try {
      // Simulated API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock data - replace with actual API response
      setResult({
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
      });

      toast({
        title: "Analysis Complete",
        description: "Website analysis has been completed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze website. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted to-background">
      <div className="container py-12 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">SEO Analysis Tool</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enter a website URL to analyze its SEO performance, discover keywords, and explore link structure.
          </p>
        </div>

        <UrlInput onAnalyze={handleAnalyze} isLoading={isLoading} />

        {result && (
          <div className="grid gap-8 md:grid-cols-2">
            <div className="md:col-span-2">
              <SeoMetrics
                title={result.title}
                description={result.description}
                pageCount={result.pageCount}
              />
            </div>
            <KeywordsChart keywords={result.keywords} />
            <div className="md:col-span-2">
              <LinksTable links={result.links} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;