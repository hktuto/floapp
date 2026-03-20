import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'
import { getUserSession } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, message: '未登入' })
  }
  
  // 檢查 admin 權限
  const adminProfile = await db.query.userProfiles.findFirst({
    where: eq(schema.userProfiles.accountId, session.user.id)
  })
  
  if (adminProfile?.role !== 'admin') {
    throw createError({ statusCode: 403, message: '無權限訪問' })
  }
  
  // 獲取用戶 ID
  const userId = getRouterParam(event, 'id')
  if (!userId) {
    throw createError({ statusCode: 400, message: '缺少用戶 ID' })
  }
  
  // 獲取請求體
  const body = await readBody(event)
  const { role } = body
  
  // 驗證 role
  if (!['admin', 'teacher', 'user'].includes(role)) {
    throw createError({ statusCode: 400, message: '無效的角色' })
  }
  
  try {
    // 更新用戶 role
    const client = (db as any).$client
    
    await client.query(`
      UPDATE user_profiles 
      SET role = '${role}', updated_at = NOW()
      WHERE account_id = '${userId}'
    `)
    
    return { success: true }
    
  } catch (error: any) {
    console.error('Update role error:', error)
    throw createError({
      statusCode: 500,
      message: '更新角色失敗'
    })
  }
})
