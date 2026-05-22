"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Bot, Plus, Trash2, ToggleLeft, ToggleRight, Save,
  MessageSquare, AlertTriangle, CheckCircle, Zap, X, Edit2, ChevronDown, ChevronUp, Copy,
  Image as ImageIcon, Loader2
} from "lucide-react";

interface BotRule {
  id: string;
  keywords: string[];
  response: string;
  is_active: boolean;
  media_url?: string;
}

interface BotConfig {
  page_id: string;
  page_name: string;
  page_picture?: string;
  is_enabled: boolean;
  fallback_message: string;
  bot_mode: "simple" | "ai";
  ai_prompt: string;
  ai_model: string;
}

interface Escalation {
  id: string;
  sender_id: string;
  sender_name: string;
  last_message: string;
  created_at: string;
  is_resolved: boolean;
  page_id: string;
}

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
                border: `1px solid ${active ? "#a78bfa" : "#2d2d5e"}`, cursor: "pointer"
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
                border: `1px solid ${active ? "#3b82f6" : "#2d2d5e"}`, cursor: "pointer"
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

export default function BotPage() {
  const supabase = createClient();
  const [pages, setPages] = useState<BotConfig[]>([]);
  const [selectedPage, setSelectedPage] = useState<BotConfig | null>(null);
  const [rules, setRules] = useState<BotRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRule, setNewRule] = useState({ keywords: "", response: "", media_url: "" });
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState("");
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: fbConn } = await supabase.from("facebook_connections").select("connected_pages").eq("user_id", user.id).single();
    const { data: configs } = await supabase.from("bot_configs").select("*").eq("user_id", user.id);
    if (fbConn?.connected_pages) {
      const pageList = fbConn.connected_pages.map((p: any) => {
        const existingConfig = configs?.find((c) => c.page_id === p.id);
        return {
          page_id: p.id, page_name: p.name,
          page_picture: p.picture?.data?.url,
          is_enabled: existingConfig?.is_enabled ?? false,
          fallback_message: existingConfig?.fallback_message ?? "Thank you for your message! Our team will get back to you shortly.",
          bot_mode: existingConfig?.bot_mode ?? 'simple',
          ai_prompt: existingConfig?.ai_prompt ?? '',
          ai_model: existingConfig?.ai_model ?? 'google/gemini-2.5-flash',
        };
      });
      setPages(pageList);
      if (pageList.length > 0) { setSelectedPage(pageList[0]); loadRules(pageList[0].page_id, user.id); }
    }
    setLoading(false);
  };

  const loadRules = async (pageId: string, userId?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const uid = userId || user?.id;
    if (!uid) return;
    const { data } = await supabase
      .from("bot_rules")
      .select("*")
      .eq("user_id", uid)
      .eq("page_id", pageId)
      .order("created_at");
    setRules(data || []);
  };

  const selectPage = (page: BotConfig) => {
    setSelectedPage(page);
    loadRules(page.page_id);
    setShowAddRule(false);
  };

  const toggleBot = async (page: BotConfig) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const newEnabled = !page.is_enabled;
    await supabase.from("bot_configs").upsert({
      user_id: user.id,
      page_id: page.page_id,
      page_name: page.page_name,
      is_enabled: newEnabled,
      fallback_message: page.fallback_message,
      bot_mode: page.bot_mode || 'simple',
      ai_prompt: page.ai_prompt || '',
      ai_model: page.ai_model || 'google/gemini-2.5-flash',
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,page_id" });

    const updated = pages.map((p) =>
      p.page_id === page.page_id ? { ...p, is_enabled: newEnabled } : p
    );
    setPages(updated);
    if (selectedPage?.page_id === page.page_id) {
      setSelectedPage({ ...selectedPage, is_enabled: newEnabled });
    }
  };

  const saveFallback = async () => {
    if (!selectedPage) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setSaving(true);
    await supabase.from("bot_configs").upsert({
      user_id: user.id,
      page_id: selectedPage.page_id,
      page_name: selectedPage.page_name,
      is_enabled: selectedPage.is_enabled,
      fallback_message: selectedPage.fallback_message,
      bot_mode: selectedPage.bot_mode || 'simple',
      ai_prompt: selectedPage.ai_prompt || '',
      ai_model: selectedPage.ai_model || 'google/gemini-2.5-flash',
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,page_id" });
    setSaving(false);
    setSavedMsg("Saved!");
    setTimeout(() => setSavedMsg(""), 2000);
  };


  const addRule = async () => {
    if (!selectedPage || !newRule.keywords.trim() || (!newRule.response.trim() && !newRule.media_url)) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setSaving(true);
    const keywords = newRule.keywords.split(",").map((k) => k.trim().toLowerCase()).filter(Boolean);
    
    if (editingRuleId) {
      await supabase.from("bot_rules").update({
        keywords,
        response: newRule.response,
        media_url: newRule.media_url || null,
      }).eq("id", editingRuleId);
    } else {
      await supabase.from("bot_rules").insert({
        user_id: user.id,
        page_id: selectedPage.page_id,
        keywords,
        response: newRule.response,
        media_url: newRule.media_url || null,
        is_active: true,
      });
    }
    
    setNewRule({ keywords: "", response: "", media_url: "" });
    setShowAddRule(false);
    setShowMediaUpload(false);
    setEditingRuleId(null);
    setSaving(false);
    loadRules(selectedPage.page_id);
  };

  const handleEditRule = (rule: BotRule) => {
    setEditingRuleId(rule.id);
    setNewRule({
      keywords: rule.keywords.join(", "),
      response: rule.response,
      media_url: rule.media_url || ""
    });
    setShowMediaUpload(!!rule.media_url);
    setShowAddRule(true);
    // Scroll to the form area
    document.getElementById("bot-config-area")?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia(true);
    const { data: { user } } = await supabase.auth.getUser();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user?.id}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file);
    
    if (uploadError) {
      alert("Error uploading image. Please ensure you have a public 'media' storage bucket in Supabase. " + uploadError.message);
      setUploadingMedia(false);
      return;
    }
    
    const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(filePath);
    setNewRule({ ...newRule, media_url: publicUrlData.publicUrl });
    setUploadingMedia(false);
  };

  const deleteRule = async (ruleId: string) => {
    await supabase.from("bot_rules").delete().eq("id", ruleId);
    setRules(rules.filter((r) => r.id !== ruleId));
  };

  const toggleRule = async (rule: BotRule) => {
    await supabase.from("bot_rules").update({ is_active: !rule.is_active }).eq("id", rule.id);
    setRules(rules.map((r) => r.id === rule.id ? { ...r, is_active: !r.is_active } : r));
  };

  const copyRulesToPages = async () => {
    if (!selectedPage || selectedTargets.length === 0) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setSaving(true);
    
    // For each target page, delete existing rules, then insert current rules
    for (const targetId of selectedTargets) {
      await supabase.from("bot_rules").delete().eq("page_id", targetId).eq("user_id", user.id);
      
      if (rules.length > 0) {
        const newRules = rules.map(r => ({
          user_id: user.id,
          page_id: targetId,
          keywords: r.keywords,
          response: r.response,
          is_active: r.is_active
        }));
        await supabase.from("bot_rules").insert(newRules);
      }
    }
    
    setSaving(false);
    setShowCopyModal(false);
    setSelectedTargets([]);
    setSavedMsg("Rules copied successfully!");
    setTimeout(() => setSavedMsg(""), 3000);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh" }}>
        <div style={{ textAlign: "center", color: "#a78bfa" }}>
          <Bot size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
          <p>Loading Bot Manager...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px)", background: "#0f0f1a", color: "#e2e8f0", fontFamily: "'Inter', sans-serif" }}>

      {/* LEFT: Page List */}
      <div style={{ width: 280, borderRight: "1px solid #1e1e3f", overflowY: "auto", background: "#0a0a15" }}>
        <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid #1e1e3f" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <Bot size={20} color="#a78bfa" />
            <span style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>Bot Manager</span>
          </div>
          <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Configure auto-replies per page</p>
        </div>

        {pages.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "#64748b" }}>
            <MessageSquare size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
            <p style={{ fontSize: 13 }}>No pages connected.<br />Go to Settings to connect.</p>
          </div>
        ) : (
          pages.map((page) => (
            <div
              key={page.page_id}
              onClick={() => selectPage(page)}
              style={{
                padding: "14px 16px",
                cursor: "pointer",
                borderBottom: "1px solid #1e1e3f",
                background: selectedPage?.page_id === page.page_id ? "#1a1a2e" : "transparent",
                borderLeft: selectedPage?.page_id === page.page_id ? "3px solid #a78bfa" : "3px solid transparent",
                transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {page.page_picture ? (
                  <img src={page.page_picture} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#1e1e3f", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <MessageSquare size={16} color="#a78bfa" />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{page.page_name}</div>
                  <div style={{ fontSize: 11, color: page.is_enabled ? "#4ade80" : "#64748b", marginTop: 2 }}>
                    {page.is_enabled ? "🟢 Bot Active" : "⚫ Bot Off"}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleBot(page); }}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  {page.is_enabled
                    ? <ToggleRight size={24} color="#a78bfa" />
                    : <ToggleLeft size={24} color="#374151" />}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* RIGHT: Rules Editor */}
      {selectedPage ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>

          {/* Header */}
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #1e1e3f", background: "#0d0d1f", display: "flex", alignItems: "center", gap: 16 }}>
            {selectedPage.page_picture && (
              <img src={selectedPage.page_picture} alt="" style={{ width: 44, height: 44, borderRadius: "50%" }} />
            )}
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff" }}>{selectedPage.page_name}</h2>
              <p style={{ margin: 0, fontSize: 12, color: selectedPage.is_enabled ? "#4ade80" : "#64748b" }}>
                {selectedPage.is_enabled ? "Bot is Active — responding to messages" : "Bot is Off — messages go to inbox only"}
              </p>
            </div>
            <button
              onClick={() => toggleBot(selectedPage)}
              style={{
                marginLeft: "auto", display: "flex", alignItems: "center", gap: 8,
                padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
                background: selectedPage.is_enabled ? "#4ade8020" : "#a78bfa20",
                color: selectedPage.is_enabled ? "#4ade80" : "#a78bfa",
              }}
            >
              {selectedPage.is_enabled ? <><ToggleRight size={16} />Turn Off Bot</> : <><ToggleLeft size={16} />Turn On Bot</>}
            </button>
          </div>
          <div style={{ padding: 24, flex: 1 }}>
            {selectedPage && (
              <>
                {/* Bot Mode Tabs / Toggles */}
                <div style={{ display: "flex", gap: 12, borderBottom: "1px solid #1e1e3f", paddingBottom: 16, marginBottom: 20 }}>
                  
                  {/* Simple Bot Toggle */}
                  <button
                    onClick={async () => {
                      // If it's already simple and enabled, turn it off. Otherwise, enable and set to simple.
                      const willBeEnabled = !(selectedPage.bot_mode === 'simple' && selectedPage.is_enabled);
                      const updated = { ...selectedPage, bot_mode: 'simple' as const, is_enabled: willBeEnabled };
                      setSelectedPage(updated);
                      setPages(pages.map(p => p.page_id === selectedPage.page_id ? updated : p));
                      const { data: { user } } = await supabase.auth.getUser();
                      if (user) {
                        await supabase.from("bot_configs").upsert({
                          user_id: user.id, page_id: updated.page_id, page_name: updated.page_name,
                          is_enabled: updated.is_enabled, fallback_message: updated.fallback_message,
                          bot_mode: 'simple', ai_prompt: updated.ai_prompt || '', ai_model: updated.ai_model || 'google/gemini-2.5-flash',
                          updated_at: new Date().toISOString(),
                        }, { onConflict: "user_id,page_id" });
                      }
                    }}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "10px 20px", borderRadius: 12, cursor: "pointer", fontWeight: 600, fontSize: 14,
                      background: (selectedPage.bot_mode === 'simple' && selectedPage.is_enabled) ? "#4ade8020" : "#1a1a2e",
                      color: (selectedPage.bot_mode === 'simple' && selectedPage.is_enabled) ? "#4ade80" : "#94a3b8",
                      border: `1px solid ${(selectedPage.bot_mode === 'simple' && selectedPage.is_enabled) ? "#4ade80" : "#2d2d5e"}`,
                      transition: "all 0.2s"
                    }}
                  >
                    💬 Simple Bot 
                    {(selectedPage.bot_mode === 'simple' && selectedPage.is_enabled) ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>

                  {/* AI Bot Toggle */}
                  <button
                    onClick={async () => {
                      // If it's already AI and enabled, turn it off. Otherwise, enable and set to AI.
                      const willBeEnabled = !(selectedPage.bot_mode === 'ai' && selectedPage.is_enabled);
                      const updated = { ...selectedPage, bot_mode: 'ai' as const, is_enabled: willBeEnabled };
                      setSelectedPage(updated);
                      setPages(pages.map(p => p.page_id === selectedPage.page_id ? updated : p));
                      const { data: { user } } = await supabase.auth.getUser();
                      if (user) {
                        await supabase.from("bot_configs").upsert({
                          user_id: user.id, page_id: updated.page_id, page_name: updated.page_name,
                          is_enabled: updated.is_enabled, fallback_message: updated.fallback_message,
                          bot_mode: 'ai', ai_prompt: updated.ai_prompt || '', ai_model: updated.ai_model || 'google/gemini-2.5-flash',
                          updated_at: new Date().toISOString(),
                        }, { onConflict: "user_id,page_id" });
                      }
                    }}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "10px 20px", borderRadius: 12, cursor: "pointer", fontWeight: 600, fontSize: 14,
                      background: (selectedPage.bot_mode === 'ai' && selectedPage.is_enabled) ? "#a78bfa20" : "#1a1a2e",
                      color: (selectedPage.bot_mode === 'ai' && selectedPage.is_enabled) ? "#a78bfa" : "#94a3b8",
                      border: `1px solid ${(selectedPage.bot_mode === 'ai' && selectedPage.is_enabled) ? "#a78bfa" : "#2d2d5e"}`,
                      transition: "all 0.2s"
                    }}
                  >
                    🤖 AI Assistant 
                    {(selectedPage.bot_mode === 'ai' && selectedPage.is_enabled) ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                </div>

                {selectedPage.bot_mode === 'ai' ? (
                  <div style={{ background: "#1a1a2e", border: "1px solid #2d2d5e", borderRadius: 12, padding: 24 }}>
                    <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "#fff" }}>🤖 AI Assistant Instructions</h3>
                    <p style={{ margin: "0 0 20px", fontSize: 12, color: "#64748b" }}>
                      Write instructions to guide your AI Bot. Describe your company, support policies, tone, and specific ways it should reply.
                    </p>

                    <div style={{ marginBottom: 20 }}>
                      <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 6 }}>Model Provider (OpenRouter)</label>
                      <select
                        value={selectedPage.ai_model}
                        onChange={(e) => {
                          const updated = { ...selectedPage, ai_model: e.target.value };
                          setSelectedPage(updated);
                          setPages(pages.map(p => p.page_id === selectedPage.page_id ? updated : p));
                        }}
                        style={{
                          width: "100%", background: "#0a0a15", border: "1px solid #2d2d5e",
                          borderRadius: 8, color: "#e2e8f0", padding: "10px 12px", fontSize: 13,
                          fontFamily: "inherit"
                        }}
                      >
                        <option value="openai/gpt-oss-120b:free">GPT-OSS 120B (Free)</option>
                        <option value="meta-llama/llama-3-8b-instruct:free">Llama 3 8B (Free)</option>
                        <option value="google/gemini-2.5-flash">Gemini 2.5 Flash</option>
                        <option value="google/gemini-2.5-pro">Gemini 2.5 Pro</option>
                        <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
                        <option value="meta-llama/llama-3.3-70b-instruct:free">Llama 3.3 70B (Free)</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: 24, marginTop: 16 }}>
                      <AiSettingsEditor 
                        selectedPage={selectedPage} 
                        updateAiPrompt={(val) => {
                          const updated = { ...selectedPage, ai_prompt: val };
                          setSelectedPage(updated);
                          setPages(pages.map(p => p.page_id === selectedPage.page_id ? updated : p));
                        }} 
                      />
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <button
                        onClick={saveFallback} // Save configurations (upserts back to DB)
                        disabled={saving}
                        style={{
                          padding: "10px 24px", background: "#a78bfa", border: "none",
                          borderRadius: 8, color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13
                        }}
                      >
                        {saving ? "Saving..." : "Save AI Configuration"}
                      </button>
                      {savedMsg && <span style={{ color: "#4ade80", fontSize: 13, fontWeight: 600 }}>{savedMsg}</span>}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Rules List */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#fff" }}>Keyword Rules</h3>
                        <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>{rules.length} rule{rules.length !== 1 ? "s" : ""} configured</p>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => setShowCopyModal(true)}
                          style={{
                            display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
                            background: "#1a1a2e", border: "1px solid #2d2d5e", borderRadius: 8, color: "#fff",
                            cursor: "pointer", fontWeight: 600, fontSize: 13,
                          }}
                        >
                          <Copy size={16} /> Apply to Other Pages
                        </button>
                        <button
                          onClick={() => {
                            setShowAddRule(true);
                            setShowMediaUpload(false);
                          }}
                          style={{
                            display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
                            background: "#a78bfa", border: "none", borderRadius: 8, color: "#fff",
                            cursor: "pointer", fontWeight: 600, fontSize: 13,
                          }}
                        >
                          <Plus size={16} /> Add Script
                        </button>
                        <button
                          onClick={() => {
                            setShowAddRule(true);
                            setShowMediaUpload(true);
                          }}
                          style={{
                            display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
                            background: "transparent", border: "1px solid #a78bfa", borderRadius: 8, color: "#a78bfa",
                            cursor: "pointer", fontWeight: 600, fontSize: 13,
                          }}
                        >
                          <ImageIcon size={16} /> Add Script + Media
                        </button>
                      </div>
                    </div>

                    {/* Add Rule Form */}
                    {showAddRule && (
                      <div id="bot-config-area" style={{ background: "#1a1a2e", border: "1px solid #a78bfa50", borderRadius: 12, padding: 20, marginBottom: 16 }}>
                        <h4 style={{ margin: "0 0 14px", color: "#a78bfa", fontSize: 14 }}>
                          {editingRuleId ? "✏️ Edit Keyword Rule" : "➕ New Keyword Rule"}
                        </h4>
                        <div style={{ marginBottom: 12 }}>
                          <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 6 }}>
                            Keywords <span style={{ color: "#64748b" }}>(comma separated, e.g: deposit, cashapp, pay)</span>
                          </label>
                          <input
                            value={newRule.keywords}
                            onChange={(e) => setNewRule({ ...newRule, keywords: e.target.value })}
                            placeholder="deposit, cashapp, send money..."
                            style={{
                              width: "100%", background: "#0a0a15", border: "1px solid #2d2d5e",
                              borderRadius: 8, color: "#e2e8f0", padding: "10px 12px", fontSize: 13,
                              fontFamily: "inherit", boxSizing: "border-box",
                            }}
                          />
                        </div>
                        <div style={{ marginBottom: 14 }}>
                          <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 6 }}>Bot Reply</label>
                          <textarea
                            value={newRule.response}
                            onChange={(e) => setNewRule({ ...newRule, response: e.target.value })}
                            placeholder="Write the exact reply the bot will send..."
                            rows={3}
                            style={{
                              width: "100%", background: "#0a0a15", border: "1px solid #2d2d5e",
                              borderRadius: 8, color: "#e2e8f0", padding: "10px 12px", fontSize: 13,
                              fontFamily: "inherit", resize: "vertical", boxSizing: "border-box",
                            }}
                          />
                        </div>

                        {showMediaUpload && (
                          <div style={{ marginBottom: 16, background: "#0a0a15", padding: 12, borderRadius: 8, border: "1px dashed #475569" }}>
                            <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 8 }}>Picture Attachment (Optional)</label>
                            {newRule.media_url ? (
                              <div style={{ position: "relative", display: "inline-block" }}>
                                <img src={newRule.media_url} alt="Uploaded preview" style={{ height: 100, borderRadius: 8, border: "1px solid #2d2d5e" }} />
                                <button
                                  onClick={() => setNewRule({ ...newRule, media_url: "" })}
                                  style={{ position: "absolute", top: -8, right: -8, background: "#ef4444", color: "#fff", border: "none", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  disabled={uploadingMedia}
                                  style={{ fontSize: 12, color: "#94a3b8" }}
                                />
                                {uploadingMedia && <Loader2 size={16} className="animate-spin text-blue-400" />}
                              </div>
                            )}
                          </div>
                        )}

                        <div style={{ display: "flex", gap: 10 }}>
                          <button
                            onClick={addRule}
                            disabled={saving || !newRule.keywords || (!newRule.response && !newRule.media_url)}
                            style={{
                              padding: "9px 20px", background: saving ? "#374151" : "#a78bfa",
                              border: "none", borderRadius: 8, color: "#fff", cursor: "pointer",
                              fontWeight: 600, fontSize: 13,
                            }}
                          >
                            {saving ? "Saving..." : (editingRuleId ? "Update Script" : "Save Script")}
                          </button>
                          <button
                            onClick={() => {
                              setShowAddRule(false);
                              setEditingRuleId(null);
                              setNewRule({ keywords: "", response: "", media_url: "" });
                            }}
                            style={{
                              padding: "9px 20px", background: "transparent",
                              border: "1px solid #2d2d5e", borderRadius: 8, color: "#94a3b8", cursor: "pointer",
                              fontWeight: 600, fontSize: 13,
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Rules */}
                    {rules.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>
                        <Zap size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
                        <p style={{ fontSize: 14 }}>No rules yet. Add your first keyword rule above!</p>
                      </div>
                    ) : (
                      rules.map((rule) => (
                        <div
                          key={rule.id}
                          style={{
                            background: "#1a1a2e", borderRadius: 12, padding: 16, marginBottom: 12,
                            border: `1px solid ${rule.is_active ? "#2d2d5e" : "#1e1e3f"}`,
                            opacity: rule.is_active ? 1 : 0.5, transition: "all 0.2s",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                                {rule.keywords.map((kw) => (
                                  <span key={kw} style={{
                                    background: "#a78bfa20", color: "#a78bfa", padding: "3px 10px",
                                    borderRadius: 20, fontSize: 12, fontWeight: 600, border: "1px solid #a78bfa30",
                                  }}>{kw}</span>
                                ))}
                              </div>
                              <div style={{ fontSize: 13, color: "#94a3b8", background: "#0a0a15", padding: "10px 12px", borderRadius: 8, borderLeft: "3px solid #a78bfa" }}>
                                {rule.response}
                                {rule.media_url && (
                                  <div style={{ marginTop: 8 }}>
                                    <img src={rule.media_url} alt="Attachment" style={{ maxHeight: 120, borderRadius: 8, border: "1px solid #2d2d5e" }} />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                              <button
                                onClick={() => toggleRule(rule)}
                                title={rule.is_active ? "Disable" : "Enable"}
                                style={{
                                  background: rule.is_active ? "#4ade8020" : "#37415150",
                                  border: "none", borderRadius: 6, padding: "6px 8px", cursor: "pointer",
                                  color: rule.is_active ? "#4ade80" : "#64748b",
                                }}
                              >
                                {rule.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                              </button>
                              <button
                                onClick={() => handleEditRule(rule)}
                                style={{ background: "#3b82f620", border: "none", borderRadius: 6, padding: "6px 8px", cursor: "pointer", color: "#3b82f6" }}
                                title="Edit Rule"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => deleteRule(rule.id)}
                                style={{ background: "#ef444420", border: "none", borderRadius: 6, padding: "6px 8px", cursor: "pointer", color: "#ef4444" }}
                                title="Delete Rule"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
          <div style={{ textAlign: "center" }}>
            <Bot size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p>Select a page to configure its bot</p>
          </div>
        </div>
      )}

      {/* Copy Rules Modal */}
      {showCopyModal && selectedPage && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#0f0f1a", width: 400, borderRadius: 16, border: "1px solid #2d2d5e", padding: 24, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 18, color: "#fff" }}>Apply Rules to Other Pages</h3>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#94a3b8" }}>
              Select the pages you want to apply these {rules.length} rules to. This will replace any existing rules on those pages.
            </p>
            <div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid #2d2d5e", borderRadius: 8, marginBottom: 16 }}>
              {pages.filter(p => p.page_id !== selectedPage.page_id).map(p => (
                <label key={p.page_id} style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, borderBottom: "1px solid #1e1e3f", cursor: "pointer", background: selectedTargets.includes(p.page_id) ? "#1a1a2e" : "transparent" }}>
                  <input 
                    type="checkbox" 
                    checked={selectedTargets.includes(p.page_id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedTargets([...selectedTargets, p.page_id]);
                      else setSelectedTargets(selectedTargets.filter(id => id !== p.page_id));
                    }}
                    style={{ accentColor: "#a78bfa", width: 16, height: 16 }}
                  />
                  <span style={{ fontSize: 14, color: "#fff" }}>{p.page_name}</span>
                </label>
              ))}
              {pages.filter(p => p.page_id !== selectedPage.page_id).length === 0 && (
                <div style={{ padding: 16, textAlign: "center", color: "#64748b", fontSize: 13 }}>No other pages available.</div>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowCopyModal(false)} style={{ padding: "8px 16px", background: "transparent", color: "#94a3b8", border: "1px solid #2d2d5e", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Cancel</button>
              <button onClick={copyRulesToPages} disabled={selectedTargets.length === 0 || saving} style={{ padding: "8px 16px", background: "#a78bfa", color: "#fff", border: "none", borderRadius: 8, cursor: selectedTargets.length === 0 ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 13, opacity: selectedTargets.length === 0 ? 0.5 : 1 }}>
                {saving ? "Applying..." : "Apply Rules"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
