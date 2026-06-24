import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full max-w-6xl mx-auto mt-24 mb-12 relative z-10 px-4">
      <div className="rounded-[2.5rem] p-8 md:p-12 bg-gradient-to-br from-surface via-[#13132B] to-primary/10 border border-primary/20 shadow-2xl shadow-primary/5 overflow-hidden relative">
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="grid md:grid-cols-12 gap-12 relative z-10">
          <div className="md:col-span-7">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-white shadow-lg overflow-hidden shrink-0 flex items-center justify-center">
                <img src="/logo.svg" alt="Pagepilot Logo" className="w-full h-full object-cover" />
                <MessageSquare className="w-5 h-5 text-blue-500 hidden" />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">Pagepilot</h3>
            </div>
            <p className="text-base text-textMuted leading-relaxed mb-6 max-w-xl">
              <span className="text-white font-medium">Page Pilot Software Limited by Nexo Solutions.</span><br className="mb-2" />
              We are a cutting-edge software company dedicated to building next-generation SaaS tools. Our mission is to empower digital marketers, agencies, and e-commerce brands to scale their social media presence, automate customer interactions, and supercharge their CRM capabilities using advanced AI technology.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                <span className="text-xs font-medium text-textMuted bg-background/50 px-4 py-2 rounded-xl border border-border">
                  &copy; {new Date().getFullYear()} Page Pilot Software Limited. All rights reserved.
                </span>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#ffffff',
                  background: 'rgba(99, 102, 241, 0.25)',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  borderRadius: '12px',
                  padding: '6px 14px',
                  letterSpacing: '0.01em',
                  display: 'inline-block',
                }}>
                  Muhammad Arbab — CEO &amp; Founder
                </span>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-5 flex flex-col md:items-end justify-center">
            <h4 className="text-sm font-bold text-white mb-6 uppercase tracking-widest">Legal & Support</h4>
            <div className="flex flex-wrap md:justify-end gap-x-6 gap-y-4 max-w-xs">
              <Link href="/privacy" className="text-sm text-textMuted hover:text-primary hover:-translate-y-0.5 transition-all">Privacy Policy</Link>
              <Link href="/terms" className="text-sm text-textMuted hover:text-primary hover:-translate-y-0.5 transition-all">Terms & Conditions</Link>
              <Link href="/cookies" className="text-sm text-textMuted hover:text-primary hover:-translate-y-0.5 transition-all">Cookie Policy</Link>
              <Link href="/refund" className="text-sm text-textMuted hover:text-primary hover:-translate-y-0.5 transition-all">Refund Policy</Link>
              <Link href="/disclaimer" className="text-sm text-textMuted hover:text-primary hover:-translate-y-0.5 transition-all">Disclaimer</Link>
              <Link href="/about" className="text-sm text-textMuted hover:text-primary hover:-translate-y-0.5 transition-all">About Us</Link>
              <Link href="/contact" className="text-sm text-textMuted hover:text-primary hover:-translate-y-0.5 transition-all">Contact Us</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
