'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

/**
 * LoginForm — always-dark glass card. By design, no `dark:` variants.
 * Lives on top of an admin-uploaded background image (Phase 3H).
 */
export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    const result = await signIn('credentials', {
      email: fd.get('email'),
      password: fd.get('password'),
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
    <form
      onSubmit={handleSubmit}
      className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8 space-y-5 w-full max-w-md"
    >
      <div className="mb-2">
        <h1 className="font-serif text-2xl text-white">Sign in</h1>
        <p className="mt-1 text-sm text-white/60">Welcome back. Pick up where you left off.</p>
      </div>

      {error && (
        <p className="text-red-300 text-sm bg-red-950/40 border border-red-800/40 px-4 py-3 rounded-lg">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="login-email" className="block text-xs font-medium uppercase tracking-widest text-white/70 mb-2">
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand/40 transition-colors"
          placeholder="admin@example.com"
        />
      </div>
      <div>
        <label htmlFor="login-password" className="block text-xs font-medium uppercase tracking-widest text-white/70 mb-2">
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand/40 transition-colors"
          placeholder="••••••••"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-brand hover:bg-brand-600 disabled:opacity-60 text-white font-medium rounded-full transition-colors shadow-glow-sm"
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
