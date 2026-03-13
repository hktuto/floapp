import { db, schema } from '@nuxthub/db'
import { eq, desc, and, gte, lte } from 'drizzle-orm'
import { getUserSession } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, message: '未登入' })
  }

  const query = getQuery(event)
  const from = query.from as string
  const to = query.to as string
  const limit = parseInt(query.limit as string) || 100

  let conditions: any = eq(schema.measurementRecords.accountId, session.user.id)
  
  if (from) {
    conditions = and(conditions, gte(schema.measurementRecords.recordedAt, from))
  }
  if (to) {
    conditions = and(conditions, lte(schema.measurementRecords.recordedAt, to))
  }

  const records = await db.query.measurementRecords.findMany({
    where: conditions,
    orderBy: [desc(schema.measurementRecords.recordedAt)],
    limit
  })

  return records
})
