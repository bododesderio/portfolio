'use client'

import { useState } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { User } from 'lucide-react'
import { MediaPickerField } from '@/components/admin/MediaPickerField'

interface ProfileEditorProps {
  initialName: string
  initialAvatarUrl: string
  email: string
}

export function ProfileEditor({ initialName, initialAvatarUrl, email }: ProfileEditorProps) {
  const [name, setName] = useState(initialName)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), avatarUrl: avatarUrl || null }),
      })
      const data = (await res.json()) as { success?: boolean; error?: string }
      if (!res.ok) throw new Error(data.error || 'Failed to save.')
      toast.success('Profile updated.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const initial = (name || email || '?').charAt(0).toUpperCase()

  return (
    <div className="rounded-2xl border border-hairline bg-card p-6 space-y-6 max-w-xl">
      <div>
        <h2 className="font-serif text-lg text-fg">Edit profile</h2>
        <p className="text-sm text-fg-muted mt-1">Update your display name and avatar.</p>
      </div>

      {/* Avatar preview */}
      <div className="flex items-center gap-5">
        <div className="relative h-20 w-20 rounded-full overflow-hidden bg-muted border border-hairline flex-shrink-0">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Avatar" fill className="object-cover" sizes="80px" unoptimized />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-brand/10">
              <span className="text-2xl font-serif font-bold text-brand">{initial}</span>
            </div>
          )}
        </div>
        <div className="text-sm text-fg-muted">
          <p className="font-medium text-fg">{name || 'No name set'}</p>
          <p>{email}</p>
        </div>
      </div>

      {/* Name field */}
      <div>
        <label htmlFor="profile-name" className="block text-xs text-fg-muted mb-1">Display name</label>
        <input
          id="profile-name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name"
          className="w-full px-3 py-2.5 bg-muted border border-hairline rounded-lg text-fg focus:outline-none focus:ring-2 focus:ring-brand text-sm"
        />
      </div>

      {/* Avatar picker */}
      <MediaPickerField
        value={avatarUrl}
        onChange={setAvatarUrl}
        label="Avatar"
        placeholder="Pick or paste an avatar image..."
      />

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="px-5 py-2.5 bg-brand hover:bg-brand-600 disabled:opacity-40 disabled:pointer-events-none text-white text-sm font-medium rounded-lg transition-colors"
      >
        {saving ? 'Saving...' : 'Save profile'}
      </button>
    </div>
  )
}
