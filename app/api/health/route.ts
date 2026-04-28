import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  let dbConnected = false

  try {
    await prisma.$queryRawUnsafe('SELECT 1')
    dbConnected = true
  } catch {
    // DB unreachable
  }

  const body = {
    status: dbConnected ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    dbConnected,
  }

  return Response.json(body, { status: dbConnected ? 200 : 503 })
}
