import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { AnalysisCard } from "./AnalysisCard";

interface KeywordsChartProps {
  keywords: { text: string; count: number }[];
}

export const KeywordsChart = ({ keywords }: KeywordsChartProps) => {
  // Calculate relevance score based on word length and frequency
  const getRelevanceScore = (keyword: string, count: number) => {
    const lengthFactor = Math.min(keyword.length / 10, 1); // Longer words get higher scores, max at 10 chars
    const frequencyFactor = count / Math.max(...keywords.map(k => k.count));
    return (lengthFactor * 0.4 + frequencyFactor * 0.6) * 100; // Weighted score
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
    if (score >= 80) return "#86A789"; // High relevance - Green
    if (score >= 60) return "#B2C8BA"; // Medium relevance - Light green
    return "#D2E3C8"; // Low relevance - Very light green
  };

  return (
    <AnalysisCard title="Top Keywords">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          As palavras-chave são classificadas por relevância SEO, considerando frequência e impacto no ranqueamento.
        </p>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis 
                dataKey="keyword" 
                angle={-45} 
                textAnchor="end" 
                height={70} 
                interval={0}
                fontSize={12}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name, props) => {
                  if (name === "count") {
                    return [`${value} ocorrências`, "Frequência"];
                  }
                  return [`${Math.round(Number(value))}% relevância`, "Relevância SEO"];
                }}
                labelFormatter={(label) => `Palavra-chave: ${label}`}
              />
              <Bar dataKey="count">
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
        <div className="flex justify-center gap-4 text-sm">
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
      </div>
    </AnalysisCard>
  );
};