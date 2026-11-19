'use client'

import { useEffect, useRef } from 'react'

/** Themed replacement for window.confirm, built on the native modal dialog for focus trapping. */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel = 'Cancel',
  tone = 'default',
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  body: string
  confirmLabel: string
  cancelLabel?: string
  tone?: 'default' | 'danger'
  onConfirm: () => void
  onCancel: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal()
    if (!open && dialog.current?.open) dialog.current.close()
  }, [open])
  return (
    <dialog
      ref={dialog}
      className="admin-site admin-confirm"
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
      aria-labelledby="admin-confirm-title"
    >
      <h2 id="admin-confirm-title">{title}</h2>
      <p>{body}</p>
      <div className="admin-confirm-actions">
        <button type="button" className="admin-secondary-button" onClick={onCancel} autoFocus>
          {cancelLabel}
        </button>
        <button
          type="button"
          className={tone === 'danger' ? 'admin-danger-button' : 'admin-primary-button'}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
