'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { HEADER_BEHAVIORS, HEADER_BEHAVIOR_KEY, type HeaderBehavior } from '@/lib/domain/header-behavior'

export function HeaderBehaviorSetting({ initial }: { initial: HeaderBehavior }) {
  const [value, setValue] = useState<HeaderBehavior>(initial)
  const [saving, setSaving] = useState(false)

  async function choose(next: HeaderBehavior) {
    const previous = value
    setValue(next)
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: HEADER_BEHAVIOR_KEY, value: next }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      toast.success('Header behaviour saved.')
    } catch (error) {
      console.error('[navigation] header behaviour save failed', error)
      setValue(previous)
      toast.error('Could not save the header behaviour.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <fieldset className="admin-panel admin-form-panel admin-choice-group" disabled={saving}>
      <legend>Header on the public site</legend>
      {(Object.keys(HEADER_BEHAVIORS) as HeaderBehavior[]).map((option) => (
        <label key={option} className="admin-switch-row">
          <input
            type="radio"
            name="header-behavior"
            value={option}
            checked={value === option}
            onChange={() => choose(option)}
          />
          <span>
            <strong>{HEADER_BEHAVIORS[option].label}</strong>
            <small>{HEADER_BEHAVIORS[option].detail}</small>
          </span>
        </label>
      ))}
    </fieldset>
  )
}
