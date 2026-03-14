import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'
import { getUserSession } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, message: '未登入' })
  }

  const body = await readBody(event)

  const [updated] = await db.update(schema.userProfiles)
    .set({
      firstName: body.firstName,
      lastName: body.lastName,
      gender: body.gender,
      heightCm: body.heightCm,
      birthDate: body.birthDate,
      description: body.description,
      preferences: body.preferences,
      updatedAt: new Date()
    })
    .where(eq(schema.userProfiles.accountId, session.user.id))
    .returning()

  return {
    success: true,
    profile: updated
  }
})
