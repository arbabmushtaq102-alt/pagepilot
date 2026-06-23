const https = require('https');

async function test() {
  require('dotenv').config({ path: 'c:\\facbook 2\\client\\.env.local' });
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  console.log("Key exists:", !!openRouterApiKey);
  
  const data = JSON.stringify({
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
  });

  const options = {
    hostname: 'openrouter.ai',
    port: 443,
    path: '/api/v1/chat/completions',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openRouterApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://pagespilot.online',
      'X-Title': 'PagePilot CRM Bot',
      'Content-Length': data.length
    }
  };

  const req = https.request(options, res => {
    let responseData = '';
    res.on('data', d => {
      responseData += d;
    });
    res.on('end', () => {
      console.log('Status Code:', res.statusCode);
      console.log('Response:', responseData);
    });
  });

  req.on('error', error => {
    console.error(error);
  });

  req.write(data);
  req.end();
}

test();
