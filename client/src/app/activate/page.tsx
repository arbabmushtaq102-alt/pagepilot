'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { activateLicense } from './actions'
import { Key, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ActivatePage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    const result = await activateLicense(formData)
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 overflow-hidden">
            <img src="/logo.svg" alt="Pagepilot Logo" className="w-full h-full object-cover" />
            <ShieldCheck className="w-8 h-8 text-emerald-500 hidden" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
          Activate Your License
        </h2>
        <p className="mt-2 text-center text-sm text-textMuted px-4">
          Please enter your PagePilot license key to unlock your dashboard and features.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="glass py-8 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-border/50">
          <form action={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-textMain mb-2">License Key</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-textMuted" />
                </div>
                <input
                  name="key"
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl bg-surface/50 text-white placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all uppercase tracking-wider font-mono text-center"
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary hover:bg-primaryHover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Activate Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 flex justify-between items-center text-sm text-textMuted">
            <span>Need a license? <button onClick={(e) => { e.preventDefault(); setShowPurchaseDialog(true); }} className="text-primary hover:underline">Get All License Key</button></span>
            <button 
              onClick={async () => {
                const { logout } = await import('../login/actions')
                await logout()
              }}
              className="text-textMuted hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </motion.div>

      {/* Purchase License Modal */}
      {showPurchaseDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111116] border border-white/10 p-6 sm:p-8 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl"
          >
            <button 
              onClick={() => setShowPurchaseDialog(false)}
              className="absolute top-4 right-4 p-2 text-textMuted hover:text-white bg-surface rounded-full hover:bg-surfaceHover transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            
            <h3 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">Get All License Key</h3>
            <p className="text-gray-300 text-lg sm:text-xl font-medium mb-8">Contact our sales team directly to purchase a license key.</p>
            
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl mb-8 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </div>
                  <span className="font-bold text-white tracking-wide">0318 0716526</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  </div>
                  <span className="font-bold text-white tracking-wide">+92 318 0716526 (WhatsApp)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
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
          </motion.div>
        </div>
      )}
    </div>
  )
}
