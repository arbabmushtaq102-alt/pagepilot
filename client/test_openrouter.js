async function test() {
  require('dotenv').config({ path: 'c:\\facbook 2\\client\\.env.local' });
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  console.log("Key exists:", !!openRouterApiKey);
  
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://pagespilot.online",
        "X-Title": "PagePilot CRM Bot"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "Improve this text."
          },
          {
            role: "user",
            content: "which game you play fk or mk ?"
          }
        ]
      })
    });

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
}

test();
