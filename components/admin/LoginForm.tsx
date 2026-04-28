'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LogIn } from 'lucide-react'

interface LoginFormProps {
  heading?: string
  subtitle?: string
}

export function LoginForm({
  heading = 'Welcome Back',
  subtitle = 'Sign in to your admin account',
}: LoginFormProps) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    const result = await signIn('credentials', {
      email: fd.get('email'),
      password: fd.get('password'),
      rememberMe: remember ? 'true' : 'false',
      redirect: false,
    })
    if (result?.error) {
      setError('Invalid email or password.')
      setLoading(false)
    } else {
      router.push('/admin')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 w-full">
      {/* Heading */}
      <div className="text-center mb-6">
        <h1 className="font-serif text-2xl text-ink-900 dark:text-white">{heading}</h1>
        <p className="mt-1.5 text-sm text-ink-500 dark:text-white/60">{subtitle}</p>
      </div>

      {error && (
        <p className="text-red-600 dark:text-red-300 text-sm bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 px-4 py-3 rounded-lg">
          {error}
        </p>
      )}

      {/* Email */}
      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-ink-700 dark:text-white/70 mb-1.5">
          Email Address
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-ink-200 dark:border-white/10 rounded-xl text-ink-900 dark:text-white placeholder-ink-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand/40 transition-colors"
          placeholder="admin@example.com"
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="login-password" className="block text-sm font-medium text-ink-700 dark:text-white/70 mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            id="login-password"
            name="password"
            type={showPw ? 'text' : 'password'}
            required
            autoComplete="current-password"
            className="w-full px-4 py-3 pr-11 bg-white dark:bg-white/5 border border-ink-200 dark:border-white/10 rounded-xl text-ink-900 dark:text-white placeholder-ink-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand/40 transition-colors"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-400 dark:text-white/40 hover:text-ink-600 dark:hover:text-white/70 transition-colors"
            aria-label={showPw ? 'Hide password' : 'Show password'}
          >
            {showPw ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>

      {/* Remember me + Forgot password */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={e => setRemember(e.target.checked)}
            className="rounded border-ink-300 dark:border-white/20 text-brand focus:ring-brand h-4 w-4"
          />
          <span className="text-sm text-ink-600 dark:text-white/60">Remember me</span>
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 bg-brand hover:bg-brand-600 disabled:opacity-60 text-white font-medium rounded-xl transition-colors shadow-glow-sm"
      >
        <LogIn className="h-4 w-4" />
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}
