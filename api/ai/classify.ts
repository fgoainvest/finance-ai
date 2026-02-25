import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const { description } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return new Response('Missing API Key', { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Classify the following transaction description into one of these categories:
    - Alimentação
    - Transporte
    - Moradia
    - Lazer
    - Saúde
    - Educação
    - Compras
    - Serviços
    - Investimentos
    - Outros

    Description: "${description}"
    
    Return ONLY the category name. If unsure, return "Outros".`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return new Response(JSON.stringify({ category: text.trim() }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('AI Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to classify transaction' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
