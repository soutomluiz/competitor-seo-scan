import { AnalysisCard } from "./AnalysisCard";
import { AlertCircle } from "lucide-react";

interface SuggestionsListProps {
  suggestions: string[];
}

export const SuggestionsList = ({ suggestions }: SuggestionsListProps) => {
  if (!suggestions.length) return null;

  return (
    <AnalysisCard title="SEO Suggestions">
      <div className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="flex items-start gap-3 text-muted-foreground">
            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p>{suggestion}</p>
          </div>
        ))}
      </div>
    </AnalysisCard>
  );
};