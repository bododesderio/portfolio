'use client'

import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export function DeleteProjectButton({ id }: { id: string }) {
  const router = useRouter()

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Delete this project? This cannot be undone.')) return

    const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Project deleted.')
      router.refresh()
    } else {
      toast.error('Failed to delete project.')
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="p-1.5 rounded-lg text-fg-muted hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
      title="Delete project"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
