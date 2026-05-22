"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, MessageSquare, Send, Settings, LogOut, Bot, Phone, Mail } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inbox", href: "/dashboard/inbox", icon: MessageSquare },
  { name: "Campaigns", href: "/dashboard/campaigns", icon: Send },
  { name: "Bot Manager", href: "/dashboard/bot", icon: Bot },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];


export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleDisconnect = async () => {
    // Clear simulated session/auth state here if needed
    localStorage.removeItem('meta_user_access_token');
    localStorage.removeItem('meta_connected_pages');
    
    const { logout } = await import('@/app/login/actions');
    await logout();
  };

  const [showSupportModal, setShowSupportModal] = useState(false);

  return (
    <>
      <aside className="w-64 glass border-r border-y-0 border-l-0 flex flex-col h-full shrink-0">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white shadow-lg overflow-hidden shrink-0">
              <img src="/logo.svg" alt="Pagepilot Logo" className="w-full h-full object-cover" />
              <MessageSquare className="w-5 h-5 text-blue-500 hidden" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Pagepilot</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                  isActive 
                    ? "text-white bg-primary/10" 
                    : "text-textMuted hover:text-white hover:bg-surface"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                )}
                <Icon className={clsx("w-5 h-5", isActive ? "text-primary" : "opacity-70 group-hover:opacity-100")} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 mb-4">
          <button 
            onClick={() => setShowSupportModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:-translate-y-0.5 group"
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Phone className="w-3 h-3 text-white" />
            </div>
            Customer Support
          </button>
        </div>

        <div className="p-4 border-t border-border mt-auto">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border-2 border-background" />
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-semibold truncate">My Business Page</p>
              <p className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Connected
              </p>
            </div>
          </div>
          <button 
            onClick={handleDisconnect}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-textMuted hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Disconnect</span>
          </button>
        </div>
      </aside>

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111116] border border-white/10 p-6 sm:p-8 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative shadow-[0_0_40px_rgba(59,130,246,0.2)] animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowSupportModal(false)}
              className="absolute top-4 right-4 p-2 text-textMuted hover:text-white bg-surface rounded-full hover:bg-surfaceHover transition-colors z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            
            <h3 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">Customer Support</h3>
            <p className="text-gray-300 text-lg sm:text-xl font-medium mb-8">Contact our sales team directly to purchase a license key.</p>
            
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl mb-8 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-white tracking-wide">0318 0716526</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-white tracking-wide">+92 318 0716526 (WhatsApp)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-white tracking-wide">nexopaysolution@gmail.com</span>
                </div>
              </div>
              <a href="https://wa.me/923180716526" target="_blank" rel="noreferrer" className="bg-gradient-to-r from-[#25D366] to-[#1DA851] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(37,211,102,0.4)] hover:shadow-[0_0_25px_rgba(37,211,102,0.6)] hover:-translate-y-0.5">
                Chat on WhatsApp
              </a>
            </div>

            <h4 className="text-xl font-bold mb-4 text-white">Pricing Plans</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-5 rounded-2xl hover:border-gray-500 transition-all shadow-lg">
                <div className="text-sm text-gray-300 mb-1 font-medium">Starter Plan</div>
                <div className="font-extrabold text-2xl mb-1 text-white">$25</div>
                <div className="text-xs text-gray-300 font-bold bg-gray-700 inline-block px-2 py-1 rounded-md">3 Months</div>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-blue-900 border border-blue-400 p-5 rounded-2xl relative overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <div className="absolute top-0 right-0 bg-white text-blue-900 text-[10px] font-extrabold px-3 py-1 rounded-bl-xl shadow-lg">POPULAR</div>
                <div className="text-sm text-blue-100 mb-1 font-medium">Popular Plan</div>
                <div className="font-extrabold text-2xl mb-1 text-white">$45</div>
                <div className="text-xs text-white font-bold bg-blue-500/50 inline-block px-2 py-1 rounded-md">6 Months</div>
              </div>
              <div className="bg-gradient-to-br from-purple-800 to-purple-950 border border-purple-600 p-5 rounded-2xl hover:border-purple-400 transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                <div className="text-sm text-purple-200 mb-1 font-medium">Pro Plan</div>
                <div className="font-extrabold text-2xl mb-1 text-white">$60</div>
                <div className="text-xs text-white font-bold bg-purple-600/50 inline-block px-2 py-1 rounded-md">9 Months</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 border border-emerald-600 p-5 rounded-2xl hover:border-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <div className="text-sm text-emerald-200 mb-1 font-medium">Ultimate Plan</div>
                <div className="font-extrabold text-2xl mb-1 text-white">$90</div>
                <div className="text-xs text-white font-bold bg-emerald-600/50 inline-block px-2 py-1 rounded-md">12 Months</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
