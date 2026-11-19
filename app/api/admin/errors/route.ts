import { NextResponse } from 'next/server'
import { z } from 'zod'
import { basePrisma } from '@/lib/data/db'
import { withAdmin } from '@/lib/util/with-admin'
import { ERROR_STATUSES } from '@/lib/domain/error-reports'

const updateSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(200),
  status: z.enum(ERROR_STATUSES),
})

export const PATCH = withAdmin(
  async ({ data }) => {
    const { count } = await basePrisma.errorReport.updateMany({
      where: { id: { in: data.ids } },
      data: { status: data.status },
    })
    return NextResponse.json({ updated: count })
  },
  { schema: updateSchema, onError: 'Could not update the error reports.' }
)

/** Deletes resolved reports; open and ignored ones stay so repeats keep grouping. */
export const DELETE = withAdmin(async () => {
  const { count } = await basePrisma.errorReport.deleteMany({ where: { status: 'resolved' } })
  return NextResponse.json({ deleted: count })
})
