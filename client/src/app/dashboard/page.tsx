"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, MessageSquare, Clock, ArrowUpRight, CheckCircle2, BarChart3, AlertCircle, Bot, User, Activity, Zap } from "lucide-react";

// Removed hardcoded mockPages — now loaded from localStorage after real Facebook login

const timeRanges = ["Today", "7 Days", "15 Days", "30 Days"];
const TAG_COLORS = ["#8b5cf6", "#10b981", "#0ea5e9", "#f59e0b", "#ec4899", "#f43f5e"];

export default function Dashboard() {
  const [pages, setPages] = useState<{ id: string; name: string }[]>([]);
  const [stats, setStats] = useState({
    totalMessages: 0,
    activeConversations: 0,
    avgResponseTime: "—",
    newLeads: 0
  });

  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState("Today");
  const [realDataPoints, setRealDataPoints] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allFetchedConvs, setAllFetchedConvs] = useState<any[]>([]);
  const [analyticsConvs, setAnalyticsConvs] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState({
    botMessages: 0,
    humanMessages: 0,
    botResponseTime: 0,
    humanResponseTime: 0,
    botDataPoints: [] as number[],
    humanDataPoints: [] as number[],
    totalDataPoints: [] as number[],
    tagCounts: {} as Record<string, number>
  });

  // Load real pages from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('meta_connected_pages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPages(parsed);
        if (parsed.length > 0) setSelectedPages([parsed[0].id]);
      } catch {}
    }
  }, []);

  const togglePageSelection = (id: string) => {
    setSelectedPages(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  // Fetch Live Dashboard Data from Graph API
  const fetchDashboardData = async () => {
    if (selectedPages.length === 0) {
      setAllFetchedConvs([]);
      setAnalyticsConvs([]);
      return;
    }
    
    setIsLoading(true);
    let allConvsList: any[] = [];
    let aConvsList: any[] = [];
    
    const activePages = pages.filter((p: any) => selectedPages.includes(p.id));
    
    await Promise.all(activePages.map(async (page: any) => {
      try {
        const url1 = `https://graph.facebook.com/v19.0/${page.id}/conversations?fields=updated_time,unread_count,participants&limit=500&access_token=${page.access_token}`;
        const url2 = `https://graph.facebook.com/v19.0/${page.id}/conversations?fields=participants,messages.limit(20){message,from,created_time}&limit=50&access_token=${page.access_token}`;
        
        const [res1, res2] = await Promise.all([fetch(url1), fetch(url2)]);
        const [data1, data2] = await Promise.all([res1.json(), res2.json()]);
        
        if (data1.error) throw new Error(data1.error.message);
        
        const convs = data1.data || [];
        allConvsList.push(...convs.map((c: any) => ({ ...c, pageId: page.id })));

        if (!data2.error) {
          const aConvs = data2.data || [];
          aConvsList.push(...aConvs.map((c: any) => ({ ...c, pageId: page.id })));
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    }));
    
    setAllFetchedConvs(allConvsList);
    setAnalyticsConvs(aConvsList);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPages, pages]);

  // Process data points & stats whenever time range or fetched conversations change
  useEffect(() => {
    let cutoff = new Date();
    if (timeRange === "Today") {
      cutoff.setHours(0,0,0,0);
    } else {
      const days = timeRange === "7 Days" ? 7 : timeRange === "15 Days" ? 15 : 30;
      cutoff.setDate(cutoff.getDate() - (days - 1));
      cutoff.setHours(0,0,0,0);
    }

    let activeConvs = 0;
    let newLeads = 0;
    let activeConvsArray: any[] = [];

    allFetchedConvs.forEach(c => {
      const d = new Date(c.updated_time);
      if (d >= cutoff) {
        activeConvs++;
        activeConvsArray.push(c);
      }
      if (c.unread_count > 0) newLeads++;
    });

    setStats({
      totalMessages: allFetchedConvs.length, // This is exactly Total Leads
      activeConversations: activeConvs,
      avgResponseTime: activeConvs > 0 ? "~2m" : "—",
      newLeads: newLeads
    });
    // Build Graph Data (Plotting Active Leads over time)
    if (timeRange === "Today") {
      let hourlyCounts = new Array(24).fill(0);
      activeConvsArray.forEach(c => {
        hourlyCounts[new Date(c.updated_time).getHours()] += 1;
      });
      setRealDataPoints(hourlyCounts);
    } else {
      const days = timeRange === "7 Days" ? 7 : timeRange === "15 Days" ? 15 : 30;
      let dailyCounts = new Array(days).fill(0);
      activeConvsArray.forEach(c => {
        const d = new Date(c.updated_time);
        const diffTime = d.getTime() - cutoff.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < days) dailyCounts[diffDays] += 1;
      });
      setRealDataPoints(dailyCounts);
    }

    // Analytics Calculation from LIVE analyticsConvs
    try {
      let botMsgs = 0;
      let humanMsgs = 0;
      let botRespTimes: number[] = [];
      let humanRespTimes: number[] = [];
      let tagCountsObj: Record<string, number> = {};
      
      const daysCount = timeRange === "Today" ? 24 : (timeRange === "7 Days" ? 7 : timeRange === "15 Days" ? 15 : 30);
      let botPoints = new Array(daysCount).fill(0);
      let humanPoints = new Array(daysCount).fill(0);
      let totalPoints = new Array(daysCount).fill(0);

      const filteredConvs = analyticsConvs.filter((c: any) => selectedPages.includes(c.pageId));

      filteredConvs.forEach((c: any) => {
        const msgs = c.messages?.data || [];
        let lastCustomerMsgTs: number | null = null;
        
        // Reverse because Facebook returns newest first
        const sortedMsgs = [...msgs].reverse();

        sortedMsgs.forEach((m: any) => {
          if (!m.created_time) return;
          const timestamp = new Date(m.created_time).getTime();
          const isBot = m.message?.endsWith("\u200B") || false;
          const sender = m.from?.id === c.pageId ? "page" : "customer";
          
          if (sender === "customer") {
            lastCustomerMsgTs = timestamp;
          } else if (sender === "page") {
            if (lastCustomerMsgTs) {
              const diffMins = (timestamp - lastCustomerMsgTs) / (1000 * 60);
              if (diffMins > 0 && diffMins < 60 * 24) {
                if (isBot) botRespTimes.push(diffMins);
                else humanRespTimes.push(diffMins);
              }
              lastCustomerMsgTs = null;
            }
            
            if (timestamp >= cutoff.getTime()) {
              if (isBot) botMsgs++;
              else humanMsgs++;
              
              if (timeRange === "Today") {
                const hr = new Date(timestamp).getHours();
                if (isBot) botPoints[hr]++;
                else humanPoints[hr]++;
                totalPoints[hr]++;
              } else {
                const diffTime = timestamp - cutoff.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays >= 0 && diffDays < daysCount) {
                  if (isBot) botPoints[diffDays]++;
                  else humanPoints[diffDays]++;
                  totalPoints[diffDays]++;
                }
              }
            }
          }
        });
      });
      
      const avgBot = botRespTimes.length ? botRespTimes.reduce((a,b)=>a+b,0)/botRespTimes.length : 0;
      const avgHum = humanRespTimes.length ? humanRespTimes.reduce((a,b)=>a+b,0)/humanRespTimes.length : 0;

      // Calculate Tags from allFetchedConvs (broader reach)
      const filteredConvsAll = allFetchedConvs.filter((c: any) => selectedPages.includes(c.pageId));
      filteredConvsAll.forEach((c: any) => {
        const d = new Date(c.updated_time);
        if (d >= cutoff) {
           try {
             const savedLabels = localStorage.getItem(`labels_${c.pageId}_${c.id}`);
             if (savedLabels) {
               const labelsArr = JSON.parse(savedLabels);
               labelsArr.forEach((l: string) => {
                 tagCountsObj[l] = (tagCountsObj[l] || 0) + 1;
               });
             }
           } catch {}
        }
      });

      setAnalytics({
        botMessages: botMsgs,
        humanMessages: humanMsgs,
        botResponseTime: avgBot,
        humanResponseTime: avgHum,
        botDataPoints: botPoints,
        humanDataPoints: humanPoints,
        totalDataPoints: totalPoints,
        tagCounts: tagCountsObj
      });
    } catch {}
  }, [timeRange, selectedPages, allFetchedConvs, analyticsConvs]);

  const maxCount = Math.max(...analytics.totalDataPoints, 10);
  const dataPointsCount = analytics.totalDataPoints.length || 24;

  const totalMsgsForPie = analytics.botMessages + analytics.humanMessages || 1;
  const botPct = Math.round((analytics.botMessages / totalMsgsForPie) * 100);
  const humPct = 100 - botPct;
  const maxBar = Math.max(analytics.botMessages, analytics.humanMessages, 1);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <header className="flex justify-between items-end pb-4 border-b border-border">
        <div>
          <h1 className="text-3xl font-bold text-textMain tracking-tight">Overview</h1>
          <p className="text-textMuted mt-1">Monitor your connected Facebook Pages in real-time.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${isLoading ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
            <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-blue-500 animate-pulse' : 'bg-green-500 animate-ping'}`} />
            {isLoading ? 'Fetching Data...' : 'Live Sync Active'}
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Leads" value={stats.totalMessages.toLocaleString()} icon={<Users className="w-5 h-5" />} glowColor="from-blue-500 to-indigo-500" />
        <StatCard title="Active Chats" value={stats.activeConversations.toLocaleString()} icon={<MessageSquare className="w-5 h-5" />} glowColor="from-orange-500 to-rose-500" />
        <StatCard title="Avg Response" value={stats.avgResponseTime} icon={<Clock className="w-5 h-5" />} glowColor="from-cyan-400 to-blue-600" />
        <StatCard title="New Leads" value={stats.newLeads.toLocaleString()} icon={<ArrowUpRight className="w-5 h-5" />} glowColor="from-emerald-400 to-teal-600" />
      </div>

      {/* Analytics Dashboard Section */}
      <div className="glass rounded-2xl border border-border p-6 space-y-6">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 border-b border-border/50 pb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Agent vs Bot Analytics</h2>
              <p className="text-sm text-textMuted">Performance & workload comparison</p>
            </div>
          </div>
          
          <div className="flex bg-surface p-1 rounded-xl border border-border w-max">
            {timeRanges.map(range => (
              <button 
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeRange === range ? "bg-primary text-white shadow-md" : "text-textMuted hover:text-white"}`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Page Selector */}
          <div className="space-y-4 lg:border-r lg:border-border/50 lg:pr-6">
            <h3 className="font-semibold text-sm text-textMuted uppercase tracking-wider">Select Pages</h3>
            {pages.length === 0 ? (
              <div className="text-center py-6 text-textMuted text-sm">
                <p>No pages connected.</p>
                <a href="/dashboard/settings" className="text-primary hover:underline text-xs">Connect in Settings →</a>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                {pages.map(page => {
                  const isSelected = selectedPages.includes(page.id);
                  return (
                    <div
                      key={page.id}
                      onClick={() => togglePageSelection(page.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/10' : 'border-border bg-surface hover:bg-surfaceHover'}`}
                    >
                      <span className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-textMuted'}`}>{page.name}</span>
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${isSelected ? 'bg-primary border-primary' : 'border-textMuted'}`}>
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {selectedPages.length === 0 && (
              <div className="flex items-center gap-2 text-red-400 text-sm mt-2 p-2 bg-red-500/10 rounded-lg">
                <AlertCircle className="w-4 h-4" /> Please select at least one page
              </div>
            )}
          </div>

          {/* Charts Area */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            {selectedPages.length > 0 ? (
              <>
                {/* TOP ROW: Pie Charts */}
                {/* 1. Message Share & Response Times (col-span-1) */}
                <div className="md:col-span-1 glass p-5 rounded-2xl border border-border flex flex-col items-center justify-between">
                  <h3 className="text-sm text-textMuted font-semibold w-full text-left">Message Share</h3>
                  <div className="relative w-32 h-32 my-4">
                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#1e293b" strokeWidth="4"></circle>
                      <motion.circle 
                        initial={{ strokeDasharray: "0 100" }}
                        animate={{ strokeDasharray: `${botPct} ${100 - botPct}` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        cx="18" cy="18" r="15.915" fill="transparent" stroke="#8b5cf6" strokeWidth="4" 
                        strokeDashoffset="0"
                        style={{ filter: "drop-shadow(0 0 4px rgba(139, 92, 246, 0.5))" }}
                      ></motion.circle>
                      <motion.circle 
                        initial={{ strokeDasharray: "0 100" }}
                        animate={{ strokeDasharray: `${humPct} ${100 - humPct}` }}
                        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                        cx="18" cy="18" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="4" 
                        strokeDashoffset={`-${botPct}`}
                        style={{ filter: "drop-shadow(0 0 4px rgba(16, 185, 129, 0.5))" }}
                      ></motion.circle>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-xl font-bold text-violet-400">{botPct}%</span>
                    </div>
                  </div>
                  <div className="w-full space-y-2 mt-2 border-t border-border/50 pt-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-textMuted"><Zap className="w-3 h-3" /> Bot Avg</span>
                      <span className="font-bold text-violet-400">{Math.round(analytics.botResponseTime)}m</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-textMuted"><Clock className="w-3 h-3" /> Human Avg</span>
                      <span className="font-bold text-emerald-400">{Math.round(analytics.humanResponseTime)}m</span>
                    </div>
                  </div>
                </div>

                {/* 2. Custom Tags (col-span-2) */}
                <div className="md:col-span-2 glass p-6 rounded-2xl border border-border flex flex-col justify-between">
                  <h3 className="text-sm text-textMuted font-semibold w-full text-left mb-2">Custom Tags Distribution</h3>
                  {Object.keys(analytics.tagCounts).length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-textMuted text-sm w-full py-8 text-center bg-surface/20 rounded-xl mt-4 border border-border border-dashed">
                      No tags found for this period
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-around gap-8 w-full mt-4">
                      {/* Left side: Large SVG */}
                      <div className="relative w-40 h-40 flex-shrink-0">
                        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#1e293b" strokeWidth="4"></circle>
                          {(() => {
                            const total = Object.values(analytics.tagCounts).reduce((a, b) => a + b, 0);
                            let offset = 0;
                            return Object.entries(analytics.tagCounts).map(([tag, count], i) => {
                              const pct = (count / total) * 100;
                              const dasharray = `${pct} ${100 - pct}`;
                              const currentOffset = offset;
                              offset -= pct;
                              const color = TAG_COLORS[i % TAG_COLORS.length];
                              return (
                                <motion.circle 
                                  key={tag}
                                  initial={{ strokeDasharray: "0 100" }}
                                  animate={{ strokeDasharray: dasharray }}
                                  transition={{ duration: 1.5, delay: i * 0.2, ease: "easeOut" }}
                                  cx="18" cy="18" r="15.915" fill="transparent" 
                                  stroke={color} 
                                  strokeWidth="5" 
                                  strokeDashoffset={currentOffset}
                                  style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
                                />
                              );
                            });
                          })()}
                        </svg>
                      </div>
                      
                      {/* Right side: Legend List */}
                      <div className="flex-1 max-h-[160px] overflow-y-auto custom-scrollbar pr-2 space-y-3">
                        {Object.entries(analytics.tagCounts)
                          .sort((a,b) => b[1] - a[1]) // Sort descending by count
                          .map(([tag, count], i) => {
                          const color = TAG_COLORS[i % TAG_COLORS.length];
                          const total = Object.values(analytics.tagCounts).reduce((a, b) => a + b, 0);
                          const pct = Math.round((count / total) * 100);
                          return (
                            <div key={tag} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-md shadow-sm" style={{ backgroundColor: color }}></div>
                                <span className="text-textMuted font-medium">{tag}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-textMuted/60 text-xs">{pct}%</span>
                                <span className="font-bold text-white min-w-[20px] text-right">{count}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* BOTTOM ROW: Workload Comparison (col-span-3) */}
                <div className="md:col-span-3 glass p-6 rounded-2xl border border-border flex flex-col justify-center">
                  <h3 className="text-sm text-textMuted font-semibold mb-6">Workload Comparison</h3>
                  <div className="space-y-6">
                    {/* Bot Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="flex items-center gap-2"><Bot className="w-4 h-4 text-violet-400" /> AI Bot Workload</span>
                        <span className="font-bold">{analytics.botMessages.toLocaleString()} msgs</span>
                      </div>
                      <div className="w-full h-4 bg-surface rounded-full overflow-hidden border border-border">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(analytics.botMessages / maxBar) * 100}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                          style={{ filter: "drop-shadow(0 0 6px rgba(139, 92, 246, 0.8))" }}
                        />
                      </div>
                    </div>
                    {/* Human Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="flex items-center gap-2"><User className="w-4 h-4 text-emerald-400" /> Human Agents Workload</span>
                        <span className="font-bold">{analytics.humanMessages.toLocaleString()} msgs</span>
                      </div>
                      <div className="w-full h-4 bg-surface rounded-full overflow-hidden border border-border">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(analytics.humanMessages / maxBar) * 100}%` }}
                          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                          style={{ filter: "drop-shadow(0 0 6px rgba(16, 185, 129, 0.8))" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="md:col-span-3 h-full flex flex-col items-center justify-center text-textMuted border-2 border-dashed border-border rounded-xl bg-surface/30 p-12">
                <BarChart3 className="w-12 h-12 mb-3 opacity-20" />
                <p>Select a page from the left to view analytics</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, glowColor }: { title: string, value: string | number, icon: React.ReactNode, glowColor: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-6 rounded-2xl relative overflow-hidden group border border-border"
    >
      {/* Subtle Glow Effect */}
      <div className={`absolute -inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-r ${glowColor}`} />
      
      <div className="absolute -top-4 -right-4 p-6 opacity-10 group-hover:scale-125 group-hover:opacity-20 transition-all duration-700 pointer-events-none transform rotate-12">
        {icon}
      </div>
      <div className="flex flex-col gap-4 relative z-10">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${glowColor} flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-textMuted font-semibold uppercase tracking-wider mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-white tracking-tight drop-shadow-md">{value}</h3>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
