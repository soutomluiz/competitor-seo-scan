export const seoScoring = {
  titleLength: {
    min: 30,
    max: 60,
    weight: 15
  },
  descriptionLength: {
    min: 120,
    max: 160,
    weight: 25
  },
  keywordsCount: {
    min: 5,
    max: 15,
    weight: 20
  },
  internalLinksCount: {
    min: 3,
    weight: 20
  },
  externalLinksCount: {
    min: 2,
    weight: 20
  }
};

interface SeoAnalysis {
  title: string;
  description: string;
  keywords: { text: string; count: number }[];
  links: { type: 'internal' | 'external' }[];
}

export function generateSuggestions(analysis: SeoAnalysis): string[] {
  const suggestions: string[] = [];

  if (!analysis.title) {
    suggestions.push("Adicione um título à sua página - é um elemento SEO crucial.");
  } else if (analysis.title.length < seoScoring.titleLength.min) {
    suggestions.push(`Seu título tem apenas ${analysis.title.length} caracteres. Considere expandí-lo para pelo menos ${seoScoring.titleLength.min} caracteres para melhor SEO.`);
  } else if (analysis.title.length > seoScoring.titleLength.max) {
    suggestions.push(`Seu título tem ${analysis.title.length} caracteres. Considere reduzi-lo para no máximo ${seoScoring.titleLength.max} caracteres para melhor SEO.`);
  }

  if (!analysis.description) {
    suggestions.push("Adicione uma meta descrição à sua página para melhorar a visibilidade nos resultados de busca.");
  } else if (analysis.description.length < seoScoring.descriptionLength.min) {
    suggestions.push(`Sua meta descrição tem apenas ${analysis.description.length} caracteres. Considere expandí-la para pelo menos ${seoScoring.descriptionLength.min} caracteres.`);
  } else if (analysis.description.length > seoScoring.descriptionLength.max) {
    suggestions.push(`Sua meta descrição tem ${analysis.description.length} caracteres. Considere reduzi-la para no máximo ${seoScoring.descriptionLength.max} caracteres.`);
  }

  if (analysis.keywords.length < seoScoring.keywordsCount.min) {
    suggestions.push(`Seu site tem poucas palavras-chave (${analysis.keywords.length}). Tente incluir mais termos relevantes para seu conteúdo.`);
  }

  const internalLinks = analysis.links.filter(link => link.type === 'internal').length;
  const externalLinks = analysis.links.filter(link => link.type === 'external').length;

  if (internalLinks < seoScoring.internalLinksCount.min) {
    suggestions.push(`Seu site tem poucos links internos (${internalLinks}). Adicione mais links entre suas páginas para melhorar a navegação.`);
  }
  if (externalLinks < seoScoring.externalLinksCount.min) {
    suggestions.push(`Seu site tem poucos links externos (${externalLinks}). Considere adicionar links para recursos relevantes e confiáveis.`);
  }

  return suggestions;
}

export function calculateSeoScore(analysis: SeoAnalysis): {
  score: number;
  details: {
    titleScore: number;
    descriptionScore: number;
    keywordsScore: number;
    internalLinksScore: number;
    externalLinksScore: number;
  };
} {
  const titleLength = analysis.title.length;
  const titleScore = titleLength >= seoScoring.titleLength.min && 
    titleLength <= seoScoring.titleLength.max ? 
    seoScoring.titleLength.weight : 
    (seoScoring.titleLength.weight * 0.5);

  const descLength = analysis.description.length;
  const descriptionScore = descLength >= seoScoring.descriptionLength.min && 
    descLength <= seoScoring.descriptionLength.max ? 
    seoScoring.descriptionLength.weight : 
    (seoScoring.descriptionLength.weight * 0.5);

  const keywordsCount = analysis.keywords.length;
  const keywordsScore = keywordsCount >= seoScoring.keywordsCount.min && 
    keywordsCount <= seoScoring.keywordsCount.max ? 
    seoScoring.keywordsCount.weight : 
    (seoScoring.keywordsCount.weight * 0.5);

  const internalLinks = analysis.links.filter(link => link.type === 'internal').length;
  const externalLinks = analysis.links.filter(link => link.type === 'external').length;
  
  const internalLinksScore = internalLinks >= seoScoring.internalLinksCount.min ? 
    seoScoring.internalLinksCount.weight : 
    (seoScoring.internalLinksCount.weight * internalLinks / seoScoring.internalLinksCount.min);

  const externalLinksScore = externalLinks >= seoScoring.externalLinksCount.min ? 
    seoScoring.externalLinksCount.weight : 
    (seoScoring.externalLinksCount.weight * externalLinks / seoScoring.externalLinksCount.min);

  return {
    score: Math.round(
      titleScore + 
      descriptionScore + 
      keywordsScore + 
      internalLinksScore + 
      externalLinksScore
    ),
    details: {
      titleScore,
      descriptionScore,
      keywordsScore,
      internalLinksScore,
      externalLinksScore
    }
  };
}