import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const days = typeof body.days === 'number' && body.days > 0 ? body.days : 90

  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const { count } = await prisma.pageView.deleteMany({
    where: { createdAt: { lt: cutoff } },
  })

  return NextResponse.json({
    deleted: count,
    olderThan: cutoff.toISOString(),
    days,
  })
}
