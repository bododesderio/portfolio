import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/data/db'
import { unlink } from 'fs/promises'
import { resolve, sep } from 'path'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const media = await prisma.media.findUnique({ where: { id: (await params).id } })
    if (!media) return NextResponse.json({ error: 'Not found.' }, { status: 404 })

    if (media.url.startsWith('/uploads/')) {
      const uploadsRoot = resolve(process.cwd(), 'public', 'uploads')
      const filePath = resolve(process.cwd(), 'public', media.url.replace(/^\/+/, ''))
      if (filePath.startsWith(`${uploadsRoot}${sep}`)) {
        await unlink(filePath).catch(() => null)
      }
    }

    await prisma.media.delete({ where: { id: (await params).id } })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Delete failed.' }, { status: 500 })
  }
}
