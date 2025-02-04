import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import PDFDocument from 'npm:pdfkit';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, title, description, keywords, links, seoScore, suggestions } = await req.json();
    console.log('Generating PDF report for:', url);

    // Create PDF document
    const doc = new PDFDocument();
    const chunks: Uint8Array[] = [];

    // Collect PDF chunks
    doc.on('data', (chunk) => chunks.push(chunk));

    // Header
    doc.fontSize(24).text('SEO Analysis Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(new Date().toLocaleDateString('pt-BR'), { align: 'right' });
    doc.moveDown();

    // URL
    doc.fontSize(16).text('URL Analisada');
    doc.fontSize(12).text(url);
    doc.moveDown();

    // Page Info
    doc.fontSize(16).text('Informações da Página');
    doc.fontSize(12).text(`Título: ${title}`);
    doc.text(`Descrição: ${description}`);
    doc.moveDown();

    // SEO Score
    doc.fontSize(16).text('Pontuação SEO');
    doc.fontSize(12).text(`Pontuação Geral: ${seoScore.score}`);
    doc.text(`Título: ${seoScore.details.titleScore}%`);
    doc.text(`Descrição: ${seoScore.details.descriptionScore}%`);
    doc.text(`Palavras-chave: ${seoScore.details.keywordsScore}%`);
    doc.text(`Links Internos: ${seoScore.details.internalLinksScore}%`);
    doc.text(`Links Externos: ${seoScore.details.externalLinksScore}%`);
    doc.moveDown();

    // Keywords
    doc.fontSize(16).text('Principais Palavras-chave');
    keywords.slice(0, 10).forEach((kw: { text: string; count: number }) => {
      doc.fontSize(12).text(`${kw.text}: ${kw.count} ocorrências`);
    });
    doc.moveDown();

    // Links Analysis
    doc.fontSize(16).text('Análise de Links');
    const internalLinks = links.filter((l: any) => l.type === 'internal');
    const externalLinks = links.filter((l: any) => l.type === 'external');
    doc.fontSize(12).text(`Links Internos: ${internalLinks.length}`);
    doc.text(`Links Externos: ${externalLinks.length}`);
    doc.moveDown();

    // Suggestions
    if (suggestions && suggestions.length > 0) {
      doc.fontSize(16).text('Sugestões de Melhorias');
      suggestions.forEach((suggestion: string) => {
        doc.fontSize(12).text(`• ${suggestion}`);
      });
    }

    // Finalize PDF
    doc.end();

    // Wait for all chunks to be collected
    const pdfBytes = new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], []));
    
    // Convert to base64
    const base64Data = btoa(String.fromCharCode.apply(null, [...pdfBytes]));

    return new Response(
      JSON.stringify(base64Data),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate PDF report' }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});