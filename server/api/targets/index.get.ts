import { db, schema } from '@nuxthub/db'
import { eq, and } from 'drizzle-orm'
import { getUserSession } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, message: '未登入' })
  }

  const targets = await db.query.targets.findMany({
    where: and(
      eq(schema.targets.accountId, session.user.id),
      eq(schema.targets.isActive, true)
    )
  })

  return targets
})
