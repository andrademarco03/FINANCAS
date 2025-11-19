import { GoogleGenAI, Type } from "@google/genai";
import { TransactionCategory, TransactionType } from "../types";

// Inicializa o cliente Gemini com a chave da API do ambiente
// A chave deve estar configurada em process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Função 1: Analisador Financeiro (Texto) ---
export const getFinancialAdvice = async (summary: any, transactions: any[]) => {
  try {
    const prompt = `
      Você é um consultor financeiro pessoal especializado em finanças domésticas brasileiras.
      Analise o seguinte resumo financeiro e lista de transações do mês atual.
      
      Dados:
      ${JSON.stringify({ summary, transactions: transactions.map(t => ({ desc: t.description, val: t.amount, cat: t.category, type: t.type, date: t.date })) }, null, 2)}

      Por favor, forneça uma análise curta, amigável e direta em formato MARKDOWN (use negrito, listas).
      Estrutura da resposta:
      1. 📊 **Panorama Rápido**: Um comentário sobre o saldo líquido e a saúde financeira.
      2. ⚠️ **Pontos de Atenção**: Identifique categorias onde o gasto parece excessivo (se houver).
      3. 💡 **Dica de Ouro**: Uma sugestão prática e acionável para economizar com base nesses dados específicos.
      
      Se não houver transações, dê apenas uma dica genérica de economia.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Erro ao consultar Gemini:", error);
    throw new Error("Não foi possível gerar a análise no momento.");
  }
};

// --- Função 2: Leitor de Comprovantes (Multimodal: Imagem -> JSON) ---
export const extractDataFromReceipt = async (base64Image: string, mimeType: string = 'image/png') => {
  try {
    // Limpa o header do base64 se existir (ex: "data:image/png;base64,")
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const prompt = `
      Analise esta imagem de comprovante/recibo financeiro.
      Extraia os dados para preencher um formulário.
      Retorne APENAS um JSON com os seguintes campos:
      - description: Uma descrição curta do gasto (Nome do estabelecimento ou produto principal).
      - amount: O valor total (número float).
      - date: A data da transação no formato YYYY-MM-DD. Se não encontrar o ano, assuma o ano atual.
      - category: A categoria que melhor se encaixa na lista abaixo. Se não tiver certeza, use "Não Categorizado".
      
      Lista de Categorias Permitidas:
      ${Object.values(TransactionCategory).join(', ')}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType, // 'image/png', 'image/jpeg', 'application/pdf'
              data: cleanBase64
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            date: { type: Type.STRING },
            category: { type: Type.STRING },
          },
          required: ["description", "amount", "date"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Erro ao processar comprovante:", error);
    throw new Error("Não foi possível ler o comprovante.");
  }
};
