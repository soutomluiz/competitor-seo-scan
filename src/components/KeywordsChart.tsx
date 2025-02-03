import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { AnalysisCard } from "./AnalysisCard";

interface KeywordsChartProps {
  keywords: { text: string; count: number }[];
}

export const KeywordsChart = ({ keywords }: KeywordsChartProps) => {
  const data = keywords
    .slice(0, 10)
    .map(({ text, count }) => ({
      keyword: text,
      count,
    }));

  return (
    <AnalysisCard title="Top Keywords">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="keyword" angle={-45} textAnchor="end" height={70} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#86A789" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AnalysisCard>
  );
};