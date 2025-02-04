// Portuguese stop words and text processing utilities
export const stopWords = new Set([
  // Basic articles and prepositions
  'a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas', 'de', 'do', 'da', 'dos', 'das',
  'em', 'no', 'na', 'nos', 'nas', 'ao', 'aos', 'à', 'às', 'pelo', 'pela', 'pelos', 'pelas',
  'com', 'sem', 'para', 'por',
  
  // Common conjunctions
  'e', 'ou', 'mas', 'porém', 'contudo', 'todavia',
  
  // Common pronouns
  'eu', 'tu', 'ele', 'ela', 'nós', 'vós', 'eles', 'elas',
  'este', 'esta', 'isto', 'esse', 'essa', 'isso', 'aquele', 'aquela', 'aquilo',
  
  // Common verbs
  'é', 'são', 'está', 'estão', 'foi', 'foram', 'ser', 'estar', 'ter', 'haver',
  
  // Basic website navigation terms only
  'menu', 'início', 'contato', 'sobre',
  'cookies', 'aceitar', 'fechar', 'abrir',
  'aqui', 'clique'
]);

export function normalizeText(text: string): string {
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s]/g, ' ') // Keep only letters, numbers and spaces
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

export function extractKeywords(text: string): { text: string; count: number }[] {
  // Split text into words and normalize
  const words = normalizeText(text)
    .split(/\s+/)
    .filter(word => 
      word.length > 3 && // Keep words longer than 3 characters
      !stopWords.has(word.toLowerCase()) && // Remove stop words
      !/^\d+$/.test(word) // Remove pure numbers
    );

  // Count word frequencies
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  // Calculate word relevance score
  const totalWords = words.length;
  const keywordScores = Object.entries(wordCount).map(([word, count]) => {
    // Calculate term frequency (TF)
    const frequency = count / totalWords;
    // Simple relevance score based on word length and frequency
    const relevanceScore = frequency * (word.length / 10);
    
    return {
      text: word,
      count,
      score: relevanceScore
    };
  });

  // Sort by relevance score and return top keywords
  return keywordScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map(({ text, count }) => ({ text, count }));
}