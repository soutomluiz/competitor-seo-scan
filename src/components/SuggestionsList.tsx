import { AnalysisCard } from "./AnalysisCard";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SuggestionsListProps {
  suggestions: string[];
}

export const SuggestionsList = ({ suggestions }: SuggestionsListProps) => {
  if (!suggestions.length) return null;

  const getSuggestionPriority = (suggestion: string): "high" | "medium" | "low" => {
    const lowercaseSuggestion = suggestion.toLowerCase();
    if (
      lowercaseSuggestion.includes("não tem") ||
      lowercaseSuggestion.includes("falta") ||
      lowercaseSuggestion.includes("urgentemente")
    ) {
      return "high";
    }
    if (
      lowercaseSuggestion.includes("pode melhorar") ||
      lowercaseSuggestion.includes("considere")
    ) {
      return "medium";
    }
    return "low";
  };

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return {
          icon: XCircle,
          color: "text-destructive",
          badge: "bg-destructive/10 text-destructive",
          text: "Alta Prioridade"
        };
      case "medium":
        return {
          icon: AlertCircle,
          color: "text-yellow-500",
          badge: "bg-yellow-500/10 text-yellow-500",
          text: "Média Prioridade"
        };
      case "low":
        return {
          icon: CheckCircle2,
          color: "text-primary",
          badge: "bg-primary/10 text-primary",
          text: "Baixa Prioridade"
        };
    }
  };

  return (
    <AnalysisCard title="O Que Melhorar">
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Com base na análise do seu site, identificamos as seguintes oportunidades de melhoria:
        </p>
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => {
            const priority = getSuggestionPriority(suggestion);
            const { icon: Icon, color, badge, text } = getPriorityColor(priority);
            
            return (
              <div key={index} className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                <Icon className={`h-5 w-5 ${color} flex-shrink-0 mt-0.5`} />
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{suggestion}</p>
                    <Badge variant="outline" className={`ml-2 ${badge}`}>
                      {text}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AnalysisCard>
  );
};