"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ArrowLeft, AlertTriangle, Layers } from "lucide-react";
import LiveInbox from "@/components/LiveInbox";

type Page = { id: string; name: string; access_token: string; };

const PAGE_COLORS = [
  "from-blue-500 to-blue-700",
  "from-purple-500 to-purple-700",
  "from-emerald-500 to-emerald-700",
  "from-orange-500 to-orange-700",
  "from-pink-500 to-pink-700",
  "from-cyan-500 to-cyan-700",
];

export default function InboxPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('meta_connected_pages');
    if (saved) { try { setPages(JSON.parse(saved)); } catch {} }
  }, []);

  const selectedPage = pages.find(p => p.id === selectedPageId);
  const isUnified = selectedPageId === "all";

  return (
    <div className="h-full flex flex-col space-y-6">
      <header className="border-b border-border pb-4 flex items-center gap-3">
        <AnimatePresence>
          {selectedPageId && (
            <motion.button
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              onClick={() => setSelectedPageId(null)}
              className="hover:bg-surface p-2 rounded-full transition-colors flex items-center justify-center shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-textMuted hover:text-white" />
            </motion.button>
          )}
        </AnimatePresence>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isUnified ? "Unified Inbox" : selectedPage ? selectedPage.name : "Inbox"}
          </h1>
          <p className="text-textMuted mt-1 text-sm">
            {selectedPageId
              ? isUnified
                ? "All conversations from every connected page in one place."
                : "Viewing conversations from this Facebook Page only."
              : pages.length > 0
                ? "Select a page to open its inbox, or view all pages together."
                : "Connect your Facebook Pages in Settings to get started."}
          </p>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {!selectedPageId ? (
          <motion.div
            key="page-selector"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {pages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-textMuted">
                <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mb-4">
                  <AlertTriangle className="w-7 h-7 text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-textMain mb-2">No Facebook Pages Connected</h3>
                <p className="text-sm mb-4">Connect your pages in Settings to view your real inbox.</p>
                <a href="/dashboard/settings" className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primaryHover text-white rounded-lg text-sm font-medium transition-colors">
                  Go to Settings →
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                {/* ── ALL PAGES UNIFIED CARD (full width) ── */}
                <motion.div
                  whileHover={{ y: -4 }}
                  onClick={() => setSelectedPageId("all")}
                  className="col-span-1 md:col-span-2 lg:col-span-3 glass p-6 rounded-2xl cursor-pointer border border-primary/30 hover:border-primary bg-primary/5 hover:bg-primary/10 relative overflow-hidden group transition-all duration-300"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all">
                    <Layers className="w-32 h-32" />
                  </div>
                  <div className="flex items-center gap-5 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary shadow-lg flex items-center justify-center shrink-0">
                      <Layers className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-textMain">All Pages — Unified Inbox</h3>
                        <span className="px-2.5 py-0.5 bg-primary/20 text-primary border border-primary/30 rounded-full text-xs font-semibold shrink-0">
                          {pages.length} Pages
                        </span>
                      </div>
                      <p className="text-sm text-textMuted mb-3">
                        View all conversations from every page in one place. Each chat shows a colored badge indicating which page it belongs to.
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {pages.map((p, i) => (
                          <span key={p.id} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r ${PAGE_COLORS[i % PAGE_COLORS.length]} text-white text-[11px] font-medium`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
                            {p.name.length > 14 ? p.name.slice(0, 14) + "…" : p.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-primary text-sm font-semibold group-hover:translate-x-1 transition-transform shrink-0">
                      Open →
                    </div>
                  </div>
                </motion.div>

                {/* ── INDIVIDUAL PAGE CARDS ── */}
                {pages.map((page, idx) => (
                  <motion.div
                    key={page.id}
                    whileHover={{ y: -4 }}
                    onClick={() => setSelectedPageId(page.id)}
                    className="glass p-6 rounded-2xl cursor-pointer transition-all duration-300 group border border-border/50 hover:border-primary/50 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all duration-500">
                      <MessageSquare className="w-24 h-24" />
                    </div>
                    <div className="flex items-start justify-between relative z-10">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${PAGE_COLORS[idx % PAGE_COLORS.length]} shadow-lg flex items-center justify-center text-xl font-bold text-white mb-4`}>
                        {page.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Connected
                      </div>
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-lg font-semibold text-textMain group-hover:text-primary transition-colors">{page.name}</h3>
                      <p className="text-xs text-textMuted mt-1">Page ID: {page.id}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="inbox-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1"
          >
            <LiveInbox filterPageId={isUnified ? null : selectedPageId} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
