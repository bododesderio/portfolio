import type { Instrumentation } from 'next'

/** Records server render and route-handler failures in the admin error list. */
export const onRequestError: Instrumentation.onRequestError = async (error, request) => {
  // The import must sit inside this literal check so webpack drops the Prisma/ioredis
  // chain from the Edge bundle; an early return leaves it in and breaks the build.
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { recordError } = await import('@/lib/domain/error-reports')
    const failure = error instanceof Error ? error : new Error(String(error))
    const digest = (error as { digest?: string }).digest
    await recordError({
      source: 'server',
      message: digest ? `${failure.message} (digest ${digest})` : failure.message,
      stack: failure.stack,
      path: request.path.split('?')[0],
      userAgent: request.headers['user-agent']?.toString() ?? null,
    })
  }
}
