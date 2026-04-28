'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Save } from 'lucide-react'
import { MediaPickerField } from '@/components/admin/MediaPickerField'

interface LoginSettings {
  login_background_url: string
  login_card_image: string
  login_heading: string
  login_subtitle: string
  login_overlay_title: string
  login_overlay_subtitle: string
}

export function LoginBackgroundCard({ initial }: { initial: LoginSettings }) {
  const [s, setS] = useState(initial)
  const [saving, setSaving] = useState(false)

  function update<K extends keyof LoginSettings>(key: K, val: string) {
    setS(prev => ({ ...prev, [key]: val }))
  }

  async function save() {
    setSaving(true)
    try {
      const fields = [
        { key: 'login_background_url', value: s.login_background_url },
        { key: 'login_card_image', value: s.login_card_image },
        { key: 'login_heading', value: s.login_heading },
        { key: 'login_subtitle', value: s.login_subtitle },
        { key: 'login_overlay_title', value: s.login_overlay_title },
        { key: 'login_overlay_subtitle', value: s.login_overlay_subtitle },
      ]
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: fields }),
      })
      if (!res.ok) throw new Error('Save failed')
      toast.success('Login page settings saved.')
    } catch {
      toast.error('Save failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-hairline bg-card p-6 space-y-6">
      <div>
        <h2 className="font-serif text-lg text-fg">Login page customization</h2>
        <p className="text-sm text-fg-muted mt-1">Customize the admin login page: images, text, and layout. Pick images from your media library or upload new ones.</p>
      </div>

      {/* Image pickers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MediaPickerField
          value={s.login_background_url}
          onChange={url => update('login_background_url', url)}
          label="Background image (blurred behind card)"
          placeholder="Pick from media library..."
        />
        <MediaPickerField
          value={s.login_card_image}
          onChange={url => update('login_card_image', url)}
          label="Card image (left panel)"
          placeholder="Pick from media library..."
        />
      </div>

      {/* Text fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-fg-muted mb-1.5">Heading</label>
          <input
            value={s.login_heading}
            onChange={e => update('login_heading', e.target.value)}
            className="w-full px-3 py-2 bg-muted border border-hairline rounded-lg text-sm text-fg focus:ring-2 focus:ring-brand focus:outline-none"
            placeholder="Welcome Back"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-fg-muted mb-1.5">Subtitle</label>
          <input
            value={s.login_subtitle}
            onChange={e => update('login_subtitle', e.target.value)}
            className="w-full px-3 py-2 bg-muted border border-hairline rounded-lg text-sm text-fg focus:ring-2 focus:ring-brand focus:outline-none"
            placeholder="Sign in to your admin account"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-fg-muted mb-1.5">Image overlay title</label>
          <input
            value={s.login_overlay_title}
            onChange={e => update('login_overlay_title', e.target.value)}
            className="w-full px-3 py-2 bg-muted border border-hairline rounded-lg text-sm text-fg focus:ring-2 focus:ring-brand focus:outline-none"
            placeholder="Bodo Desderio"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-fg-muted mb-1.5">Image overlay subtitle</label>
          <input
            value={s.login_overlay_subtitle}
            onChange={e => update('login_overlay_subtitle', e.target.value)}
            className="w-full px-3 py-2 bg-muted border border-hairline rounded-lg text-sm text-fg focus:ring-2 focus:ring-brand focus:outline-none"
            placeholder="Building the future..."
          />
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-600 disabled:opacity-50 transition-colors"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save login settings'}
        </button>
      </div>
    </div>
  )
}
