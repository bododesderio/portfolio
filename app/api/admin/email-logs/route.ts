import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = req.nextUrl
  const campaignId = url.searchParams.get('campaignId')
  const type = url.searchParams.get('type')
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
  const limit = Math.min(100, parseInt(url.searchParams.get('limit') || '50'))

  const where: Record<string, unknown> = {}
  if (campaignId) where.campaignId = campaignId
  if (type) where.type = type

  const [logs, total] = await Promise.all([
    prisma.emailLog.findMany({
      where,
      orderBy: { sentAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { events: true } } },
    }),
    prisma.emailLog.count({ where }),
  ])

  return NextResponse.json({ logs, total, page, limit })
}
