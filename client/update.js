const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'dashboard', 'bot', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

const defaultSettings = `
const defaultAiSettings = {
  purposes: [] as string[],
  should_not_reply: "",
  should_reply: "",
  tones: [] as string[],
  language: "English",
  training_examples: [] as { user: string; ai: string }[]
};

const purposeOptions = ["Social Media Manager", "E-commerce Assistant", "Customer Support Agent", "Sales Agent", "Lead Generator", "Casino/Game Support", "Virtual Assistant", "Appointment Booking", "Community Manager"];
const toneOptions = ["Friendly", "Professional", "Casual", "Sales Focused", "Luxury Tone", "Gen-Z Style", "USA Local", "Short Replies", "Detailed Replies"];
const langOptions = ["English", "USA English", "USA English with Accent", "Urdu", "Hindi", "Arabic", "Use Urdu + English"];

function AiSettingsEditor({ selectedPage, updateAiPrompt }: { selectedPage: BotConfig, updateAiPrompt: (val: string) => void }) {
  const getSettings = () => {
    try {
      if (selectedPage.ai_prompt?.trim().startsWith('{')) {
        return { ...defaultAiSettings, ...JSON.parse(selectedPage.ai_prompt) };
      }
    } catch(e) {}
    return { ...defaultAiSettings, should_reply: selectedPage.ai_prompt || "" };
  };
  
  const settings = getSettings();
  
  const update = (key: string, val: any) => {
    updateAiPrompt(JSON.stringify({ ...settings, [key]: val }));
  };

  const toggleArray = (key: 'purposes' | 'tones', item: string) => {
    const arr = settings[key] || [];
    if (arr.includes(item)) update(key, arr.filter((x: string) => x !== item));
    else update(key, [...arr, item]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Purpose */}
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#fff", display: "block", marginBottom: 8 }}>1. Bot Purpose Selection</label>
        <p style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>Select what type of work the AI should do.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {purposeOptions.map(p => {
            const active = settings.purposes.includes(p);
            return (
              <button key={p} onClick={() => toggleArray('purposes', p)} style={{
                padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: active ? 600 : 500,
                background: active ? "#a78bfa" : "#0a0a15", color: active ? "#fff" : "#94a3b8",
                border: \`1px solid \${active ? "#a78bfa" : "#2d2d5e"}\`, cursor: "pointer"
              }}>
                {active ? "☑ " : "☐ "} {p}
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. SHOULD reply */}
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#fff", display: "block", marginBottom: 8 }}>2. Things AI SHOULD Reply To</label>
        <p style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>What exact topics should it help with? (e.g. Payment methods, deposit instructions)</p>
        <textarea
          value={settings.should_reply}
          onChange={(e) => update('should_reply', e.target.value)}
          placeholder="Help users with:&#10;- Payment methods&#10;- Deposit instructions&#10;- Casino game information"
          rows={4}
          style={{
            width: "100%", background: "#0a0a15", border: "1px solid #2d2d5e",
            borderRadius: 8, color: "#e2e8f0", padding: "12px", fontSize: 13, fontFamily: "inherit", resize: "vertical"
          }}
        />
      </div>

      {/* 3. SHOULD NOT reply */}
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#fff", display: "block", marginBottom: 8 }}>3. Things AI Should NOT Reply To (Restrictions)</label>
        <p style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>What should the AI refuse to do? (e.g. Do not share admin links)</p>
        <textarea
          value={settings.should_not_reply}
          onChange={(e) => update('should_not_reply', e.target.value)}
          placeholder="- Do not share admin links.&#10;- Do not reveal pricing without permission.&#10;- Do not provide refund promises."
          rows={3}
          style={{
            width: "100%", background: "#0a0a15", border: "1px solid #2d2d5e",
            borderRadius: 8, color: "#e2e8f0", padding: "12px", fontSize: 13, fontFamily: "inherit", resize: "vertical"
          }}
        />
      </div>

      {/* 4. Tone */}
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#fff", display: "block", marginBottom: 8 }}>4. Reply Style / Tone</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {toneOptions.map(t => {
            const active = settings.tones.includes(t);
            return (
              <button key={t} onClick={() => toggleArray('tones', t)} style={{
                padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: active ? 600 : 500,
                background: active ? "#3b82f6" : "#0a0a15", color: active ? "#fff" : "#94a3b8",
                border: \`1px solid \${active ? "#3b82f6" : "#2d2d5e"}\`, cursor: "pointer"
              }}>
                {active ? "☑ " : "☐ "} {t}
              </button>
            )
          })}
        </div>
      </div>

      {/* 5. Language */}
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#fff", display: "block", marginBottom: 8 }}>5. Language Settings</label>
        <select
          value={settings.language}
          onChange={(e) => update('language', e.target.value)}
          style={{
            width: "100%", background: "#0a0a15", border: "1px solid #2d2d5e",
            borderRadius: 8, color: "#e2e8f0", padding: "10px 12px", fontSize: 13, fontFamily: "inherit"
          }}
        >
          {langOptions.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {/* 6. Training Examples */}
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#fff", display: "block", marginBottom: 8 }}>6. Example Conversations Training</label>
        <p style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>Teach the AI exactly how to answer specific questions.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {settings.training_examples.map((ex: any, i: number) => (
            <div key={i} style={{ background: "#0a0a15", border: "1px solid #2d2d5e", borderRadius: 8, padding: 12, position: "relative" }}>
              <button
                onClick={() => {
                  const newEx = [...settings.training_examples];
                  newEx.splice(i, 1);
                  update('training_examples', newEx);
                }}
                style={{ position: "absolute", top: 8, right: 8, background: "transparent", border: "none", color: "#ef4444", cursor: "pointer" }}
              >
                ✕
              </button>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>User Says:</span>
                <input value={ex.user} onChange={(e) => {
                  const newEx = [...settings.training_examples];
                  newEx[i].user = e.target.value;
                  update('training_examples', newEx);
                }} style={{ width: "100%", background: "transparent", borderBottom: "1px solid #2d2d5e", color: "#fff", fontSize: 12, padding: "4px 0", outline: "none" }} placeholder="How can I deposit?" />
              </div>
              <div>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>AI Should Reply:</span>
                <input value={ex.ai} onChange={(e) => {
                  const newEx = [...settings.training_examples];
                  newEx[i].ai = e.target.value;
                  update('training_examples', newEx);
                }} style={{ width: "100%", background: "transparent", borderBottom: "1px solid #2d2d5e", color: "#fff", fontSize: 12, padding: "4px 0", outline: "none" }} placeholder="You can deposit using CashApp..." />
              </div>
            </div>
          ))}
          <button onClick={() => update('training_examples', [...settings.training_examples, { user: "", ai: "" }])} style={{ padding: "8px", borderRadius: 8, background: "#1e293b", color: "#e2e8f0", border: "1px dashed #475569", cursor: "pointer", fontSize: 12 }}>
            + Add Example
          </button>
        </div>
      </div>
    </div>
  );
}
`;

