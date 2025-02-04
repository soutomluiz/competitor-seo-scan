import React, { useState } from "react";
import { UrlInput } from "./UrlInput";
import { analyzeSeo } from "@/services/seoAnalysis";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { SeoScore } from "./SeoScore";

interface ComparisonResult {
  url: string;
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
  keywords: { text: string; count: number }[];
  links: { url: string; text: string; type: "internal" | "external" }[];
}

interface ComparisonInsight {
  message: string;
  type: "positive" | "negative" | "neutral";
}

export const ComparisonMode = () => {
  const [site1, setSite1] = useState<ComparisonResult | null>(null);
  const [site2, setSite2] = useState<ComparisonResult | null>(null);
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const { toast } = useToast();

  const handleAnalyzeSite1 = async (url: string) => {
    setIsLoading1(true);
    try {
      const result = await analyzeSeo(url);
      setSite1({
        url,
        seoScore: result.seoScore,
        keywords: result.keywords,
        links: result.links,
      });
      toast({
        title: "Análise Concluída",
        description: "O primeiro site foi analisado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao analisar o primeiro site.",
        variant: "destructive",
      });
    } finally {
      setIsLoading1(false);
    }
  };

  const handleAnalyzeSite2 = async (url: string) => {
    setIsLoading2(true);
    try {
      const result = await analyzeSeo(url);
      setSite2({
        url,
        seoScore: result.seoScore,
        keywords: result.keywords,
        links: result.links,
      });
      toast({
        title: "Análise Concluída",
        description: "O segundo site foi analisado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao analisar o segundo site.",
        variant: "destructive",
      });
    } finally {
      setIsLoading2(false);
    }
  };

  const getScoreComparison = (score1: number, score2: number) => {
    if (score1 > score2) return <CheckCircle className="text-green-500 h-4 w-4" />;
    if (score1 < score2) return <XCircle className="text-red-500 h-4 w-4" />;
    return <ArrowRight className="text-yellow-500 h-4 w-4" />;
  };

  const generateInsights = (site1: ComparisonResult, site2: ComparisonResult): ComparisonInsight[] => {
    const insights: ComparisonInsight[] = [];
    
    // Compare internal links
    const internalLinks1 = site1.links.filter(l => l.type === "internal").length;
    const internalLinks2 = site2.links.filter(l => l.type === "internal").length;
    if (Math.abs(internalLinks1 - internalLinks2) > 5) {
      insights.push({
        message: `${new URL(internalLinks1 > internalLinks2 ? site1.url : site2.url).hostname} possui mais links internos (${Math.abs(internalLinks1 - internalLinks2)} a mais)`,
        type: "neutral"
      });
    }

    // Compare SEO scores
    if (Math.abs(site1.seoScore.score - site2.seoScore.score) > 10) {
      insights.push({
        message: `${new URL(site1.seoScore.score > site2.seoScore.score ? site1.url : site2.url).hostname} tem melhor SEO geral`,
        type: site1.seoScore.score > site2.seoScore.score ? "positive" : "negative"
      });
    }

    // Compare keywords
    const commonKeywords = site1.keywords.filter(kw1 =>
      site2.keywords.some(kw2 => kw2.text === kw1.text)
    ).length;
    insights.push({
      message: `${commonKeywords} palavras-chave em comum encontradas`,
      type: commonKeywords > 5 ? "positive" : "neutral"
    });

    return insights;
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold mb-4">Site 1</h3>
          <UrlInput onAnalyze={handleAnalyzeSite1} isLoading={isLoading1} />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Site 2</h3>
          <UrlInput onAnalyze={handleAnalyzeSite2} isLoading={isLoading2} />
        </div>
      </div>

      {site1 && site2 && (
        <div className="space-y-8">
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="p-6">
              <h4 className="text-lg font-semibold mb-4">{new URL(site1.url).hostname}</h4>
              <SeoScore score={site1.seoScore.score} details={site1.seoScore.details} />
            </Card>
            <Card className="p-6">
              <h4 className="text-lg font-semibold mb-4">{new URL(site2.url).hostname}</h4>
              <SeoScore score={site2.seoScore.score} details={site2.seoScore.details} />
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-6">Insights da Comparação</h3>
            <div className="space-y-4">
              {generateInsights(site1, site2).map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    insight.type === "positive"
                      ? "bg-green-50 border border-green-200"
                      : insight.type === "negative"
                      ? "bg-red-50 border border-red-200"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  {insight.message}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-6">Métricas Detalhadas</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Métrica</TableHead>
                  <TableHead>{new URL(site1.url).hostname}</TableHead>
                  <TableHead className="w-[100px]">Comparação</TableHead>
                  <TableHead>{new URL(site2.url).hostname}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>SEO Score Geral</TableCell>
                  <TableCell>{site1.seoScore.score}</TableCell>
                  <TableCell>
                    {getScoreComparison(site1.seoScore.score, site2.seoScore.score)}
                  </TableCell>
                  <TableCell>{site2.seoScore.score}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Score do Título</TableCell>
                  <TableCell>{site1.seoScore.details.titleScore}%</TableCell>
                  <TableCell>
                    {getScoreComparison(
                      site1.seoScore.details.titleScore,
                      site2.seoScore.details.titleScore
                    )}
                  </TableCell>
                  <TableCell>{site2.seoScore.details.titleScore}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Score da Descrição</TableCell>
                  <TableCell>{site1.seoScore.details.descriptionScore}%</TableCell>
                  <TableCell>
                    {getScoreComparison(
                      site1.seoScore.details.descriptionScore,
                      site2.seoScore.details.descriptionScore
                    )}
                  </TableCell>
                  <TableCell>{site2.seoScore.details.descriptionScore}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Links Internos</TableCell>
                  <TableCell>
                    {site1.links.filter((l) => l.type === "internal").length}
                  </TableCell>
                  <TableCell>
                    {getScoreComparison(
                      site1.links.filter((l) => l.type === "internal").length,
                      site2.links.filter((l) => l.type === "internal").length
                    )}
                  </TableCell>
                  <TableCell>
                    {site2.links.filter((l) => l.type === "internal").length}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Links Externos</TableCell>
                  <TableCell>
                    {site1.links.filter((l) => l.type === "external").length}
                  </TableCell>
                  <TableCell>
                    {getScoreComparison(
                      site1.links.filter((l) => l.type === "external").length,
                      site2.links.filter((l) => l.type === "external").length
                    )}
                  </TableCell>
                  <TableCell>
                    {site2.links.filter((l) => l.type === "external").length}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-6">Palavras-chave em Comum</h3>
            <div className="flex flex-wrap gap-2">
              {site1.keywords
                .filter((kw1) =>
                  site2.keywords.some((kw2) => kw2.text === kw1.text)
                )
                .map((keyword) => (
                  <Badge key={keyword.text} variant="secondary">
                    {keyword.text} ({keyword.count})
                  </Badge>
                ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};