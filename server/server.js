require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust in production
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(bodyParser.json());

// Fake database for demonstration
const clients = new Map();

// Meta Webhook Verification
app.get("/webhook", (req, res) => {
  const verify_token = process.env.META_VERIFY_TOKEN;
  
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === verify_token) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Meta Webhook Event Receiver
app.post("/webhook", (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach(entry => {
      const webhook_event = entry.messaging[0];
      console.log(webhook_event);
      
      // Emit to all connected dashboard clients via Socket.io
      // In a real app, you'd route this to the specific user's socket
      io.emit("new_message", webhook_event);
    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// Socket.io for Real-time Dashboard Sync
io.on("connection", (socket) => {
  console.log("Dashboard client connected:", socket.id);
  clients.set(socket.id, socket);

  socket.on("disconnect", () => {
    console.log("Dashboard client disconnected:", socket.id);
    clients.delete(socket.id);
  });
});

// Authentication & Page Syncing Route
app.post("/api/auth/facebook", async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) {
    return res.status(400).json({ error: "No access token provided" });
  }

  console.log("Received Login Token (Access Token) from frontend.");
  
  try {
    // 1. Backend uses token to fetch user's profile
    const userRes = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name,email&access_token=${accessToken}`);
    const userData = await userRes.json();

    if (userData.error) throw new Error(userData.error.message);

    // 2. Backend uses token to fetch user's Pages
    const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`);
    const pagesData = await pagesRes.json();

    if (pagesData.error) throw new Error(pagesData.error.message);

    console.log(`Successfully fetched ${pagesData.data?.length || 0} pages for user ${userData.name}`);

    // 3. (In production) Save user, accessToken, and pages to PostgreSQL database using Prisma here
    // await prisma.user.upsert({ ... })
    // await prisma.page.createMany({ ... })

    // 4. Return success to the client
    res.json({
      success: true,
      message: "Authentication and Page Sync Complete",
      user: userData,
      pages: pagesData.data
    });

  } catch (error) {
    console.error("Backend Meta Sync Error:", error.message);
    res.status(500).json({ error: "Failed to communicate with Meta Graph API" });
  }
});

// Get conversation (lead) count per page
app.post("/api/campaigns/lead-count", async (req, res) => {
  const { pages } = req.body;
  if (!pages) return res.status(400).json({ error: "pages required" });

  const counts = [];
  for (const page of pages) {
    try {
      const r = await fetch(
        `https://graph.facebook.com/v19.0/${page.id}/conversations?fields=participants&limit=200&access_token=${page.access_token}`
      );
      const data = await r.json();
      counts.push({ id: page.id, name: page.name, count: data.data?.length || 0, error: data.error?.message });
    } catch (e) {
      counts.push({ id: page.id, name: page.name, count: 0, error: e.message });
    }
  }
  res.json({ counts, total: counts.reduce((a, c) => a + c.count, 0) });
});

// Bulk Campaign Send Route — with real-time socket progress
app.post("/api/campaigns/send-bulk", async (req, res) => {
  const { pages, message, socketId } = req.body;
  if (!pages || !message) return res.status(400).json({ error: "pages and message are required" });

  let totalSent = 0;
  let totalFailed = 0;
  let totalProcessed = 0;
  const results = [];
  const errors = [];

  // Helper: emit progress via socket if socketId provided
  const emitProgress = (data) => {
    if (socketId) {
      try { io.to(socketId).emit('campaign_progress', data); } catch {}
    }
  };

  for (const page of pages) {
    let pageSent = 0;
    let pageFailed = 0;
    const pageErrors = [];

    try {
      // Fetch ALL conversations for this page (paginate up to 500)
      let allConversations = [];
      let nextUrl = `https://graph.facebook.com/v19.0/${page.id}/conversations?fields=participants&limit=100&access_token=${page.access_token}`;

      while (nextUrl && allConversations.length < 500) {
        const convRes = await fetch(nextUrl);
        const convData = await convRes.json();
        if (convData.error) {
          console.error(`[${page.name}] conversations error:`, convData.error.message);
          results.push({ page: page.name, error: convData.error.message, sent: 0, failed: 0, errors: [] });
          nextUrl = null;
          break;
        }
        allConversations = [...allConversations, ...(convData.data || [])];
        nextUrl = convData.paging?.next || null;
      }

      const totalForPage = allConversations.length;
      console.log(`[${page.name}] Found ${totalForPage} conversations`);

      emitProgress({ phase: 'start', page: page.name, total: totalForPage, sent: 0, failed: 0, processed: 0 });

      for (const conv of allConversations) {
        const recipient = (conv.participants?.data || []).find(p => p.id !== page.id);
        if (!recipient) continue;

        let sent = false;

        // Try 1: messaging_type RESPONSE (works within 24h window — most common for CRM)
        try {
          const r1 = await fetch(`https://graph.facebook.com/v19.0/${page.id}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipient: { id: recipient.id },
              message: { text: message },
              access_token: page.access_token,
              messaging_type: 'RESPONSE'
            })
          });
          const d1 = await r1.json();
          if (!d1.error) {
            sent = true;
            pageSent++;
            totalSent++;
          } else if (d1.error.code === 10 || d1.error.code === 200) {
            // Permission error — no point retrying with same token
            pageErrors.push({ recipient: recipient.name || recipient.id, error: d1.error.message });
            pageFailed++;
            totalFailed++;
          } else {
            // Try 2: MESSAGE_TAG with ACCOUNT_UPDATE (for outside 24h window)
            const r2 = await fetch(`https://graph.facebook.com/v19.0/${page.id}/messages`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                recipient: { id: recipient.id },
                message: { text: message },
                access_token: page.access_token,
                messaging_type: 'MESSAGE_TAG',
                tag: 'ACCOUNT_UPDATE'
              })
            });
            if (!d2.error) {
              sent = true;
              pageSent++;
              totalSent++;
            } else {
              const fs = require('fs');
              fs.appendFileSync('fb_errors.log', JSON.stringify({time: new Date(), recipient: recipient.id, error: d2.error}) + '\n');
              pageErrors.push({ recipient: recipient.name || recipient.id, error: d2.error.message });
              pageFailed++;
              totalFailed++;
            }
          }
        } catch (e) {
          const fs = require('fs');
          fs.appendFileSync('fb_errors.log', JSON.stringify({time: new Date(), recipient: recipient.id, error: e.message}) + '\n');
          pageFailed++;
          totalFailed++;
        }

        totalProcessed++;
        emitProgress({
          phase: 'sending',
          page: page.name,
          total: totalForPage,
          processed: totalProcessed,
          sent: pageSent,
          failed: pageFailed,
          lastRecipient: recipient.name || recipient.id,
          success: sent
        });
      }

      results.push({ page: page.name, total: totalForPage, sent: pageSent, failed: pageFailed, errors: pageErrors.slice(0, 5) });
      totalSent += 0; // already counted above
      totalFailed += 0;

    } catch (err) {
      console.error(`[${page.name}] Fatal error:`, err.message);
      results.push({ page: page.name, error: err.message, sent: 0, failed: 0, errors: [] });
    }
  }

  emitProgress({ phase: 'complete', totalSent, totalFailed, results });
  console.log(`Campaign complete. Sent: ${totalSent}, Failed: ${totalFailed}`);
  res.json({ success: true, totalSent, totalFailed, results });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
