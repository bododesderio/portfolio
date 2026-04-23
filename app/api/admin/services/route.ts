import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const s = await prisma.service.create({ data: body })
    return NextResponse.json(s, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Create failed.' }, { status: 500 })
  }
}
