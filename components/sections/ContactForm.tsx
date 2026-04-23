'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'

const subjects = [
  'Software Development Project',
  'Technical Consulting',
  'SEO & Digital Strategy',
  'Company Building',
  'Community Programme',
  'Speaking / Event',
  'Other',
]

export function ContactForm() {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success("Message sent! I'll get back to you within 24–48 hours.")
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-fg-muted mb-2">Name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-4 py-3 bg-card border border-hairline rounded-xl text-fg placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-fg-muted mb-2">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="w-full px-4 py-3 bg-card border border-hairline rounded-xl text-fg placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="your@email.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-fg-muted mb-2">Subject</label>
        <select
          required
          value={form.subject}
          onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
          className="w-full px-4 py-3 bg-card border border-hairline rounded-xl text-fg focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="">Select a subject</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-fg-muted mb-2">Message</label>
        <textarea
          required
          rows={6}
          value={form.message}
          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          className="w-full px-4 py-3 bg-card border border-hairline rounded-xl text-fg placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand resize-none"
          placeholder="Tell me about your project or idea..."
        />
      </div>

      <Button type="submit" disabled={loading} variant="primary" className="w-full">
        {loading ? 'Sending...' : 'Send message'}
      </Button>
    </form>
  )
}
