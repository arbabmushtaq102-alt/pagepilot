import Link from 'next/link';
import Footer from '@/components/Footer';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden flex flex-col">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-hero-glow rounded-full blur-[120px] opacity-20 pointer-events-none" />
      
      {/* Header */}
      <header className="w-full border-b border-border/50 bg-background/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-xl font-bold text-white tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center overflow-hidden shrink-0">
              <img src="/logo.svg" alt="Pagepilot Logo" className="w-full h-full object-cover" />
              <span className="text-blue-500 font-bold hidden">P</span>
            </div>
            <span>Pagepilot</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-textMuted">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link href="/login" className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/10">Login</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 md:py-20 relative z-10">
        <div className="glass p-8 md:p-12 rounded-3xl border border-border/50 prose prose-invert prose-emerald max-w-none prose-headings:text-white prose-p:text-textMuted prose-a:text-primary hover:prose-a:text-primaryHover">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}
