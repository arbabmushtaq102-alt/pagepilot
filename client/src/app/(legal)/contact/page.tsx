'use client';

import { Mail, MessageCircle, MapPin, Send } from 'lucide-react';

export default function ContactUs() {
  return (
    <>
      <h1>Contact Us</h1>
      <p className="lead">Have a question, need technical support, or want to inquire about Enterprise plans? We're here to help.</p>

      <div className="not-prose grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
        <div className="bg-surface border border-border rounded-2xl p-6 text-center">
          <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Email Support</h3>
          <p className="text-sm text-textMuted mb-2">24/7 Priority Support</p>
          <a href="mailto:support@pagepilot.app" className="text-primary hover:underline font-medium">support@pagepilot.app</a>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 text-center">
          <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-lg mb-1">WhatsApp</h3>
          <p className="text-sm text-textMuted mb-2">Live Chat for Pro Users</p>
          <a href="#" className="text-emerald-400 hover:underline font-medium">+1 (555) 019-2834</a>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 text-center">
          <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Headquarters</h3>
          <p className="text-sm text-textMuted">San Francisco, CA<br/>United States</p>
        </div>
      </div>

      <div className="not-prose bg-surface border border-border rounded-3xl p-8">
        <h3 className="text-2xl font-bold mb-6">Send us a message</h3>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-textMuted mb-1">Name</label>
              <input type="text" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-white" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-textMuted mb-1">Email</label>
              <input type="email" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-white" placeholder="john@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-textMuted mb-1">Subject</label>
            <input type="text" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-white" placeholder="How can we help you?" />
          </div>
          <div>
            <label className="block text-sm font-medium text-textMuted mb-1">Message</label>
            <textarea rows={4} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-white resize-none" placeholder="Write your message here..."></textarea>
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-primaryHover text-white px-6 py-3 rounded-xl font-medium transition-colors">
            <Send className="w-4 h-4" />
            Send Message
          </button>
        </form>
      </div>
    </>
  );
}
