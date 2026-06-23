import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const { text, pageId } = await request.json();
    if (!text) return NextResponse.json({ error: 'Text is required' }, { status: 400 });

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      return NextResponse.json({ error: 'OpenRouter API key missing' }, { status: 500 });
    }

    let aiModel = "google/gemini-2.5-flash"; // Default fallback
    
    if (pageId) {
      const { data: botConfig } = await supabase
        .from('bot_configs')
        .select('ai_model')
        .eq('page_id', pageId)
        .single();
        
      if (botConfig?.ai_model) {
        aiModel = botConfig.ai_model;
      }
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://pagespilot.online",
        "X-Title": "PagePilot CRM Bot"
      },
      body: JSON.stringify({
        model: aiModel,
        max_tokens: 500,
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
    if (data.error) {
      console.error('OpenRouter error:', data.error);
      const errorMsg = data.error.message || JSON.stringify(data.error);
      return NextResponse.json({ error: errorMsg }, { status: 500 });
    }

    let improvedText = data.choices?.[0]?.message?.content || text;
    // Clean up quotes or markdown if Gemini adds them
    improvedText = improvedText.replace(/^["']|["']$/g, '').trim();

    return NextResponse.json({ improvedText });
  } catch (error) {
    console.error('Error improving chat:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
