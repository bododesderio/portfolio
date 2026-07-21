'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

/**
 * Shared create/update/delete plumbing for the admin resource managers. Each
 * manager keeps its own form state and table markup (those genuinely differ);
 * this hook owns the repeated fetch → toast → router.refresh() dance and the
 * `saving` flag.
 *
 * Messages are configurable so adopting the hook is behaviour-preserving — pass
 * the exact strings a manager used before.
 */
interface CrudMessages {
  saved?: string
  saveFailed?: string
  deleted?: string
  deleteFailed?: string
  deleteConfirm?: string
  patchFailed?: string
}

const DEFAULTS: Required<CrudMessages> = {
  saved: 'Saved!',
  saveFailed: 'Failed.',
  deleted: 'Deleted.',
  deleteFailed: 'Failed.',
  deleteConfirm: 'Delete this item?',
  patchFailed: 'Failed to update.',
}

export function useResourceCrud(endpoint: string, messages: CrudMessages = {}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const msg = { ...DEFAULTS, ...messages }

  /**
   * Create (no id) or update (id) with a JSON body. Toasts and refreshes on
   * success. Returns true on success so the caller can reset its form.
   */
  async function save(payload: unknown, editingId?: string | null): Promise<boolean> {
    setSaving(true)
    try {
      const res = await fetch(editingId ? `${endpoint}/${editingId}` : endpoint, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      toast.success(msg.saved)
      router.refresh()
      return true
    } catch {
      toast.error(msg.saveFailed)
      return false
    } finally {
      setSaving(false)
    }
  }

  /** Delete after a confirm() prompt. */
  async function remove(id: string): Promise<void> {
    if (!confirm(msg.deleteConfirm)) return
    const res = await fetch(`${endpoint}/${id}`, { method: 'DELETE' })
    if (res.ok) {
      router.refresh()
      toast.success(msg.deleted)
    } else {
      toast.error(msg.deleteFailed)
    }
  }

  /** PATCH a partial change (e.g. a visibility toggle) and refresh. */
  async function patch(id: string, partial: unknown): Promise<void> {
    try {
      const res = await fetch(`${endpoint}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partial),
      })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      toast.error(msg.patchFailed)
    }
  }

  return { saving, save, remove, patch }
}
