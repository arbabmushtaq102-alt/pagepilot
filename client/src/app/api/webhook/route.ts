import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || 'pagepilot_secure_token_123';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// 1. Webhook Verification
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified by Meta!');
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

// 2. Receiving Incoming Messages & Bot Logic
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.object === 'page') {
      for (const entry of body.entry) {
        const webhookEvent = entry.messaging?.[0];
        if (!webhookEvent || !webhookEvent.message || webhookEvent.message.is_echo) continue;

        const senderId = webhookEvent.sender.id;
        const pageId = webhookEvent.recipient.id;
        const messageText = webhookEvent.message.text?.toLowerCase()?.trim();

        if (!messageText) continue;

        // --- Webhook Deduplication ---
        // Facebook resends webhooks if they take too long (e.g., waiting for slow AI models).
        // This prevents the bot from replying to the exact same message 2-3 times.
        const mid = webhookEvent.message.mid;
        const globalAny = global as any;
        if (!globalAny.processedMids) {
          globalAny.processedMids = new Set<string>();
        }
        
        if (mid) {
          if (globalAny.processedMids.has(mid)) {
            console.log(`[Deduplication] Message ${mid} already processed. Skipping to prevent duplicate reply.`);
            continue;
          }
          globalAny.processedMids.add(mid);
          setTimeout(() => globalAny.processedMids.delete(mid), 10 * 60 * 1000); // Clear after 10 mins
        }

        console.log(`\n📩 [BOT] From: ${senderId} | Page: ${pageId} | Msg: "${messageText}"`);

        // --- 0. Broadcast Sync Ping for UI Realtime Update ---
        await supabase.from('inbox_sync_pings').insert({ page_id: pageId }).then(() => {});

        // --- 1. Fetch bot config and disabled leads for this page ---
        const { data: botConfig } = await supabase
          .from('bot_configs')
          .select('*')
          .eq('page_id', pageId)
          .single();

        // If bot is explicitly disabled for the whole page, skip
        if (botConfig && botConfig.is_enabled === false) {
          console.log(`⚫ Bot is disabled for page ${pageId}. Skipping.`);
          continue;
        }

        // Check if bot is disabled for this specific customer
        const { data: disabledLead } = await supabase
          .from('bot_disabled_leads')
          .select('id')
          .eq('page_id', pageId)
          .eq('customer_id', senderId)
          .maybeSingle();

        if (disabledLead) {
          console.log(`⚫ Bot is disabled for customer ${senderId}. Skipping.`);
          continue;
        }

        // --- 2. Fetch the page access token ---
        const { data: connections } = await supabase
          .from('facebook_connections')
          .select('connected_pages, user_id');

        let pageAccessToken: string | null = null;
        let pageOwnerId: string | null = null;

        if (connections) {
          for (const row of connections) {
            const page = row.connected_pages?.find((p: any) => p.id === pageId);
            if (page?.access_token) {
              pageAccessToken = page.access_token;
              pageOwnerId = row.user_id;
              break;
            }
          }
        }

        if (!pageAccessToken || !pageOwnerId) {
          console.error(`❌ No access token found for page ${pageId}`);
          continue;
        }

        // --- 3. Run Bot Logic (AI Assistant or Keyword Rules) ---
        let replyMessage: string | null = null;
        let replyMediaUrl: string | null = null;
        let needsEscalation = false;
        const botMode = botConfig?.bot_mode || 'simple';
        const aiPrompt = botConfig?.ai_prompt || '';
        const aiModel = botConfig?.ai_model || 'google/gemini-2.5-flash';

        if (botMode === 'ai') {
          console.log(`🤖 [AI BOT] Evaluating message with model: ${aiModel}`);
          const openRouterKey = process.env.OPENROUTER_API_KEY;
          
          if (!openRouterKey) {
            console.error("❌ OPENROUTER_API_KEY is not defined in environment.");
          } else {
            try {
              // Call OpenRouter with system instructions
              // Construct the system prompt from the potentially JSON-stringified AI prompt
              let systemMsg = "You are a helpful customer support agent.";
              try {
                if (aiPrompt.trim().startsWith('{')) {
                  const settings = JSON.parse(aiPrompt);
                  systemMsg = `You are an AI assistant. `;
                  
                  if (settings.purposes && settings.purposes.length > 0) {
                    systemMsg += `Your primary roles are: ${settings.purposes.join(', ')}. `;
                    if (settings.purposes.includes("Casino/Game Support")) {
                      systemMsg += "Help users with casino gaming tasks like products, captions, orders, ads, and customer replies. ";
                    }
                  }
                  
                  if (settings.should_reply) {
                    systemMsg += `\n\nYou MUST help users with the following topics:\n${settings.should_reply}\n`;
                  }
                  
                  if (settings.should_not_reply) {
                    systemMsg += `\n\nCRITICAL RESTRICTIONS (DO NOT VIOLATE):\n${settings.should_not_reply}\n`;
                  }
                  
                  if (settings.tones && settings.tones.length > 0) {
                    systemMsg += `\n\nYour tone and style should be: ${settings.tones.join(', ')}. `;
                  }
                  
                  if (settings.language) {
                    systemMsg += `\n\nYou must respond in the following language/style: ${settings.language}. `;
                  }
                  
                  if (settings.training_examples && settings.training_examples.length > 0) {
                    systemMsg += `\n\nHere are some examples of how you should reply:\n`;
                    settings.training_examples.forEach((ex: any) => {
                      if(ex.user && ex.ai) {
                        systemMsg += `User: ${ex.user}\nAI: ${ex.ai}\n\n`;
                      }
                    });
                  }
                  
                  systemMsg += "\n\nIMPORTANT: If you do not know the answer, politely ask them to wait for a human agent. Do not say that you can connect them to a human unless they explicitly ask for help that you cannot provide.";
                } else if (aiPrompt) {
                  systemMsg = aiPrompt;
                }
              } catch (e) {
                systemMsg = aiPrompt || "You are a helpful customer support agent.";
              }
              const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${openRouterKey}`,
                  "HTTP-Referer": "https://pagepilot-crm.com", // Optional, metadata
                  "X-Title": "PagePilot CRM Bot"
                },
                body: JSON.stringify({
                  model: aiModel,
                  messages: [
                    { role: "system", content: systemMsg },
                    { role: "user", content: webhookEvent.message.text }
                  ]
                })
              });

              const responseData = await openRouterResponse.json();
              const aiReply = responseData?.choices?.[0]?.message?.content;
              if (aiReply) {
                replyMessage = aiReply.trim();
                // Check if AI is trying to escalate to a human based on its generated response
                const lowerReply = aiReply.toLowerCase();
                if (
                  lowerReply.includes("human agent") || 
                  lowerReply.includes("support agent") || 
                  lowerReply.includes("representative") || 
                  lowerReply.includes("connect you with") ||
                  lowerReply.includes("transfer you")
                ) {
                  needsEscalation = true;
                }
              } else {
                console.error("❌ OpenRouter empty response:", responseData);
              }
            } catch (aiErr) {
              console.error("❌ AI Request failed:", aiErr);
            }
          }
        } else {
          // Keyword Matching Mode
          const { data: rules } = await supabase
            .from('bot_rules')
            .select('*')
            .eq('page_id', pageId)
            .eq('is_active', true);

          if (rules && rules.length > 0) {
            for (const rule of rules) {
              const matched = rule.keywords.some((kw: string) =>
                messageText.includes(kw.toLowerCase())
              );
              if (matched) {
                replyMessage = rule.response;
                replyMediaUrl = rule.media_url || null;
                console.log(`💬 [KEYWORD BOT] Matched keyword rule: ${rule.keywords.join(', ')}`);
                break;
              }
            }
          }
        }

        // --- 4. Handle fallback and escalation ---
        if (!replyMessage || needsEscalation) {
          // Get sender name from Facebook
          let senderName = null;
          try {
            const profileRes = await fetch(
              `https://graph.facebook.com/${senderId}?fields=name&access_token=${pageAccessToken}`
            );
            const profile = await profileRes.json();
            senderName = profile.name || null;
          } catch {}

          // Create an escalation record to alert the human agent
          await supabase.from('bot_escalations').insert({
            user_id: pageOwnerId,
            page_id: pageId,
            sender_id: senderId,
            sender_name: senderName,
            last_message: webhookEvent.message.text,
            is_resolved: false,
          });

          // Disable the bot for this customer so the human agent can take over (bot stays quiet)
          await supabase.from('bot_disabled_leads').upsert({
            page_id: pageId,
            customer_id: senderId
          }, { onConflict: "page_id,customer_id" });

          console.log(`⚠️ [BOT ESCALATION] Escalated to human. Bot disabled for customer ${senderId}.`);
          
          if (!replyMessage) {
            // Use the configured fallback message, or a default error message if AI didn't generate one
            replyMessage = botConfig?.fallback_message || "I'm sorry, I am an automated bot and I don't know the answer to that. A human agent has been notified and will assist you shortly.";
          }
        }

        
        console.log(`🤖 [BOT REPLY]: ${replyMessage} | Media: ${replyMediaUrl}`);

        // Append zero-width space so the frontend knows it was sent by the bot
        const textWithBotFlag = replyMessage ? replyMessage + "\u200B" : "\u200B";

        // --- 5. Send the reply ---
        
        // 5a. Send attachment first if it exists
        if (replyMediaUrl) {
          const fbAttachmentResponse = await fetch(
            `https://graph.facebook.com/v19.0/me/messages?access_token=${pageAccessToken}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                recipient: { id: senderId },
                message: { 
                  attachment: {
                    type: "image",
                    payload: { url: replyMediaUrl, is_reusable: true }
                  }
                },
                messaging_type: 'RESPONSE',
              }),
            }
          );
          const attData = await fbAttachmentResponse.json();
          if (attData.error) console.error('❌ FB Attachment Send Error:', attData.error.message);
        }

        // 5b. Send text if it exists
        if (replyMessage && replyMessage.trim() !== "") {
          const fbResponse = await fetch(
            `https://graph.facebook.com/v19.0/me/messages?access_token=${pageAccessToken}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                recipient: { id: senderId },
                message: { text: textWithBotFlag },
                messaging_type: 'RESPONSE',
              }),
            }
          );

          const fbData = await fbResponse.json();
          if (fbData.error) {
            console.error('❌ FB Send Error:', fbData.error.message);
          } else {
            console.log('✅ Reply sent!');
          }
        } else if (replyMediaUrl) {
          console.log('✅ Media reply sent!');
        }
      }

      return new NextResponse('EVENT_RECEIVED', { status: 200 });
    }

    return new NextResponse('Not Found', { status: 404 });
  } catch (err) {
    console.error('Webhook Error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
