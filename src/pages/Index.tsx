import { useState } from "react";
import { UrlInput } from "@/components/UrlInput";
import { KeywordsChart } from "@/components/KeywordsChart";
import { LinksTable } from "@/components/LinksTable";
import { SeoMetrics } from "@/components/SeoMetrics";
import { SeoScore } from "@/components/SeoScore";
import { SuggestionsList } from "@/components/SuggestionsList";
import { AnalysisHistory } from "@/components/AnalysisHistory";
import { useToast } from "@/components/ui/use-toast";
import { analyzeSeo } from "@/services/seoAnalysis";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface AnalysisResult {
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

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async (url: string) => {
    setIsLoading(true);
    try {
      const analysisResult = await analyzeSeo(url);
      setResult(analysisResult);
      
      toast({
        title: "Análise Completa",
        description: "A análise do site foi concluída com sucesso.",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Erro",
        description: "Falha ao analisar o site. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (result?.reportUrl) {
      window.open(result.reportUrl, '_blank');
    } else {
      toast({
        title: "Erro",
        description: "Relatório PDF não disponível.",
        variant: "destructive",
      });
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
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-semibold">Resultados da Análise</h2>
              <Button onClick={handleExport} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2">
              <div className="md:col-span-2">
                <SeoMetrics
                  title={result.title}
                  description={result.description}
                  pageCount={result.pageCount}
                />
              </div>
              <SeoScore
                score={result.seoScore.score}
                details={result.seoScore.details}
              />
              <KeywordsChart keywords={result.keywords} />
              <div className="md:col-span-2">
                <LinksTable links={result.links} />
              </div>
              {result.suggestions && result.suggestions.length > 0 && (
                <div className="md:col-span-2">
                  <SuggestionsList suggestions={result.suggestions} />
                </div>
              )}
            </div>
          </div>
        )}

        <AnalysisHistory />
      </div>
    </div>
  );
};

export default Index;