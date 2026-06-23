"use client";

import { useState, useEffect, useRef } from "react";
import { Check, CheckCheck, Send, Plus, X, User as UserIcon, RefreshCw, AlertTriangle, Search, Filter, Smile, Image as ImageIcon, Bot, ToggleLeft, ToggleRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

type Message = { id: string; sender: "customer" | "page"; text: string; time: string; isBot?: boolean; };

type Conversation = {
  id: string;
  customerName: string;
  customerId: string;
  unread: boolean;
  replied: boolean;
  lastMessageTime: string;
  lastMessageTimestamp: number; // ← real unix ms for sorting
  labels: string[];
  messages: Message[];
  pageId: string;
  pageName: string;
  pageColor: string;
};

type Page = { id: string; name: string; access_token: string; };

const PAGE_COLORS = [
  "from-blue-500 to-blue-700",
  "from-purple-500 to-purple-700",
  "from-emerald-500 to-emerald-700",
  "from-orange-500 to-orange-700",
  "from-pink-500 to-pink-700",
  "from-cyan-500 to-cyan-700",
];

const initialLabels = ["VIP", "Lead", "Support", "Spam", "Interested", "Issue"];

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function LiveInbox({ filterPageId }: { filterPageId?: string | null }) {
  const supabase = createClient();
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);
  const [showPageFilter, setShowPageFilter] = useState(false);
  const [allConversations, setAllConversations] = useState<Conversation[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('meta_live_conversations');
        return saved ? JSON.parse(saved) : [];
      }
    } catch {}
    return [];
  });
  const [availableLabels, setAvailableLabels] = useState<string[]>(initialLabels);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('meta_read_conv_ids_v2');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(true);
  const [syncInterval, setSyncInterval] = useState(60000);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPages, setLoadingPages] = useState<string[]>([]);
  const [replyText, setReplyText] = useState("");
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [newTagText, setNewTagText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSendingImage, setIsSendingImage] = useState(false);
  // Bot state
  const [botConfigs, setBotConfigs] = useState<Record<string, boolean>>({}); // pageId -> isEnabled
  const [disabledLeadIds, setDisabledLeadIds] = useState<Set<string>>(new Set());
  const [escalatedConvIds, setEscalatedConvIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // ✅ Always-fresh ref to pages — eliminates stale closure bug in fetch functions
  const pagesRef = useRef<Page[]>([]);
  const selectedPageIdsRef = useRef<string[]>([]);

  const activeConv = allConversations.find(c => c.id === activeId);
  const activePage = pages.find(p => p.id === activeConv?.pageId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages]);

  // Keep refs in sync with state for use inside intervals/callbacks
  useEffect(() => { pagesRef.current = pages; }, [pages]);
  useEffect(() => { selectedPageIdsRef.current = selectedPageIds; }, [selectedPageIds]);
  // ✅ Snapshot of all conversations for use inside interval callbacks
  const allConversationsRef = useRef<Conversation[]>([]);
  useEffect(() => { allConversationsRef.current = allConversations; }, [allConversations]);

  // Load pages + select all by default + load bot configs
  useEffect(() => {
    const saved = localStorage.getItem('meta_connected_pages');
    const savedLabels = localStorage.getItem('meta_labels');
    if (savedLabels) setAvailableLabels(JSON.parse(savedLabels));
    if (saved) {
      try {
        const parsed: Page[] = JSON.parse(saved);
        pagesRef.current = parsed; // ✅ Set ref immediately before state update
        setPages(parsed);
        const ids = filterPageId ? [filterPageId] : parsed.map(p => p.id);
        selectedPageIdsRef.current = ids; // ✅ Set ref immediately
        setSelectedPageIds(ids);
        // Load bot configs from Supabase
        loadBotConfigs(parsed.map(p => p.id));
        // ✅ Trigger initial fetch immediately using the parsed pages directly
        fetchAllConversationsWithPages(parsed, ids);
      } catch {}
    }
  }, []);

  const loadBotConfigs = async (pageIds: string[]) => {
    const { data } = await supabase.from('bot_configs').select('page_id, is_enabled').in('page_id', pageIds);
    if (data) {
      const map: Record<string, boolean> = {};
      data.forEach((c: any) => { map[c.page_id] = c.is_enabled; });
      setBotConfigs(map);
    }
    // Load escalated conversation sender IDs
    const { data: escs } = await supabase.from('bot_escalations').select('sender_id, page_id').eq('is_resolved', false);
    if (escs) {
      const ids = new Set(escs.map((e: any) => `${e.page_id}_${e.sender_id}`));
      setEscalatedConvIds(ids as Set<string>);
    }
    // Load per-lead disabled status
    const { data: disabled } = await supabase.from('bot_disabled_leads').select('customer_id, page_id');
    if (disabled) {
      const ids = new Set(disabled.map((d: any) => `${d.page_id}_${d.customer_id}`));
      setDisabledLeadIds(ids as Set<string>);
    }
  };

  const toggleBotForLead = async (pageId: string, customerId: string) => {
    const key = `${pageId}_${customerId}`;
    const currentlyDisabled = disabledLeadIds.has(key);
    
    // Optimistic UI update
    setDisabledLeadIds(prev => {
      const next = new Set(prev);
      if (currentlyDisabled) next.delete(key);
      else next.add(key);
      return next;
    });

    if (currentlyDisabled) {
      // Re-enable bot -> delete from table
      await supabase.from('bot_disabled_leads')
        .delete()
        .match({ page_id: pageId, customer_id: customerId });
    } else {
      // Disable bot -> insert into table
      await supabase.from('bot_disabled_leads')
        .insert({ page_id: pageId, customer_id: customerId });
    }
  };

  // Persist readIds to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('meta_read_conv_ids_v2', JSON.stringify(readIds));
  }, [readIds]);

  // ✅ DEFINED BEFORE useEffects so they are available when called
  const _doFetch = async (selectedPages: Page[], silent: boolean) => {
    const fetchedConvs: Conversation[] = [];
    const successfulPageIds = new Set<string>();

    await Promise.all(selectedPages.map(async (page, idx) => {
      if (!silent) setLoadingPages(prev => [...prev, page.id]);
      try {
        let url: string | null =
          `https://graph.facebook.com/v19.0/${page.id}/conversations?fields=participants,messages.limit(20){message,from,created_time}&limit=30&access_token=${page.access_token}`;
        const allPageConvs: any[] = [];
        while (url) {
          const res: any = await fetch(url);
          const data: any = await res.json();
          if (data.error) throw new Error(data.error.message);
          allPageConvs.push(...(data.data || []));
          url = data.paging?.next || null;
          if (allPageConvs.length >= 500) break;
        }
        const convs: Conversation[] = allPageConvs.map((conv: any) => {
          const participant = conv.participants?.data?.find((p: any) => p.id !== page.id);
          const customerName = participant?.name || "Unknown Customer";
          const customerId = participant?.id || conv.id;
          const rawMessages = (conv.messages?.data || []);
          const messages: Message[] = rawMessages.reverse().map((m: any) => {
            const rawText = m.message || "";
            const isBot = rawText.endsWith("\u200B");
            const text = isBot ? rawText.slice(0, -1) : rawText;
            return {
              id: m.id,
              sender: m.from?.id === page.id ? "page" : "customer",
              text,
              time: timeAgo(m.created_time),
              timestamp: new Date(m.created_time).getTime(),
              isBot,
            };
          });
          const lastMsg = messages[messages.length - 1];
          const lastRaw = rawMessages[rawMessages.length - 1];
          const lastTs = lastRaw?.created_time ? new Date(lastRaw.created_time).getTime() : 0;
          return {
            id: `${page.id}_${conv.id}`,
            customerName,
            customerId,
            unread: lastMsg?.sender === "customer",
            replied: lastMsg?.sender === "page",
            lastMessageTime: lastMsg?.time || "",
            lastMessageTimestamp: lastTs,
            labels: (() => { try { return JSON.parse(localStorage.getItem(`labels_${page.id}_${conv.id}`) || '[]'); } catch { return []; } })(),
            messages,
            pageId: page.id,
            pageName: page.name,
            pageColor: PAGE_COLORS[idx % PAGE_COLORS.length],
          };
        });
        fetchedConvs.push(...convs);
        successfulPageIds.add(page.id);
      } catch (err) {
        console.error(`Error fetching ${page.name}:`, err);
      } finally {
        setLoadingPages(prev => prev.filter(id => id !== page.id));
      }
    }));

    const { data: escs } = await supabase.from('bot_escalations').select('sender_id, page_id').eq('is_resolved', false);
    if (escs) {
      const ids = new Set(escs.map((e: any) => `${e.page_id}_${e.sender_id}`));
      setEscalatedConvIds(ids as Set<string>);
    }

    const { data: disabled } = await supabase.from('bot_disabled_leads').select('customer_id, page_id');
    if (disabled) {
      const ids = new Set(disabled.map((d: any) => `${d.page_id}_${d.customer_id}`));
      setDisabledLeadIds(ids as Set<string>);
    }

    setAllConversations(prev => {
      const oldConvsToKeep = prev.filter(c => !successfulPageIds.has(c.pageId));
      const combined = [...oldConvsToKeep, ...fetchedConvs];
      combined.sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);
      let currentReadIds: Record<string, number>;
      try {
        const saved = localStorage.getItem('meta_read_conv_ids_v2');
        currentReadIds = saved ? JSON.parse(saved) : {};
      } catch { currentReadIds = {}; }
      const finalConvs = combined.map(nc => {
        const readTimestamp = currentReadIds[nc.id];
        const wasRead = readTimestamp != null;
        // ✅ Always read labels from their dedicated localStorage key (source of truth)
        // This prevents tags from being lost due to stale cache or empty in-memory arrays
        let labels: string[] = nc.labels;
        try {
          const savedLabels = localStorage.getItem(`labels_${nc.id}`);
          if (savedLabels) labels = JSON.parse(savedLabels);
        } catch {}
        return {
          ...nc,
          labels,
          unread: wasRead
            ? nc.lastMessageTimestamp > readTimestamp ? nc.unread : false
            : nc.unread,
        };
      });
      try { localStorage.setItem('meta_live_conversations', JSON.stringify(finalConvs)); } catch {}
      return finalConvs;
    });
    setIsLoading(false);
    setIsSyncing(false);
  };

  const fetchAllConversationsWithPages = async (thePages: Page[], theIds: string[], silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsSyncing(true);
    const selectedPages = thePages.filter(p => theIds.includes(p.id));
    await _doFetch(selectedPages, silent);
  };

  const fetchAllConversations = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsSyncing(true);
    const selectedPages = pagesRef.current.filter(p => selectedPageIdsRef.current.includes(p.id));
    if (selectedPages.length === 0) { setIsLoading(false); setIsSyncing(false); return; }
    await _doFetch(selectedPages, silent);
  };


  // Real-time Webhook Sync (Instantly updates when a message arrives at the server)
  useEffect(() => {
    if (selectedPageIds.length === 0) return;
    const channel = supabase.channel('realtime_pings')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'inbox_sync_pings' }, (payload) => {
        if (selectedPageIdsRef.current.includes(payload.new.page_id)) {
          console.log("⚡ Realtime Ping received for page:", payload.new.page_id);
          
          // Optimistically update UI if payload is provided! (0ms delay)
          const msgData = payload.new.payload;
          if (msgData && msgData.senderId && msgData.text) {
            setAllConversations(prev => {
              const existingIndex = prev.findIndex(c => c.pageId === payload.new.page_id && c.customerId === msgData.senderId);
              
              const newMsg: Message = {
                id: Math.random().toString(),
                sender: "customer",
                text: msgData.text,
                time: "Just now",
                timestamp: msgData.timestamp || Date.now(),
                isBot: false
              };

              if (existingIndex > -1) {
                const updated = [...prev];
                const c = updated[existingIndex];
                
                // Prevent duplicate optimistic inserts
                if (c.messages.some(m => m.text === msgData.text && Date.now() - m.timestamp < 60000)) {
                   return prev;
                }
                
                updated[existingIndex] = {
                  ...c,
                  unread: true,
                  replied: false,
                  lastMessageTime: "Just now",
                  lastMessageTimestamp: msgData.timestamp || Date.now(),
                  messages: [...c.messages, newMsg]
                };
                return updated.sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);
              } else {
                // Optimistically create a new conversation for brand new customers
                const activePageInfo = pagesRef.current.find(p => p.id === payload.new.page_id);
                const newConv: Conversation = {
                  id: `optimistic_${payload.new.page_id}_${msgData.senderId}`,
                  customerName: "New Message...",
                  customerId: msgData.senderId,
                  unread: true,
                  replied: false,
                  lastMessageTime: "Just now",
                  lastMessageTimestamp: msgData.timestamp || Date.now(),
                  labels: [],
                  messages: [newMsg],
                  pageId: payload.new.page_id,
                  pageName: activePageInfo?.name || "Connected Page",
                  pageColor: "from-blue-500 to-blue-700",
                };
                return [newConv, ...prev];
              }
            });
          }

          fetchAllConversations(true); // Fetch immediately
          setTimeout(() => fetchAllConversations(true), 2500); // Fetch again 2.5s later (beats FB Cache)
          setTimeout(() => fetchAllConversations(true), 5000); // Super safe fallback
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedPageIds]);

  // ✅ Fast 10s lightweight poll — checks for new messages without hammering the API
  useEffect(() => {
    if (!isAutoSyncEnabled || selectedPageIds.length === 0) return;
    const fastInterval = setInterval(async () => {
      const currentPages = pagesRef.current.filter(p => selectedPageIdsRef.current.includes(p.id));
      if (currentPages.length === 0) return;
      let anyNew = false;
      await Promise.all(currentPages.map(async (page) => {
        try {
          const url = `https://graph.facebook.com/v19.0/${page.id}/conversations?fields=participants,messages.limit(3){message,from,created_time}&limit=5&access_token=${page.access_token}`;
          const res = await fetch(url);
          const data = await res.json();
          if (data.error || !data.data) return;
          data.data.forEach((conv: any) => {
            const convId = `${page.id}_${conv.id}`;
            const msgs = conv.messages?.data || [];
            if (msgs.length === 0) return;
            const newestMsgTime = new Date(msgs[0].created_time).getTime();
            // ✅ Read from ref — no state setter needed
            const existing = allConversationsRef.current.find(c => c.id === convId);
            if (!existing || newestMsgTime > existing.lastMessageTimestamp) {
              anyNew = true;
            }
          });
        } catch {}
      }));
      if (anyNew) fetchAllConversations(true);
    }, 5000);
    return () => clearInterval(fastInterval);
  }, [isAutoSyncEnabled, selectedPageIds]);

  // Full sync at user-configured interval (30s / 60s)
  useEffect(() => {
    if (!isAutoSyncEnabled || selectedPageIds.length === 0) return;
    const interval = setInterval(() => fetchAllConversations(true), syncInterval);
    return () => clearInterval(interval);
  }, [isAutoSyncEnabled, selectedPageIds, syncInterval]);

  const togglePageSelection = (pageId: string) => {
    setSelectedPageIds(prev =>
      prev.includes(pageId) ? prev.filter(id => id !== pageId) : [...prev, pageId]
    );
  };

  const EMOJI_LIST = [
    "😀","😂","😍","🥰","😎","🤩","😊","🙏","👍","👏",
    "❤️","🔥","💯","🎉","✅","⭐","💪","🤝","💰","🎁",
    "😅","🤔","😭","😴","🥳","🤑","👋","✨","🚀","💎",
    "😁","😉","🥺","😇","🤗","😆","🙌","👌","💬","📱",
  ];

  const handleSendImage = async (file: File) => {
    if (!activePage || !activeConv) return;
    setIsSendingImage(true);
    try {
      const formData = new FormData();
      formData.append("recipient", JSON.stringify({ id: activeConv.customerId }));
      formData.append("message", JSON.stringify({ attachment: { type: "image", payload: { is_reusable: true } } }));
      formData.append("filedata", file);
      formData.append("access_token", activePage.access_token);
      const res = await fetch(`https://graph.facebook.com/v19.0/${activePage.id}/messages`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.error) {
        alert(`Image send failed: ${data.error.message}`);
      } else {
        // Show image preview in chat optimistically
        const previewUrl = URL.createObjectURL(file);
        const newMsg: Message = { id: Math.random().toString(), sender: "page", text: `📷 [Image: ${file.name}]`, time: "Just now" };
        const nowTs = Date.now();
        setAllConversations(prev => {
          const updated = prev.map(c => c.id === activeId ? { ...c, replied: true, messages: [...c.messages, newMsg], lastMessageTimestamp: nowTs, lastMessageTime: "Just now" } : c);
          return [...updated].sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);
        });
      }
    } catch { alert("Network error sending image."); }
    finally { setIsSendingImage(false); }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !activeId || !activePage || !activeConv) return;
    const text = replyText;
    setReplyText("");
    setShowEmojiPicker(false);
    const newMsg: Message = { id: Math.random().toString(), sender: "page", text, time: "Just now" };
    const nowTs = Date.now();
    setAllConversations(prev => {
      const updated = prev.map(c => c.id === activeId
        ? { ...c, replied: true, messages: [...c.messages, newMsg], lastMessageTimestamp: nowTs, lastMessageTime: "Just now" }
        : c
      );
      // Re-sort so this conversation floats to top
      return [...updated].sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);
    });
    try {
      const r1 = await fetch(`https://graph.facebook.com/v19.0/${activePage.id}/messages`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient: { id: activeConv.customerId }, message: { text }, messaging_type: "RESPONSE", access_token: activePage.access_token })
      });
      const d1 = await r1.json();
      if (d1.error) {
        if (d1.error.code === 10 || d1.error.message?.includes("Outside Allowed Window") || d1.error.message?.includes("24 hours")) {
          console.log("24-hour window expired. Falling back to HUMAN_AGENT tag...");
          try {
            const r2 = await fetch(`https://graph.facebook.com/v19.0/${activePage.id}/messages`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                recipient: { id: activeConv.customerId }, 
                message: { text }, 
                messaging_type: "MESSAGE_TAG",
                tag: "HUMAN_AGENT",
                access_token: activePage.access_token 
              })
            });
            const d2 = await r2.json();
            if (d2.error) {
              if (d2.error.code === 10 || d2.error.message?.includes("7 days")) {
                alert("Failed to send: The 7-day HUMAN_AGENT window has also expired. You cannot message this customer until they reply again.");
              } else {
                alert(`Failed to send with HUMAN_AGENT tag: ${d2.error.message}`);
              }
              fetchAllConversations(true);
            }
          } catch {
            alert("Network error trying to send HUMAN_AGENT tag.");
          }
        } else {
          alert(`Failed to send: ${d1.error.message}`);
          fetchAllConversations(true);
        }
      }
    } catch { alert("Network error. Could not reach Facebook."); }
  };

  const toggleLabel = (label: string) => {
    if (!activeId) return;
    setAllConversations(prev => prev.map(c => {
      if (c.id === activeId) {
        const newLabels = c.labels.includes(label) ? c.labels.filter(l => l !== label) : [...c.labels, label];
        // ✅ Save to the canonical key (same format used during load at fetch time)
        localStorage.setItem(`labels_${c.id}`, JSON.stringify(newLabels));
        // ✅ Also save under the pageId_convId format used by the dashboard analytics
        const parts = c.id.split('_');
        if (parts.length >= 2) {
          const threadId = parts.slice(1).join('_');
          localStorage.setItem(`labels_${c.pageId}_${threadId}`, JSON.stringify(newLabels));
        }
        return { ...c, labels: newLabels };
      }
      return c;
    }));
  };

  const handleCreateCustomTag = () => {
    if (!newTagText.trim() || !activeId) return;
    const tag = newTagText.trim();
    if (!availableLabels.includes(tag)) {
      const updated = [...availableLabels, tag];
      setAvailableLabels(updated);
      localStorage.setItem('meta_labels', JSON.stringify(updated));
    }
    toggleLabel(tag);
    setNewTagText("");
  };

  // Filtered conversations — always keep the active/open chat visible
  const filteredConvs = allConversations.filter(c => {
    // ✅ Filter by selected page(s) — when a single page is opened, only show that page's chats
    const matchesPage = selectedPageIds.length === 0 || selectedPageIds.includes(c.pageId);
    const matchesSearch =
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.pageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.labels.some(l => l.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesUnread = showUnreadOnly ? (c.unread || c.id === activeId) : true;
    return matchesPage && matchesSearch && matchesUnread;
  });

  const unreadCount = allConversations.filter(c => c.unread).length;

  // Mark conversation as read when opened — also auto-resolves any "Bot Needs Agent" escalation
  const handleOpenConv = (convId: string) => {
    setActiveId(convId);

    const conv = allConversations.find(c => c.id === convId);
    const ts = conv?.lastMessageTimestamp || Date.now();
    setReadIds(prev => ({ ...prev, [convId]: ts }));
    setAllConversations(prev => prev.map(c => c.id === convId ? { ...c, unread: false } : c));

    // Auto-clear "Bot Needs Agent" when agent opens the chat
    if (conv) {
      const key = `${conv.pageId}_${conv.customerId}`;
      if (escalatedConvIds.has(key)) {
        setEscalatedConvIds(prev => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
        supabase
          .from('bot_escalations')
          .update({ is_resolved: true })
          .eq('page_id', conv.pageId)
          .eq('sender_id', conv.customerId)
          .eq('is_resolved', false)
          .then(() => {});
      }

      // ✅ Background-refresh ONLY this conversation's messages (no loading spinner, instant cache display)
      const page = pagesRef.current.find(p => p.id === conv.pageId);
      if (page) {
        const threadId = convId.split('_')[1];
        fetch(`https://graph.facebook.com/v19.0/${threadId}?fields=messages.limit(30){message,from,created_time}&access_token=${page.access_token}`)
          .then(r => r.json())
          .then(data => {
            const rawMessages = data.messages?.data || [];
            if (rawMessages.length === 0) return;
            const messages: Message[] = [...rawMessages].reverse().map((m: any) => {
              const rawText = m.message || "";
              const isBot = rawText.endsWith("\u200B");
              return {
                id: m.id,
                sender: m.from?.id === page.id ? "page" : "customer",
                text: isBot ? rawText.slice(0, -1) : rawText,
                time: timeAgo(m.created_time),
                timestamp: new Date(m.created_time).getTime(),
                isBot,
              };
            });
            setAllConversations(prev => prev.map(c =>
              c.id === convId ? { ...c, messages } : c
            ));
          })
          .catch(() => {}); // Silent fail — cached messages still show
      }
    }

    if (showUnreadOnly) {
      const remainingUnread = allConversations.filter(c => c.unread && c.id !== convId).length;
      if (remainingUnread === 0) setShowUnreadOnly(false);
    }
  };

  if (pages.length === 0) {
    return (
      <div className="glass rounded-2xl flex items-center justify-center h-[600px] border border-border">
        <div className="text-center p-8">
          <AlertTriangle className="w-7 h-7 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Facebook Pages Connected</h3>
          <p className="text-textMuted text-sm mb-4">Connect your pages in Settings to view your inbox.</p>
          <a href="/dashboard/settings" className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primaryHover text-white rounded-lg text-sm font-medium transition-colors">Go to Settings →</a>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl overflow-hidden flex flex-col border border-border" style={{ height: 'calc(100vh - 180px)', minHeight: '600px' }}>

      {/* ── TOP BAR (Visible on Unified AND Single Pages) ── */}
      <div className="p-3 border-b border-border bg-surface/60 flex items-center justify-between gap-3 flex-wrap">
        
        {/* Left Side: Filter or Page Name */}
        <div className="flex items-center gap-3 flex-wrap">
          {!filterPageId ? (
            <>
              <div className="relative">
                <button
                  onClick={() => setShowPageFilter(!showPageFilter)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-lg text-sm text-white hover:border-primary transition-colors"
                >
                  <Filter className="w-3.5 h-3.5 text-textMuted" />
                  <span>{selectedPageIds.length === pages.length ? "All Pages" : `${selectedPageIds.length} Pages`}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                </button>
                {showPageFilter && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-background border border-border rounded-xl shadow-2xl z-20 overflow-hidden">
                    <div className="p-2 border-b border-border">
                      <button
                        onClick={() => setSelectedPageIds(selectedPageIds.length === pages.length ? [] : pages.map(p => p.id))}
                        className="w-full text-left text-xs px-2 py-1.5 rounded-lg hover:bg-surface text-textMuted hover:text-white transition-colors"
                      >
                        {selectedPageIds.length === pages.length ? "Deselect All" : "Select All"}
                      </button>
                    </div>
                    {pages.map((page, idx) => (
                      <button
                        key={page.id}
                        onClick={() => togglePageSelection(page.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface transition-colors"
                      >
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-tr ${PAGE_COLORS[idx % PAGE_COLORS.length]} flex items-center justify-center text-[9px] font-bold text-white shrink-0`}>
                          {page.name[0]}
                        </div>
                        <span className="text-sm text-textMain truncate flex-1 text-left">{page.name}</span>
                        {selectedPageIds.includes(page.id) && <Check className="w-3 h-3 text-primary shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Page color legend */}
              <div className="flex items-center gap-2 flex-wrap">
                {pages.filter(p => selectedPageIds.includes(p.id)).map((page, idx) => (
                  <span key={page.id} className="flex items-center gap-1 text-[10px] text-textMuted">
                    <span className={`w-2 h-2 rounded-full bg-gradient-to-tr ${PAGE_COLORS[idx % PAGE_COLORS.length]}`} />
                    {page.name.length > 12 ? page.name.substring(0, 12) + "…" : page.name}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="text-sm font-semibold text-white px-2 flex items-center gap-2">
               <span className={`w-2 h-2 rounded-full bg-primary`} />
               {pages.find(p => p.id === filterPageId)?.name} Inbox
            </div>
          )}
        </div>

        {/* Right Side: Live Sync Options */}
        <div className="flex items-center gap-2">
          <span className={`text-xs flex items-center gap-1 ${isAutoSyncEnabled ? 'text-green-400' : 'text-textMuted'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isAutoSyncEnabled ? 'bg-green-500' : 'bg-gray-500'} ${isSyncing ? 'animate-ping' : ''}`} />
            {isSyncing ? 'Syncing...' : isAutoSyncEnabled ? 'Live' : 'Paused'}
          </span>
          <button onClick={() => setIsAutoSyncEnabled(!isAutoSyncEnabled)} className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${isAutoSyncEnabled ? 'bg-primary' : 'bg-surface border border-border'}`}>
            <span className={`inline-block h-2 w-2 transform rounded-full bg-white transition-transform ${isAutoSyncEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
          </button>
          
          <select 
            value={syncInterval} 
            onChange={(e) => setSyncInterval(Number(e.target.value))}
            disabled={!isAutoSyncEnabled}
            className="bg-background border border-border rounded text-[10px] text-textMuted px-1 py-0.5 outline-none cursor-pointer hover:border-primary transition-colors disabled:opacity-50"
          >
            <option value={15000}>15s</option>
            <option value={30000}>30s</option>
            <option value={60000}>60s</option>
          </select>

          <button onClick={() => fetchAllConversations()} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary text-white font-medium hover:bg-primary/90 transition-colors text-[10px] shadow-sm">
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            Manual Sync
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT: Conversation List — always visible ── */}
        <div style={{ width: '320px', minWidth: '320px' }} className="flex flex-col border-r border-border overflow-hidden shrink-0">
          {/* Header */}
          <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm text-white">
                {showUnreadOnly ? "Unread Chats" : "All Conversations"}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-textMuted">{filteredConvs.length} chats</span>
                {/* Unread toggle button */}
                <button
                  onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                    showUnreadOnly
                      ? "bg-primary text-white border-primary"
                      : unreadCount > 0
                      ? "bg-surface border-border text-textMuted hover:border-primary hover:text-white"
                      : "bg-surface border-border text-textMuted opacity-50 cursor-default"
                  }`}
                  disabled={unreadCount === 0 && !showUnreadOnly}
                >
                  {showUnreadOnly ? "✕ Unread" : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
                </button>
              </div>
            </div>
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-textMuted absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search customers, pages, tags..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 relative">
            {/* ✅ Subtle loading bar at top — never hides the conversation list */}
            {isLoading && (
              <div className="sticky top-0 z-10 w-full h-0.5 bg-surface overflow-hidden rounded-full mb-1">
                <div className="h-full bg-gradient-to-r from-primary to-violet-400 animate-pulse w-3/4" />
              </div>
            )}
            {filteredConvs.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center h-40 text-textMuted gap-2">
                <UserIcon className="w-8 h-8 opacity-40" />
                <p className="text-sm">No conversations found</p>
              </div>
            ) : (
              <AnimatePresence>
                {filteredConvs.map((conv, idx) => {
                  const pageIdx = pages.findIndex(p => p.id === conv.pageId);
                  const color = PAGE_COLORS[pageIdx % PAGE_COLORS.length];
                  return (
                    <motion.div
                      key={conv.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => handleOpenConv(conv.id)}
                      className={`p-3 rounded-xl cursor-pointer transition-all border relative overflow-hidden ${
                        activeId === conv.id
                          ? "bg-surface border-border"
                          : escalatedConvIds.has(`${conv.pageId}_${conv.customerId}`)
                          ? "bg-[#1a0f0f] border-l-4 border-l-orange-500 border-t-border border-r-border border-b-border shadow-md shadow-orange-500/10"
                          : conv.unread
                          ? "bg-[#1a1a2e] border-l-4 border-l-red-500 border-t-border border-r-border border-b-border shadow-md shadow-red-500/10"
                          : "hover:bg-surface border-transparent"
                      }`}
                    >
                      {/* Red left bar only for unread, not active */}
                      {conv.unread && activeId !== conv.id && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-400 to-orange-400 rounded-l-xl" />
                      )}

                      <div className="flex items-start gap-2.5">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${color} flex items-center justify-center text-white font-bold text-sm`}>
                            {conv.customerName.charAt(0)}
                          </div>
                          {/* Pulsing red dot — only if unread AND not currently open */}
                          {conv.unread && activeId !== conv.id && (
                            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-background">
                              <span className="w-full h-full rounded-full bg-red-400 animate-ping absolute" />
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-0.5">
                            <span className={`text-sm truncate ${
                              conv.unread && activeId !== conv.id
                                ? "text-white font-bold"
                                : "font-medium text-textMain"
                            }`}>
                              {conv.customerName}
                            </span>
                            <div className="flex items-center gap-1 shrink-0 ml-1">
                              <span className="text-[10px] text-textMuted">{conv.lastMessageTime}</span>
                              {/* Bot Needs Agent badge */}
                              {escalatedConvIds.has(`${conv.pageId}_${conv.customerId}`) && activeId !== conv.id && (
                                <span className="px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-[9px] font-bold">BOT NEEDS AGENT</span>
                              )}
                              {/* NEW badge */}
                              {conv.unread && activeId !== conv.id && !escalatedConvIds.has(`${conv.pageId}_${conv.customerId}`) && (
                                <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold">NEW</span>
                              )}
                              {!conv.unread && conv.replied && (
                                <CheckCheck className="w-3 h-3 text-primary" />
                              )}
                            </div>
                          </div>

                          {/* Page badge */}
                          <span className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-gradient-to-r ${color} bg-opacity-20 text-white mb-1`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                            {conv.pageName.length > 15 ? conv.pageName.substring(0, 15) + "…" : conv.pageName}
                          </span>

                          <p className={`text-xs truncate ${
                            conv.unread && activeId !== conv.id ? "text-white font-medium" : "text-textMuted"
                          }`}>
                            {conv.messages[conv.messages.length - 1]?.text || "..."}
                          </p>

                          {conv.labels.length > 0 && (
                            <div className="flex gap-1 mt-1.5 flex-wrap">
                              {conv.labels.slice(0, 2).map(label => (
                                <span key={label} className="text-[9px] px-1.5 py-0.5 rounded bg-surface border border-border text-textMuted">{label}</span>
                              ))}
                              {conv.labels.length > 2 && <span className="text-[9px] text-textMuted">+{conv.labels.length - 2}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* ── RIGHT: Chat Window — ALWAYS VISIBLE ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeId && activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-surface/30 flex justify-between items-center flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <button className="p-2 rounded-lg hover:bg-surface text-textMuted hover:text-white transition-colors" onClick={() => setActiveId(null)} title="Back to list">
                    <X className="w-5 h-5" />
                  </button>
                  {(() => {
                    const pageIdx = pages.findIndex(p => p.id === activeConv.pageId);
                    const color = PAGE_COLORS[pageIdx % PAGE_COLORS.length];
                    return (
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${color} flex items-center justify-center text-white font-bold shadow-lg`}>
                        {activeConv.customerName.charAt(0)}
                      </div>
                    );
                  })()}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{activeConv.customerName}</h3>
                      {escalatedConvIds.has(`${activeConv.pageId}_${activeConv.customerId}`) && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-[10px] font-bold">
                          <AlertTriangle className="w-3 h-3" /> Bot Needs Agent
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {(() => {
                        const pageIdx = pages.findIndex(p => p.id === activeConv.pageId);
                        const color = PAGE_COLORS[pageIdx % PAGE_COLORS.length];
                        return (
                          <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r ${color} text-white font-medium`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                            {activeConv.pageName}
                          </span>
                        );
                      })()}
                      <span className="text-xs text-textMuted">ID: {activeConv.customerId}</span>
                    </div>
                  </div>
                </div>
                {/* Bot Toggle in chat header */}
                <button
                  onClick={() => toggleBotForLead(activeConv.pageId, activeConv.customerId)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    !disabledLeadIds.has(`${activeConv.pageId}_${activeConv.customerId}`)
                      ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                      : 'bg-surface border-border text-textMuted hover:border-primary hover:text-white'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  {!disabledLeadIds.has(`${activeConv.pageId}_${activeConv.customerId}`) ? 'Bot On' : 'Bot Off'}
                  {!disabledLeadIds.has(`${activeConv.pageId}_${activeConv.customerId}`)
                    ? <ToggleRight className="w-4 h-4" />
                    : <ToggleLeft className="w-4 h-4" />}
                </button>

                {/* Labels */}
                <div className="relative flex items-center gap-2 flex-wrap justify-end">
                  {activeConv.labels.map(label => (
                    <span key={label} className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-primary/20 text-primary border border-primary/20 font-medium">
                      {label}
                      <button onClick={() => toggleLabel(label)} className="hover:text-white"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  <button onClick={() => setIsAddingLabel(!isAddingLabel)} className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-surface hover:bg-surfaceHover border border-border text-textMuted transition-colors">
                    <Plus className="w-3 h-3" /> Tag
                  </button>
                  {isAddingLabel && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-background border border-border rounded-xl shadow-2xl z-10 overflow-hidden flex flex-col">
                      <div className="p-2 border-b border-border">
                        <div className="flex items-center gap-2">
                          <input type="text" value={newTagText} onChange={e => setNewTagText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateCustomTag()} placeholder="Custom tag..." className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-primary text-white" />
                          <button onClick={handleCreateCustomTag} disabled={!newTagText.trim()} className="p-1.5 bg-primary text-white rounded-lg disabled:opacity-50"><Plus className="w-3 h-3" /></button>
                        </div>
                      </div>
                      {availableLabels.map(label => (
                        <button key={label} onClick={() => { toggleLabel(label); setIsAddingLabel(false); }} className={`w-full px-3 py-2 text-xs text-left hover:bg-surface transition-colors ${activeConv.labels.includes(label) ? 'text-primary' : 'text-textMain'}`}>
                          {activeConv.labels.includes(label) ? '✓ ' : ''}{label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3" onClick={() => setIsAddingLabel(false)}>
                {activeConv.messages.map(msg => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === "page" ? "items-end" : "items-start"}`}>
                    {msg.sender === "page" && msg.isBot && (
                      <span className="flex items-center gap-1 text-[9px] text-purple-400 mb-1 px-2">
                        <Bot className="w-2.5 h-2.5" /> Bot replied
                      </span>
                    )}
                    {msg.sender === "page" && !msg.isBot && (
                      <span className="flex items-center gap-1 text-[9px] text-primary mb-1 px-2">
                        <UserIcon className="w-2.5 h-2.5" /> Agent replied
                      </span>
                    )}
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-md ${
                      msg.sender === "page"
                        ? msg.isBot
                          ? "bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-br-sm border border-purple-500/30"
                          : "bg-gradient-to-r from-primary to-secondary text-white rounded-br-sm"
                        : "bg-surface text-textMain border border-border rounded-bl-sm"
                    }`}>
                      <p className="whitespace-pre-wrap break-words break-all">{msg.text}</p>
                      <p className="text-[10px] opacity-60 mt-1">{msg.time}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Box */}
              <div className="p-3 border-t border-border bg-surface/30">
                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div className="mb-2 p-3 bg-background border border-border rounded-xl grid grid-cols-10 gap-1">
                    {EMOJI_LIST.map(emoji => (
                      <button key={emoji} onClick={() => setReplyText(prev => prev + emoji)}
                        className="text-xl hover:bg-surface rounded-lg p-1 transition-colors leading-none">
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
                {/* Toolbar */}
                <div className="flex items-center gap-2 mb-2">
                  <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`p-2 rounded-lg transition-colors ${showEmojiPicker ? 'bg-primary/20 text-primary' : 'hover:bg-surface text-textMuted hover:text-white'}`}>
                    <Smile className="w-5 h-5" />
                  </button>
                  <button onClick={() => fileInputRef.current?.click()}
                    disabled={isSendingImage}
                    className="p-2 rounded-lg hover:bg-surface text-textMuted hover:text-white transition-colors disabled:opacity-50" title="Send Image">
                    {isSendingImage ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*,video/*,application/pdf" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleSendImage(f); e.target.value = ""; }}
                  />
                  <span className="text-xs text-textMuted ml-auto">Enter to send · Shift+Enter for new line</span>
                </div>
                <div className="flex gap-2 items-end">
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }}
                    placeholder={`Reply to ${activeConv.customerName} via ${activeConv.pageName}...`}
                    rows={2}
                    className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary resize-none transition-colors"
                  />
                  <button onClick={handleSendReply} disabled={!replyText.trim()}
                    className="p-3 rounded-xl bg-primary hover:bg-primaryHover text-white disabled:opacity-50 transition-all shrink-0 shadow-lg">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-textMuted gap-4">
              <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center">
                <UserIcon className="w-8 h-8 opacity-30" />
              </div>
              <div className="text-center">
                <p className="font-medium text-white">Select a conversation</p>
                <p className="text-sm mt-1">Choose any chat from the left to start replying</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
