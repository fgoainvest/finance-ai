import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
    runtime: 'nodejs',
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const { message, context } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return new Response('Missing API Key', { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are a financial assistant for "Financeiro AI".
    
    Context (Recent Transactions):
    ${JSON.stringify(context)}

    User Question: "${message}"

    Answer the user question based on the provided context. Be helpful, concise, and professional.
    Format the response using Markdown.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return new Response(JSON.stringify({ reply: text }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('AI Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to process chat message' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
