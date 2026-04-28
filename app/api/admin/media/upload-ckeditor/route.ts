import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('upload') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  // Re-use the existing upload endpoint logic
  const fd = new FormData()
  fd.append('file', file)

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/admin/media/upload`, {
    method: 'POST',
    body: fd,
    headers: {
      cookie: req.headers.get('cookie') || '',
    },
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }

  const data = await res.json()
  // CKEditor expects { url: "..." } format
  return NextResponse.json({ url: data.url })
}
