import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { AnalysisCard } from "./AnalysisCard";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface KeywordsChartProps {
  keywords: { text: string; count: number }[];
}

export const KeywordsChart = ({ keywords }: KeywordsChartProps) => {
  // Calculate relevance score based on word length and frequency
  const getRelevanceScore = (keyword: string, count: number) => {
    const lengthFactor = Math.min(keyword.length / 10, 1);
    const frequencyFactor = count / Math.max(...keywords.map(k => k.count));
    return (lengthFactor * 0.4 + frequencyFactor * 0.6) * 100;
  };

  const data = keywords
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map(({ text, count }) => ({
      keyword: text,
      count,
      relevance: getRelevanceScore(text, count),
    }));

  const getRelevanceColor = (score: number) => {
    if (score >= 80) return "#86A789";
    if (score >= 60) return "#B2C8BA";
    return "#D2E3C8";
  };

  const generateRelatedKeywords = (keyword: string): string[] => {
    const commonPrefixes = ['como', 'melhor', 'top', 'guia'];
    const commonSuffixes = ['dicas', 'tutorial', 'profissional', 'avançado'];
    
    return [
      `${commonPrefixes[Math.floor(Math.random() * commonPrefixes.length)]} ${keyword}`,
      `${keyword} ${commonSuffixes[Math.floor(Math.random() * commonSuffixes.length)]}`,
      `${keyword} online`,
    ];
  };

  const relatedKeywordSuggestions = data
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 3)
    .map(item => ({
      mainKeyword: item.keyword,
      related: generateRelatedKeywords(item.keyword),
      relevance: item.relevance,
    }));

  return (
    <AnalysisCard title="Top Keywords">
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          As palavras-chave são classificadas por relevância SEO, considerando frequência e impacto no ranqueamento.
        </p>
        <div className="h-[320px] w-full"> {/* Adjusted height */}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              margin={{ top: 20, right: 30, left: 20, bottom: 100 }} // Increased bottom margin
              layout="vertical" // Changed to vertical layout for better label display
            >
              <XAxis type="number" />
              <YAxis 
                dataKey="keyword"
                type="category"
                width={150} // Fixed width for labels
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value, name, props) => {
                  if (name === "count") {
                    return [`${value} ocorrências`, "Frequência"];
                  }
                  return [`${Math.round(Number(value))}% relevância`, "Relevância SEO"];
                }}
                labelFormatter={(label) => `Palavra-chave: ${label}`}
              />
              <Bar dataKey="count" maxBarSize={30}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={getRelevanceColor(entry.relevance)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap justify-center gap-4 text-sm mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#86A789" }} />
            <span>Alta Relevância</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#B2C8BA" }} />
            <span>Média Relevância</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#D2E3C8" }} />
            <span>Baixa Relevância</span>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <h4 className="font-semibold text-lg">Sugestões de Palavras-chave Relacionadas</h4>
          <p className="text-sm text-muted-foreground">
            Considere adicionar estas palavras-chave relacionadas para melhorar seu SEO:
          </p>
          <ScrollArea className="h-[200px] rounded-md border p-4">
            <div className="space-y-6">
              {relatedKeywordSuggestions.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h5 className="font-medium">{item.mainKeyword}</h5>
                    <Badge 
                      variant="outline" 
                      className={`${
                        item.relevance >= 80 
                          ? 'bg-primary/10 text-primary' 
                          : item.relevance >= 60 
                          ? 'bg-yellow-500/10 text-yellow-500' 
                          : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      {item.relevance >= 80 
                        ? 'Alta Relevância' 
                        : item.relevance >= 60 
                        ? 'Média Relevância' 
                        : 'Baixa Relevância'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {item.related.map((related, idx) => (
                      <div 
                        key={idx}
                        className="text-sm p-2 rounded-md bg-secondary/50 border border-border/50"
                      >
                        {related}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </AnalysisCard>
  );
};