import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (!text) return NextResponse.json({ error: 'Text is required' }, { status: 400 });

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      return NextResponse.json({ error: 'OpenRouter API key missing' }, { status: 500 });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a professional customer support chat improver. Your task is to take the support agent's rough draft text and improve its grammar, tone, and clarity. Make it polite and professional. DO NOT add unnecessary fluff, simply improve the text natively. RESPOND ONLY WITH THE IMPROVED TEXT. Do not wrap in quotes or add conversational filler."
          },
          {
            role: "user",
            content: text
          }
        ]
      })
    });

    const data = await response.json();
    const improvedText = data.choices?.[0]?.message?.content || text;

    return NextResponse.json({ improvedText });
  } catch (error) {
    console.error('Error improving chat:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
