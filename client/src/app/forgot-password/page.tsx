'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import Footer from '@/components/Footer'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else {
      setIsSent(true)
      setIsLoading(false)
    }
  }

  return (
    <>
    <div className="min-h-screen bg-background flex flex-col justify-start pt-24 sm:px-6 lg:px-8 relative overflow-x-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden">
            <img src="/logo.svg" alt="Pagepilot Logo" className="w-full h-full object-cover" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-textMuted">
          Enter your email and we'll send you a link to reset your password
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="glass py-8 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-border/50">
          {isSent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Check your email</h3>
              <p className="text-sm text-textMuted">
                We've sent a password reset link to <span className="text-white font-medium">{email}</span>. 
                Click the link in the email to reset your password.
              </p>
              <p className="text-xs text-textMuted">
                Didn't receive it? Check your spam folder or try again.
              </p>
              <div className="pt-4 space-y-3">
                <button
                  onClick={() => { setIsSent(false); setEmail(''); }}
                  className="w-full py-3 px-4 border border-border rounded-xl text-sm font-medium text-white bg-surface hover:bg-surfaceHover transition-all"
                >
                  Try a different email
                </button>
                <Link
                  href="/login"
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 text-sm font-medium text-primary hover:text-primaryHover transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign in
                </Link>
              </div>
            </motion.div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-textMain mb-2">Email address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-textMuted" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl bg-surface/50 text-white placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary hover:bg-primaryHover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Send reset link'
                  )}
                </button>
              </form>

              <div className="mt-6">
                <Link
                  href="/login"
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-border rounded-xl text-sm font-medium text-white bg-surface hover:bg-surfaceHover transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
    <Footer />
    </>
  )
}
