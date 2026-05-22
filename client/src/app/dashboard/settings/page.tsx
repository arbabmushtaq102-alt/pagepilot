"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Trash2, Key, Calendar, ShieldCheck, Clock, LogOut, RefreshCw } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// ✅ ONE single App ID for ALL users — exactly like Hootsuite / PageInteract
const META_APP_ID = "1633126671278758";

export default function SettingsPage() {
  const [connectedPages, setConnectedPages] = useState<any[]>([]);
  const [fbUser, setFbUser] = useState<any>(null);
  const [autoSync, setAutoSync] = useState(true);
  const [license, setLicense] = useState<any>(null);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const supabase = createClient();

  // ── Save connection to Supabase for cross-device sync ──
  const saveToCloud = async (pages: any[], profile: any, token: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('facebook_connections').upsert({
      user_id: user.id,
      fb_user_id: profile.id,
      fb_user_name: profile.name,
      fb_user_picture: profile.picture?.data?.url || null,
      access_token: token,
      connected_pages: pages,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    // Also keep localStorage as fast cache
    localStorage.setItem('meta_connected_pages', JSON.stringify(pages));
    localStorage.setItem('meta_user_profile', JSON.stringify(profile));
    localStorage.setItem('meta_user_access_token', token);
  };

  // ── Load connection from Supabase (cross-device) ──
  const loadFromCloud = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase.from('facebook_connections').select('*').eq('user_id', user.id).single();
    if (data) {
      const pages = data.connected_pages || [];
      const profile = { id: data.fb_user_id, name: data.fb_user_name, picture: { data: { url: data.fb_user_picture } }, connected_date: data.connected_at };
      setConnectedPages(pages);
      setFbUser(profile);
      // Sync to localStorage as fast cache
      localStorage.setItem('meta_connected_pages', JSON.stringify(pages));
      localStorage.setItem('meta_user_profile', JSON.stringify(profile));
      localStorage.setItem('meta_user_access_token', data.access_token);
      return true;
    }
    return false;
  };

  useEffect(() => {
    // Fetch License
    const fetchLicense = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('licenses').select('*').eq('user_id', user.id).single();
        if (data) {
          setLicense(data);
          if (data.expires_at) {
            const diff = new Date(data.expires_at).getTime() - new Date().getTime();
            setDaysRemaining(Math.max(0, Math.ceil(diff / (1000 * 3600 * 24))));
          }
        } else {
          // Generate in-memory trial if within 3 days
          const trialEnds = new Date(user.created_at);
          trialEnds.setDate(trialEnds.getDate() + 3);
          if (new Date() < trialEnds) {
            setLicense({
              key: `TRIAL-${user.id.substring(0,8).toUpperCase()}`,
              status: 'active',
              expires_at: trialEnds.toISOString()
            });
            const diff = trialEnds.getTime() - new Date().getTime();
            setDaysRemaining(Math.max(0, Math.ceil(diff / (1000 * 3600 * 24))));
          }
        }
      }
    };
    fetchLicense();

    // Check if returning from Facebook OAuth
    const hash = window.location.hash;
    if (hash && hash.includes("access_token=")) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      if (accessToken) {
        Promise.all([
          fetch(`https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,category,picture&access_token=${accessToken}`).then(r => r.json()),
          fetch(`https://graph.facebook.com/v19.0/me?fields=id,name,picture&access_token=${accessToken}`).then(r => r.json()),
        ]).then(async ([pagesData, profileData]) => {
          const pages = pagesData?.data || [];
          const profile = profileData?.id ? { ...profileData, connected_date: new Date().toISOString() } : null;
          
          if (pages.length > 0) {
            const pageIds = pages.map((p: any) => p.id);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const { data: hasConflict } = await supabase.rpc('check_page_conflicts', { p_user_id: user.id, p_page_ids: pageIds });
              if (hasConflict) {
                alert("One or more of these Facebook Pages are already connected to another Pagepilot account. You cannot reuse pages across multiple free trials.");
                window.history.replaceState(null, '', window.location.pathname);
                setIsConnecting(false);
                return;
              }
            }

            // ✅ CRITICAL FIX: Automatically subscribe our app to EVERY connected page's webhooks
            // This ensures the bot will receive events and work for all pages, not just one.
            await Promise.all(pages.map((page: any) => 
              fetch(`https://graph.facebook.com/v19.0/${page.id}/subscribed_apps?subscribed_fields=messages,messaging_postbacks&access_token=${page.access_token}`, {
                method: 'POST'
              }).catch(err => console.error(`Failed to subscribe webhook for page ${page.name}:`, err))
            ));
          }

          if (pages.length > 0) setConnectedPages(pages);
          if (profile) setFbUser(profile);
          // ✅ Save to Supabase cloud so other devices get it
          if (profile) await saveToCloud(pages, profile, accessToken);
          window.history.replaceState(null, '', window.location.pathname);
          setIsConnecting(false);
        }).catch(() => { setIsConnecting(false); });
        return;
      }
    }

    // ✅ Load from Supabase first (cross-device), fallback to localStorage cache
    loadFromCloud().then(found => {
      if (!found) {
        const savedPages = localStorage.getItem('meta_connected_pages');
        const savedUser = localStorage.getItem('meta_user_profile');
        if (savedPages) { try { setConnectedPages(JSON.parse(savedPages)); } catch {} }
        if (savedUser) { try { setFbUser(JSON.parse(savedUser)); } catch {} }
      }
    });
  }, []);

  const handleConnectFacebook = () => {
    setIsConnecting(true);
    const redirectUri = encodeURIComponent(window.location.origin + "/dashboard/settings");
    const scope = "pages_show_list,pages_read_engagement,pages_manage_metadata,pages_read_user_content,pages_messaging,business_management";
    window.location.href = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${redirectUri}&scope=${scope}&response_type=token&auth_type=rerequest`;
  };

  const handleDisconnectAll = async () => {
    setConnectedPages([]); setFbUser(null);
    // Clear from cloud
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from('facebook_connections').delete().eq('user_id', user.id);
    // Clear local cache
    localStorage.removeItem('meta_user_access_token');
    localStorage.removeItem('meta_connected_pages');
    localStorage.removeItem('meta_user_profile');
    localStorage.removeItem('meta_connection_date');
  };

  const handleDisconnectPage = async (pageId: string) => {
    const updated = connectedPages.filter(p => p.id !== pageId);
    setConnectedPages(updated);
    // Update cloud too
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from('facebook_connections').update({ connected_pages: updated, updated_at: new Date().toISOString() }).eq('user_id', user.id);
    localStorage.setItem('meta_connected_pages', JSON.stringify(updated));
  };

  const isConnected = !!fbUser;

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <header className="border-b border-border pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-textMuted mt-1">Connect your Facebook pages to start managing messages.</p>
      </header>

      {/* License Status Card */}
      {license && (
        <div className="glass rounded-2xl p-6 relative overflow-hidden border border-border/50">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <Key className="w-48 h-48" />
          </div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">License Status</h3>
              <p className="text-sm text-textMuted">Your subscription details</p>
            </div>
            <div className="ml-auto">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-sm font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
            <div className="bg-surface p-4 rounded-xl border border-border">
              <p className="text-sm text-textMuted mb-1 flex items-center gap-1.5"><Key className="w-4 h-4" /> License Key</p>
              <p className="font-mono text-sm font-semibold truncate">{license.key}</p>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-border">
              <p className="text-sm text-textMuted mb-1 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Plan</p>
              <p className="font-semibold capitalize text-lg">{license.key?.startsWith('TRIAL') ? 'Free Trial' : 'Premium'}</p>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-border">
              <p className="text-sm text-textMuted mb-1 flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Expires</p>
              <p className="font-semibold">{new Date(license.expires_at).toLocaleDateString()}</p>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-border">
              <p className="text-sm text-textMuted mb-1 flex items-center gap-1.5"><Clock className="w-4 h-4" /> Remaining</p>
              <p className="font-semibold text-lg">{daysRemaining} Days</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Facebook Connection Card ── */}
      <div className="glass rounded-2xl overflow-hidden border border-border/50">
        {/* Card Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1877F2]/10 border border-[#1877F2]/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#1877F2]">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold">Facebook Integration</h3>
              <p className="text-xs text-textMuted">Connect your Facebook pages to manage messages</p>
            </div>
          </div>
          {isConnected && (
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Connected
            </span>
          )}
        </div>

        {!isConnected ? (
          /* ── NOT CONNECTED: Simple one-click connect ── */
          <div className="p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-[#1877F2]/10 border border-[#1877F2]/20 flex items-center justify-center mx-auto mb-6">
              <svg viewBox="0 0 24 24" className="w-10 h-10 fill-[#1877F2]">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Connect Your Facebook Account</h2>
            <p className="text-textMuted text-sm mb-8 max-w-md mx-auto">
              Click the button below to log in with Facebook. You will be able to choose which of your pages to connect and manage from this dashboard.
            </p>

            <button
              onClick={handleConnectFacebook}
              disabled={isConnecting}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-white text-lg bg-[#1877F2] hover:bg-[#166FE5] transition-all shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isConnecting ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              )}
              {isConnecting ? "Redirecting to Facebook..." : "Connect with Facebook"}
            </button>

            <p className="text-xs text-textMuted mt-6 max-w-sm mx-auto">
              🔒 We never post on your behalf. You control which pages to connect and can disconnect at any time.
            </p>
          </div>
        ) : (
          /* ── CONNECTED: Show profile ── */
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6 bg-surface rounded-xl p-5 border border-border">
              <div className="w-20 h-20 shrink-0 rounded-full border-4 border-background overflow-hidden shadow-xl">
                {fbUser.picture?.data?.url ? (
                  <img src={fbUser.picture.data.url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                    {fbUser.name?.[0] || 'U'}
                  </div>
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-2xl font-bold">{fbUser.name}</h4>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2 text-sm">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <CheckCircle className="w-4 h-4" /> {connectedPages.length} Pages Connected
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background border border-border text-textMuted">
                    <Calendar className="w-4 h-4" /> Connected {new Date(fbUser.connected_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full md:w-auto shrink-0">
                <button
                  onClick={handleConnectFacebook}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-xl font-semibold text-sm transition-all"
                >
                  <RefreshCw className="w-4 h-4" /> Reconnect / Add Pages
                </button>
                <button
                  onClick={handleDisconnectAll}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-semibold text-sm transition-all"
                >
                  <LogOut className="w-4 h-4" /> Disconnect Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Connected Pages List */}
      {connectedPages.length > 0 && (
        <div className="glass rounded-2xl p-6 space-y-3 border border-border/50">
          <h3 className="text-lg font-semibold">Active Pages ({connectedPages.length})</h3>
          <div className="space-y-2">
            {connectedPages.map((page: any) => (
              <div key={page.id} className="flex items-center justify-between p-4 bg-surface hover:bg-surfaceHover transition-colors rounded-xl border border-border group">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full border-2 border-background overflow-hidden bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {page.picture?.data?.url
                      ? <img src={page.picture.data.url} alt={page.name} className="w-full h-full object-cover" />
                      : page.name?.[0] || 'P'}
                  </div>
                  <div>
                    <p className="font-semibold">{page.name}</p>
                    <p className="text-xs text-textMuted flex items-center gap-1 mt-0.5">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      Page ID: {page.id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDisconnectPage(page.id)}
                  className="flex items-center gap-1.5 text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-300 hover:bg-red-400/10 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  <Trash2 className="w-4 h-4" /> Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Auto Sync */}
      <div className="glass rounded-2xl p-6 border border-border/50">
        <h3 className="text-lg font-semibold mb-4">Auto Sync</h3>
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="font-medium">Sync messages automatically</p>
            <p className="text-sm text-textMuted">Polls for new messages every 15 seconds across all connected pages.</p>
          </div>
          <div
            onClick={() => setAutoSync(!autoSync)}
            className={`w-12 h-6 rounded-full relative transition-colors duration-200 cursor-pointer ${autoSync ? 'bg-primary' : 'bg-border'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${autoSync ? 'right-1' : 'left-1'}`} />
          </div>
        </label>
      </div>

      {/* Customer Support Section */}
      <div className="glass rounded-2xl p-8 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500" />
        <h3 className="text-2xl font-extrabold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">Customer Support</h3>
        <p className="text-lg text-gray-300 font-medium mb-8">Need help or want to purchase a license? Reach out to our support team.</p>
        
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4 shadow-lg hover:border-white/20 transition-all">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Phone</p>
              <p className="font-bold text-white text-lg tracking-wide">0318 0716526</p>
            </div>
          </div>
          <div className="flex-1 bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4 shadow-lg hover:border-white/20 transition-all">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">WhatsApp</p>
              <p className="font-bold text-white text-lg tracking-wide">+92 318 0716526</p>
            </div>
          </div>
          <div className="flex-1 bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4 shadow-lg hover:border-white/20 transition-all">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Email</p>
              <p className="font-bold text-white text-base tracking-wide">nexopaysolution@gmail.com</p>
            </div>
          </div>
        </div>

        <h4 className="text-xl font-bold mb-4 text-white">License Pricing Plans</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-5 rounded-2xl hover:border-gray-500 transition-all shadow-lg">
            <div className="text-sm text-gray-300 mb-1 font-medium">Starter Plan</div>
            <div className="font-extrabold text-2xl mb-2 text-white">$25</div>
            <div className="text-xs text-gray-300 font-bold bg-gray-700 inline-block px-2 py-1 rounded-md">3 Months</div>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-blue-900 border border-blue-400 p-5 rounded-2xl relative overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <div className="absolute top-0 right-0 bg-white text-blue-900 text-[10px] font-extrabold px-3 py-1 rounded-bl-xl shadow-lg">POPULAR</div>
            <div className="text-sm text-blue-100 mb-1 font-medium">Popular Plan</div>
            <div className="font-extrabold text-2xl mb-2 text-white">$45</div>
            <div className="text-xs text-white font-bold bg-blue-500/50 inline-block px-2 py-1 rounded-md">6 Months</div>
          </div>
          <div className="bg-gradient-to-br from-purple-800 to-purple-950 border border-purple-600 p-5 rounded-2xl hover:border-purple-400 transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <div className="text-sm text-purple-200 mb-1 font-medium">Pro Plan</div>
            <div className="font-extrabold text-2xl mb-2 text-white">$60</div>
            <div className="text-xs text-white font-bold bg-purple-600/50 inline-block px-2 py-1 rounded-md">9 Months</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 border border-emerald-600 p-5 rounded-2xl hover:border-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <div className="text-sm text-emerald-200 mb-1 font-medium">Ultimate Plan</div>
            <div className="font-extrabold text-2xl mb-2 text-white">$90</div>
            <div className="text-xs text-white font-bold bg-emerald-600/50 inline-block px-2 py-1 rounded-md">12 Months</div>
          </div>
        </div>
      </div>
    </div>
  );
}
