// Portuguese stop words and text processing utilities
export const stopWords = new Set([
  // Common Portuguese words
  'a', 'ao', 'aos', 'aquela', 'aquelas', 'aquele', 'aqueles', 'aquilo', 'as', 'até',
  'com', 'como', 'da', 'das', 'de', 'dela', 'delas', 'dele', 'deles', 'depois',
  'do', 'dos', 'e', 'ela', 'elas', 'ele', 'eles', 'em', 'entre', 'era',
  'eram', 'essa', 'essas', 'esse', 'esses', 'esta', 'estas', 'este', 'estes',
  'eu', 'foi', 'foram', 'há', 'isso', 'isto', 'já', 'lhe', 'lhes', 'mais',
  'mas', 'me', 'mesmo', 'meu', 'meus', 'minha', 'minhas', 'muito', 'na', 'não',
  'nas', 'nem', 'no', 'nos', 'nossa', 'nossas', 'nosso', 'nossos', 'num', 'numa',
  'o', 'os', 'ou', 'para', 'pela', 'pelas', 'pelo', 'pelos', 'por', 'qual',
  'quando', 'que', 'quem', 'são', 'se', 'seja', 'sem', 'seu', 'seus', 'só',
  'sua', 'suas', 'também', 'te', 'tem', 'têm', 'seu', 'sua', 'teu', 'tua',
  'um', 'uma', 'umas', 'uns', 'você', 'vocês',
  
  // Common website terms
  'menu', 'home', 'início', 'contato', 'sobre', 'termos', 'política',
  'privacidade', 'cookies', 'aceitar', 'fechar', 'abrir', 'clique', 'aqui',
  'saiba', 'mais', 'leia', 'página', 'site', 'website', 'web', 'email',
  'newsletter', 'inscreva', 'cadastre', 'enviar', 'buscar', 'pesquisar'
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
  const words = normalizeText(text)
    .split(/\s+/)
    .filter(word => 
      word.length > 3 && 
      !stopWords.has(word.toLowerCase()) && 
      !/^\d+$/.test(word)
    );

  const keywordCount: Record<string, number> = {};
  words.forEach(word => {
    keywordCount[word] = (keywordCount[word] || 0) + 1;
  });

  return Object.entries(keywordCount)
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
}