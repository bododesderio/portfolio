'use client'
import { useState } from 'react'
import { ChevronLeft, Mail } from 'lucide-react'
import { MessageActions } from './MessageActions'
type Message = {
  id: string
  name: string
  email: string
  subject: string
  body: string
  read: boolean
  archived: boolean
  receivedAt: Date
}
export function Inbox({
  messages,
  initialSelected = null,
}: {
  messages: Message[]
  initialSelected?: string | null
}) {
  const [selected, setSelected] = useState<string | null>(initialSelected)
  const active = messages.find((message) => message.id === selected)
  return (
    <div className={`admin-inbox ${active ? 'has-selection' : ''}`}>
      <div className="admin-inbox-list admin-panel" aria-label="Messages">
        {messages.length ? (
          messages.map((message) => (
            <button
              key={message.id}
              type="button"
              onClick={() => setSelected(message.id)}
              aria-pressed={active?.id === message.id}
              className="admin-inbox-item"
            >
              <span className="admin-inbox-sender">
                {!message.read && (
                  <i className="admin-unread-dot" aria-label="Unread" />
                )}
                {message.name}
                <time dateTime={new Date(message.receivedAt).toISOString()}>
                  {new Date(message.receivedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    timeZone: 'UTC',
                  })}
                </time>
              </span>
              <strong>{message.subject}</strong>
              <span className="admin-inbox-preview">
                {message.body.slice(0, 100)}
              </span>
            </button>
          ))
        ) : (
          <p className="admin-empty">No messages match this view.</p>
        )}
      </div>
      <section
        className="admin-panel admin-inbox-detail"
        aria-label="Message detail"
        aria-live="polite"
      >
        {active ? (
          <>
            <button
              type="button"
              className="admin-inbox-back"
              onClick={() => setSelected(null)}
            >
              <ChevronLeft size={16} />
              Back to messages
            </button>
            <header>
              <p className="admin-section-label">
                {new Date(active.receivedAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  timeZone: 'UTC',
                })}
              </p>
              <h2>{active.subject}</h2>
              <div className="admin-inbox-from">
                <span>
                  <strong>{active.name}</strong>
                  <a href={`mailto:${active.email}`}>
                    {active.email}
                    <Mail size={12} aria-hidden="true" />
                  </a>
                </span>
                <MessageActions
                  id={active.id}
                  read={active.read}
                  email={active.email}
                  archived={active.archived}
                />
              </div>
            </header>
            <p className="admin-inbox-body">{active.body}</p>
          </>
        ) : (
          <div className="admin-inbox-placeholder">
            <Mail size={28} />
            <h2>A conversation starts here.</h2>
            <p>Select a message to read it and manage its status.</p>
          </div>
        )}
      </section>
    </div>
  )
}
