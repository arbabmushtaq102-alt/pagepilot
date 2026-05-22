"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageSquare, Users, BarChart3, Settings, Inbox, MessageCircle, CheckCircle2, ChevronRight, Play, Phone, Mail } from "lucide-react";
import Footer from "@/components/Footer";

export default function Home() {
  const router = useRouter();
  
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center overflow-hidden shrink-0">
              <img src="/logo.svg" alt="Pagepilot Logo" className="w-full h-full object-cover" />
              <span className="text-blue-500 font-bold hidden">P</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Pagepilot</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#solutions" className="hover:text-white transition-colors">Solutions</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="#resources" className="hover:text-white transition-colors">Resources</Link>
          </div>
          
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Log in</Link>
            <Link href="/register" className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        {/* Background Gradients */}
        <div className="absolute top-20 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute top-40 right-20 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[120px] -z-10" />

        <div className="flex-1 space-y-8 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300">
            <span className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center p-[2px]">
              <MessageSquare className="w-2.5 h-2.5 text-white" />
            </span>
            The All-In-One Facebook Management Platform
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Powerful tools to <br/>
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">manage, automate &<br/>grow</span> your Facebook<br/>Pages.
          </h1>
          
          <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
            Connect your Facebook Pages, automate conversations, engage your audience, and grow your business — all from one simple dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Link href="/register" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              Start Free Trial <ChevronRight className="w-5 h-5" />
            </Link>
            <Link href="/register" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-transparent border border-white/10 hover:bg-white/5 text-white font-semibold flex items-center justify-center gap-2 transition-all">
              <Play className="w-5 h-5" /> Book a Demo
            </Link>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-400 pt-2">
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500"/> No credit card required</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500"/> 3-day free trial</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500"/> Cancel anytime</div>
          </div>
        </div>

        {/* Hero Mockup */}
        <div className="flex-1 relative w-full lg:w-auto">
          <div className="relative rounded-2xl bg-[#111116] border border-white/10 shadow-2xl overflow-hidden aspect-[4/3] flex flex-col">
            {/* Window header */}
            <div className="h-10 border-b border-white/5 bg-white/5 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"/>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"/>
              <div className="w-3 h-3 rounded-full bg-green-500/80"/>
            </div>
            {/* Mockup content */}
            <div className="flex-1 p-6 relative">
              <div className="flex gap-6 h-full">
                {/* Sidebar mock */}
                <div className="w-48 hidden md:flex flex-col gap-4 border-r border-white/5 pr-6">
                  <div className="flex items-center gap-2 text-white font-bold mb-4">
                    <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center overflow-hidden">
                      <img src="/logo.svg" className="w-full h-full object-cover" />
                    </div>
                    PagePilot
                  </div>
                  {[
                    { i: BarChart3, t: "Overview", active: true },
                    { i: Inbox, t: "Inbox" },
                    { i: MessageCircle, t: "Conversations" },
                    { i: Users, t: "CRM" },
                    { i: Settings, t: "Settings" }
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center gap-3 text-sm px-3 py-2 rounded-lg ${item.active ? 'bg-blue-600/20 text-blue-400' : 'text-gray-500'}`}>
                      <item.i className="w-4 h-4" /> {item.t}
                    </div>
                  ))}
                </div>
                {/* Main mock */}
                <div className="flex-1 flex flex-col gap-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-xl font-bold text-white">Overview</h3>
                      <p className="text-sm text-gray-500">Welcome back, Alex 👋</p>
                    </div>
                    <div className="text-xs text-gray-500 px-3 py-1.5 rounded bg-white/5 border border-white/10">Last 7 days</div>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { t: "Messages", v: "12,548", c: "+18.2%" },
                      { t: "Response Time", v: "2m 36s", c: "-24%" },
                      { t: "New Followers", v: "3,982", c: "+11.0%" },
                      { t: "Engagement", v: "8.24%", c: "+2.7%" },
                    ].map((s, i) => (
                      <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-4">
                        <div className="text-xs text-gray-500 mb-1">{s.t}</div>
                        <div className="text-lg font-bold text-white mb-1">{s.v}</div>
                        <div className="text-xs text-green-500">{s.c}</div>
                      </div>
                    ))}
                  </div>
                  {/* Chart mock */}
                  <div className="flex-1 bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col">
                    <div className="text-sm font-medium text-gray-300 mb-4">Message Activity</div>
                    <div className="flex-1 relative flex items-end">
                      <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                        <path d="M0,30 Q10,10 20,20 T40,10 T60,25 T80,5 T100,20 L100,40 L0,40 Z" fill="rgba(37,99,235,0.2)" />
                        <path d="M0,30 Q10,10 20,20 T40,10 T60,25 T80,5 T100,20" fill="none" stroke="#3B82F6" strokeWidth="2" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="py-10 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-medium text-gray-500 mb-8">Trusted by marketers and businesses worldwide</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale">
            <div className="flex items-center gap-2 font-bold text-xl"><Users/> Socialize</div>
            <div className="flex items-center gap-2 font-bold text-xl"><div className="w-6 h-6 bg-current rounded-full"/> Pixel Studio</div>
            <div className="flex items-center gap-2 font-bold text-xl"><Settings/> GizmoHub</div>
            <div className="flex items-center gap-2 font-bold text-xl"><BarChart3/> UrbanWear</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 max-w-7xl mx-auto" id="features">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-6">Features</div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Everything you need to manage and grow on Facebook</h2>
          <p className="text-lg text-gray-400">Powerful features designed to save time, improve customer experience, and grow your business.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard 
            icon={Inbox}
            title="Smart Inbox"
            desc="All your messages from multiple Pages in one place. Never miss a conversation."
          />
          <FeatureCard 
            icon={Settings}
            title="Automations"
            desc="Automate replies, FAQs, and workflows to engage customers 24/7."
          />
          <FeatureCard 
            icon={Users}
            title="Customer CRM"
            desc="Track leads, manage customer data, and build stronger relationships."
          />
          <FeatureCard 
            icon={BarChart3}
            title="Analytics & Reports"
            desc="Get actionable insights and reports to measure and grow performance."
          />
          <FeatureCard 
            icon={Users}
            title="Team Collaboration"
            desc="Add your team, assign conversations, and collaborate seamlessly."
          />
          <FeatureCard 
            icon={MessageCircle}
            title="Comment & Post Tools"
            desc="Manage posts, schedule content, and auto-reply to comments."
          />
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="bg-[#111116] border border-white/5 rounded-3xl p-8 md:p-12 flex flex-wrap justify-between gap-8 text-center sm:text-left">
          <div>
            <div className="flex items-center gap-3 text-purple-400 mb-2 justify-center sm:justify-start">
              <div className="p-2 rounded-lg bg-purple-500/10"><Users className="w-5 h-5"/></div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">25K+</div>
            <div className="text-sm text-gray-500">Active Users</div>
          </div>
          <div>
            <div className="flex items-center gap-3 text-blue-400 mb-2 justify-center sm:justify-start">
              <div className="p-2 rounded-lg bg-blue-500/10"><MessageCircle className="w-5 h-5"/></div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">1.2M+</div>
            <div className="text-sm text-gray-500">Messages Managed</div>
          </div>
          <div>
            <div className="flex items-center gap-3 text-pink-400 mb-2 justify-center sm:justify-start">
              <div className="p-2 rounded-lg bg-pink-500/10"><Settings className="w-5 h-5"/></div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">500K+</div>
            <div className="text-sm text-gray-500">Conversations Automated</div>
          </div>
          <div>
            <div className="flex items-center gap-3 text-green-400 mb-2 justify-center sm:justify-start">
              <div className="p-2 rounded-lg bg-green-500/10"><CheckCircle2 className="w-5 h-5"/></div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">98.7%</div>
            <div className="text-sm text-gray-500">Customer Satisfaction</div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-sm font-medium mb-6">Testimonials</div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Loved by businesses like yours</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <TestimonialCard 
            text="PagePilot has completely transformed how we manage our Facebook Pages. Our response time improved by 80%!"
            author="Sarah Johnson"
            role="Marketing Manager, Pixel Studio"
          />
          <TestimonialCard 
            text="The automations and CRM features saved us countless hours. Highly recommended!"
            author="Michael Smith"
            role="Founder, Urban Wear"
          />
          <TestimonialCard 
            text="Super easy to use and the analytics help us grow faster every day."
            author="Emily Davis"
            role="Digital Marketer, Marketly"
          />
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto" id="pricing">
        <div className="text-center mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm font-medium mb-6">Pricing</div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-400 text-lg">Choose the perfect plan for your business growth.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <PricingCard 
            title="Starter Plan"
            duration="3 Months"
            price="$25"
            features={[
              "Unlimited Messages",
              "AI Chat Support",
              "Fast Response Speed",
              "Easy Dashboard Access",
              "24/7 Availability",
              "Smart Auto Replies",
              "Regular Updates"
            ]}
          />
          <PricingCard 
            title="Popular Plan"
            duration="6 Months"
            price="$45"
            isPopular={true}
            features={[
              "Unlimited Messages",
              "AI Chat Support",
              "Faster Response Speed",
              "Priority Support",
              "Smart Automation",
              "Auto Reply System",
              "Desktop Access",
              "Easy Setup",
              "Regular Feature Updates"
            ]}
          />
          <PricingCard 
            title="Pro Plan"
            duration="9 Months"
            price="$60"
            features={[
              "Unlimited Messages",
              "Premium AI Features",
              "Instant Replies",
              "Priority Customer Support",
              "Smart Automation Tools",
              "Advanced Dashboard",
              "Multi Device Access",
              "Better Performance",
              "New Features Included"
            ]}
          />
          <PricingCard 
            title="Ultimate Plan"
            duration="12 Months"
            price="$90"
            features={[
              "Unlimited Messages",
              "All Premium Features",
              "Fastest AI Responses",
              "VIP Priority Support",
              "Full Automation Access",
              "Advanced Analytics",
              "Multi Platform Support",
              "Unlimited Usage",
              "Early Access To New Features"
            ]}
          />
        </div>
        
        {/* Contact Support for License Block */}
        <div className="mt-16 bg-[#111116] border border-white/10 p-8 md:p-12 rounded-3xl shadow-[0_0_40px_rgba(37,99,235,0.1)] relative overflow-hidden text-center md:text-left flex flex-col items-center md:items-start">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500" />
          
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-8">
            <div className="max-w-3xl">
              <h3 className="text-3xl font-extrabold mb-3 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">Get Your License Key Today</h3>
              <p className="text-gray-300 text-lg sm:text-xl font-medium leading-relaxed">If you want to get a license, contact us here using the details provided below.</p>
            </div>
            
            <a href="https://wa.me/923180716526" target="_blank" rel="noreferrer" className="shrink-0 bg-gradient-to-r from-[#25D366] to-[#1DA851] text-white px-10 py-5 rounded-2xl font-extrabold text-xl transition-all flex items-center justify-center gap-4 shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:shadow-[0_0_30px_rgba(37,211,102,0.6)] hover:-translate-y-1 w-full md:w-auto">
              <MessageSquare className="w-8 h-8" />
              Chat on WhatsApp
            </a>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-6 justify-center md:justify-start items-center w-full">
            <div className="flex items-center justify-center gap-3 bg-white/5 px-6 py-4 rounded-full border border-white/5 hover:border-blue-500/30 transition-colors w-full md:w-auto">
              <Phone className="w-5 h-5 text-blue-400" />
              <span className="font-bold text-white tracking-wide text-lg">0318 0716526</span>
            </div>
            <div className="flex items-center justify-center gap-3 bg-white/5 px-6 py-4 rounded-full border border-white/5 hover:border-purple-500/30 transition-colors w-full md:w-auto">
              <Mail className="w-5 h-5 text-purple-400" />
              <span className="font-bold text-white tracking-wide text-lg">nexopaysolution@gmail.com</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="bg-[#111116] border border-white/5 p-8 rounded-2xl hover:bg-white/[0.03] transition-colors group">
      <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-gray-400 mb-6 leading-relaxed">{desc}</p>
      <Link href="#" className="flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300">
        Learn more <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

function TestimonialCard({ text, author, role }: { text: string, author: string, role: string }) {
  return (
    <div className="bg-[#111116] border border-white/5 p-8 rounded-2xl flex flex-col justify-between">
      <div>
        <div className="text-4xl text-blue-500/50 font-serif leading-none mb-4">"</div>
        <p className="text-gray-300 leading-relaxed mb-8">{text}</p>
      </div>
      <div>
        <div className="font-bold text-white mb-1">— {author}</div>
        <div className="text-sm text-gray-500">{role}</div>
      </div>
    </div>
  );
}

function PricingCard({ title, duration, price, features, isPopular }: { title: string, duration: string, price: string, features: string[], isPopular?: boolean }) {
  return (
    <div className={`relative bg-[#111116] border ${isPopular ? 'border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.2)]' : 'border-white/5'} p-8 rounded-3xl flex flex-col hover:border-white/20 transition-all`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-xs font-bold text-white tracking-wide uppercase">
          Most Popular
        </div>
      )}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm font-medium">{duration}</p>
        <div className="mt-6 flex items-baseline gap-2">
          <span className="text-5xl font-extrabold tracking-tight">{price}</span>
        </div>
      </div>
      
      <div className="flex-1 space-y-4 mb-8">
        {features.map((feature, i) => (
          <div key={i} className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <span className="text-gray-300 text-sm">{feature}</span>
          </div>
        ))}
      </div>

      <Link 
        href="/register" 
        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all ${
          isPopular 
            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' 
            : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
        }`}
      >
        Get Started
      </Link>
    </div>
  );
}
