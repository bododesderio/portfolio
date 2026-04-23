'use client'

import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export function DeletePostButton({ id }: { id: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Delete this post?')) return
    const res = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Post deleted.')
      router.refresh()
    } else {
      toast.error('Failed to delete.')
    }
  }

  return (
    <button onClick={handleDelete} className="text-red-500 hover:underline text-sm">
      Delete
    </button>
  )
}
