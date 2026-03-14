import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'
import { getUserSession } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, message: '未登入' })
  }
  
  const userId = session.user.id
  
  try {
    const profile = await db.query.userProfiles.findFirst({
      where: eq(schema.userProfiles.accountId, userId)
    })
    
    if (!profile?.avatarUrl) {
      return { success: true, message: '冇頭像需要刪除' }
    }
    
    await db.update(schema.userProfiles)
      .set({
        avatarUrl: null,
        updatedAt: new Date()
      })
      .where(eq(schema.userProfiles.accountId, userId))
    
    return { success: true }
    
  } catch (error: any) {
    console.error('Avatar delete error:', error)
    throw createError({
      statusCode: 500,
      message: '刪除失敗: ' + error.message
    })
  }
})
