import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function DELETE() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { count } = await prisma.pageView.deleteMany()
    return NextResponse.json({ success: true, deleted: count })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
