import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'
import { getUserSession } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, message: '未登入' })
  }

  const profile = await db.query.userProfiles.findFirst({
    where: eq(schema.userProfiles.accountId, session.user.id)
  })

  if (!profile) {
    throw createError({ statusCode: 404, message: '用戶資料不存在' })
  }

  return profile
})
