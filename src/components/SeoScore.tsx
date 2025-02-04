import { AnalysisCard } from "./AnalysisCard";
import { Progress } from "@/components/ui/progress";

interface SeoScoreDetails {
  titleScore: number;
  descriptionScore: number;
  keywordsScore: number;
  internalLinksScore: number;
  externalLinksScore: number;
}

interface SeoScoreProps {
  score: number;
  details: SeoScoreDetails;
}

export const SeoScore = ({ score, details }: SeoScoreProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const scoreItems = [
    { label: "Title", score: details.titleScore },
    { label: "Description", score: details.descriptionScore },
    { label: "Keywords", score: details.keywordsScore },
    { label: "Internal Links", score: details.internalLinksScore },
    { label: "External Links", score: details.externalLinksScore },
  ];

  return (
    <AnalysisCard title="SEO Score">
      <div className="space-y-6">
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getScoreColor(score)} text-white`}>
            <span className="text-3xl font-bold">{score}</span>
          </div>
        </div>
        <div className="space-y-4">
          {scoreItems.map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{item.label}</span>
                <span>{Math.round(item.score)}%</span>
              </div>
              <Progress value={item.score} className="h-2" />
            </div>
          ))}
        </div>
      </div>
    </AnalysisCard>
  );
};