'use client'

import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export function MessageActions({
  id,
  read,
  email,
  archived = false,
}: {
  id: string
  read: boolean
  email: string
  archived?: boolean
}) {
  const router = useRouter()

  async function patch(data: object) {
    const res = await fetch(`/api/admin/messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) router.refresh()
    else toast.error('Action failed.')
  }

  return (
    <div className="flex gap-3 text-sm">
      <button
        onClick={() => patch({ read: !read })}
        className="text-brand hover:underline"
      >
        {read ? 'Mark unread' : 'Mark read'}
      </button>
      <button
        onClick={() => patch({ archived: !archived })}
        className="text-fg-muted hover:underline"
      >
        {archived ? 'Restore to inbox' : 'Archive'}
      </button>
      <a href={`mailto:${email}`} className="text-fg-muted hover:underline">
        Reply
      </a>
    </div>
  )
}
