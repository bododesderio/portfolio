'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error || 'Subscription failed')
      }
      toast.success('Check your email to confirm your subscription!')
      setEmail('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        aria-label="Email address"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-full text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand w-full md:w-64"
      />
      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className="px-6 py-2 bg-brand hover:bg-brand-dark disabled:opacity-60 text-white font-medium rounded-full transition-colors"
      >
        {loading ? '...' : 'Subscribe'}
      </button>
    </form>
  )
}
