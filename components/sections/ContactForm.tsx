'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'

const subjects = [
  'Just saying hello',
  'A question or shared interest',
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
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error || 'Failed to send')
      }
      toast.success('Thanks, your message has been received.')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      toast.error(msg === 'Failed to send' ? 'Something went wrong. Please try again.' : msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="contact-name" className="block text-sm font-medium text-fg-muted mb-2">Name</label>
          <input
            id="contact-name"
            type="text"
            required
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-4 py-3 bg-card border border-hairline rounded-xl text-fg placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium text-fg-muted mb-2">Email</label>
          <input
            id="contact-email"
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
        <label htmlFor="contact-subject" className="block text-sm font-medium text-fg-muted mb-2">Subject</label>
        <select id="contact-subject" required value={form.subject} onChange={event => setForm(current => ({ ...current, subject: event.target.value }))}>
          <option value="">What would you like to talk about?</option>
          {subjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-fg-muted mb-2">Message</label>
        <textarea
          id="contact-message"
          required
          rows={6}
          value={form.message}
          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          className="w-full px-4 py-3 bg-card border border-hairline rounded-xl text-fg placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand resize-none"
          placeholder="What’s on your mind?"
        />
      </div>

      <Button type="submit" disabled={loading} aria-busy={loading} variant="primary" className="w-full personal-send-button">
        {loading ? 'Sending...' : 'Send message'}
      </Button>
    </form>
  )
}
