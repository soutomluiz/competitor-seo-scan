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

  const getScoreExplanation = (score: number, details: SeoScoreDetails): string => {
    const lowestScore = Math.min(
      details.titleScore,
      details.descriptionScore,
      details.keywordsScore,
      details.internalLinksScore,
      details.externalLinksScore
    );

    if (score >= 80) {
      if (lowestScore === details.internalLinksScore) {
        return "Seu site está bem otimizado, mas pode melhorar em links internos.";
      } else if (lowestScore === details.externalLinksScore) {
        return "Excelente otimização! Considere adicionar mais links externos relevantes.";
      } else if (lowestScore === details.keywordsScore) {
        return "Ótimo SEO! Pode melhorar a distribuição de palavras-chave.";
      }
      return "Parabéns! Seu site está muito bem otimizado para SEO.";
    } else if (score >= 60) {
      if (details.titleScore < 70) {
        return "SEO razoável. O título da página precisa ser otimizado.";
      } else if (details.descriptionScore < 70) {
        return "SEO médio. A meta descrição pode ser melhorada.";
      } else if (details.keywordsScore < 70) {
        return "SEO adequado, mas precisa melhorar as palavras-chave.";
      }
      return "SEO satisfatório, com espaço para melhorias.";
    } else {
      if (details.titleScore < 50 && details.descriptionScore < 50) {
        return "Título e meta descrição precisam ser otimizados urgentemente.";
      } else if (details.keywordsScore < 50) {
        return "É necessário melhorar a otimização de palavras-chave.";
      }
      return "SEO precisa de atenção. Siga as sugestões para melhorar.";
    }
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
        <div className="text-center space-y-4">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getScoreColor(score)} text-white`}>
            <span className="text-3xl font-bold">{score}</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {getScoreExplanation(score, details)}
          </p>
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