const oldUiBlock = \`                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <label style={{ fontSize: 12, color: "#94a3b8", display: "block" }}>System Guidelines / Prompt</label>
                        <span style={{ fontSize: 11, color: "#64748b" }}>Tells the bot how to act</span>
                      </div>
                      <textarea
                        value={selectedPage.ai_prompt}
                        onChange={(e) => {
                          const updated = { ...selectedPage, ai_prompt: e.target.value };
                          setSelectedPage(updated);
                          setPages(pages.map(p => p.page_id === selectedPage.page_id ? updated : p));
                        }}
                        placeholder="Example: Act as a friendly representative for NexoPay. Help users with CashApp deposit requests, credit issues, and payment support. Be helpful and polite. Never share internal links."
                        rows={10}
                        style={{
                          width: "100%", background: "#0a0a15", border: "1px solid #2d2d5e",
                          borderRadius: 8, color: "#e2e8f0", padding: "12px", fontSize: 13,
                          fontFamily: "inherit", resize: "vertical", boxSizing: "border-box",
                          lineHeight: "1.5"
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
                      <span style={{ fontSize: 12, color: "#64748b", alignSelf: "center" }}>Quick Prompt Templates:</span>
                      {[
                        { name: "Support Agent", prompt: "Act as a customer support agent. Answer questions politely. If you do not know the answer, politely ask them to wait for a human agent." },
                        { name: "Sales Qualifier", prompt: "Act as a friendly sales assistant. Qualify leads by asking for their email and phone number before discussing pricing or specific deals." },
                        { name: "FAQ Assistant", prompt: "Act as an FAQ bot. Provide clear, concise answers to common questions about shipping, returns, and payment methods." }
                      ].map(tmpl => (
                        <button
                          key={tmpl.name}
                          onClick={() => {
                            const updated = { ...selectedPage, ai_prompt: tmpl.prompt };
                            setSelectedPage(updated);
                            setPages(pages.map(p => p.page_id === selectedPage.page_id ? updated : p));
                          }}
                          style={{
                            padding: "4px 10px", fontSize: 11, borderRadius: 6, border: "1px solid #2d2d5e",
                            background: "#0a0a15", color: "#a78bfa", cursor: "pointer", fontWeight: 600
                          }}
                        >
                          {tmpl.name}
                        </button>
                      ))}
                    </div>\`;

const newUiBlock = \`                    <div style={{ marginBottom: 24, marginTop: 16 }}>
                      <AiSettingsEditor 
                        selectedPage={selectedPage} 
                        updateAiPrompt={(val) => {
                          const updated = { ...selectedPage, ai_prompt: val };
                          setSelectedPage(updated);
                          setPages(pages.map(p => p.page_id === selectedPage.page_id ? updated : p));
                        }} 
                      />
                    </div>\`;

if(content.includes(oldUiBlock)) {
    content = content.replace(oldUiBlock, newUiBlock);
    content = content.replace("export default function BotPage() {", defaultSettings + "\\nexport default function BotPage() {");
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log("Updated page.tsx");
} else {
    console.log("Could not find block in page.tsx");
}

const routePath = path.join(__dirname, 'src', 'app', 'api', 'webhook', 'route.ts');
let routeContent = fs.readFileSync(routePath, 'utf-8');

const oldRouteBlock = \`              // Call OpenRouter with system instructions
              const systemMsg = aiPrompt || "You are a helpful customer support agent.";\`;

const newRouteBlock = \`              // Call OpenRouter with system instructions
              let systemMsg = "You are a helpful customer support agent.";
              try {
                if (aiPrompt.trim().startsWith('{')) {
                  const settings = JSON.parse(aiPrompt);
                  systemMsg = "You are an AI assistant. ";
                  if (settings.purposes?.length > 0) {
                    systemMsg += "Your primary roles are: " + settings.purposes.join(', ') + ". ";
                    if (settings.purposes.includes("Casino/Game Support")) {
                      systemMsg += "Help users with casino gaming tasks like products, captions, orders, ads, and customer replies. ";
                    }
                  }
                  if (settings.should_reply) {
                    systemMsg += "\\n\\nYou MUST help users with the following topics:\\n" + settings.should_reply + "\\n";
                  }
                  if (settings.should_not_reply) {
                    systemMsg += "\\n\\nCRITICAL RESTRICTIONS (DO NOT VIOLATE):\\n" + settings.should_not_reply + "\\n";
                  }
                  if (settings.tones?.length > 0) {
                    systemMsg += "\\n\\nYour tone and style should be: " + settings.tones.join(', ') + ". ";
                  }
                  if (settings.language) {
                    systemMsg += "\\n\\nYou must respond in the following language/style: " + settings.language + ". ";
                  }
                  if (settings.training_examples?.length > 0) {
                    systemMsg += "\\n\\nHere are some examples of how you should reply:\\n";
                    settings.training_examples.forEach((ex: any) => {
                      if(ex.user && ex.ai) systemMsg += "User: " + ex.user + "\\nAI: " + ex.ai + "\\n\\n";
                    });
                  }
                  systemMsg += "\\n\\nIMPORTANT: If you do not know the answer, politely ask them to wait for a human agent. Do not say that you can connect them to a human unless they explicitly ask for help that you cannot provide.";
                } else if (aiPrompt) {
                  systemMsg = aiPrompt;
                }
              } catch (e) {
                systemMsg = aiPrompt || "You are a helpful customer support agent.";
              }\`;

if(routeContent.includes(oldRouteBlock)) {
    routeContent = routeContent.replace(oldRouteBlock, newRouteBlock);
    fs.writeFileSync(routePath, routeContent, 'utf-8');
    console.log("Updated route.ts");
} else {
    console.log("Could not find block in route.ts");
}
