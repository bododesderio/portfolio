'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

export function NewsletterCompose() {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  async function handleSend() {
    if (!subject || !body) return toast.error('Subject and body required.')
    if (!confirm('Send to all confirmed subscribers?')) return
    setSending(true)
    try {
      const res = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body }),
      })
      if (!res.ok) throw new Error()
      toast.success('Campaign sent!')
      setSubject('')
      setBody('')
    } catch {
      toast.error('Failed to send campaign.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-card rounded-2xl border border-hairline p-6">
      <h2 className="font-serif text-xl text-fg mb-6">Compose Campaign</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-fg-muted mb-2">Subject</label>
          <input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="w-full px-4 py-3 bg-muted border border-hairline rounded-xl text-fg focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="Email subject..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-fg-muted mb-2">Body (HTML)</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={10}
            className="w-full px-4 py-3 bg-muted border border-hairline rounded-xl text-fg focus:outline-none focus:ring-2 focus:ring-brand resize-none font-mono text-sm"
            placeholder="<p>Your email content...</p>"
          />
        </div>
        <button
          onClick={handleSend}
          disabled={sending}
          className="w-full py-3 bg-brand hover:bg-brand-dark disabled:opacity-60 text-white font-medium rounded-full transition-colors"
        >
          {sending ? 'Sending...' : 'Send to all subscribers'}
        </button>
      </div>
    </div>
  )
}
