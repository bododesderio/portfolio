'use client'

import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export function MessageActions({ id, read, email }: { id: string; read: boolean; email: string }) {
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
      <button onClick={() => patch({ read: !read })} className="text-brand hover:underline">
        {read ? 'Mark unread' : 'Mark read'}
      </button>
      <button onClick={() => patch({ archived: true })} className="text-ink-500 hover:underline">
        Archive
      </button>
      <a href={`mailto:${email}`} className="text-ink-500 hover:underline">Reply</a>
    </div>
  )
}
