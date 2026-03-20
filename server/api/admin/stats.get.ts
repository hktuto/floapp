import { db, schema } from '@nuxthub/db'
import { eq, and, gte, sql } from 'drizzle-orm'
import { getUserSession } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  // 檢查 admin 權限
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, message: '未登入' })
  }
  
  // 檢查是否為 admin
  const profile = await db.query.userProfiles.findFirst({
    where: eq(schema.userProfiles.accountId, session.user.id)
  })
  
  if (profile?.role !== 'admin') {
    throw createError({ statusCode: 403, message: '無權限訪問' })
  }
  
  try {
    // 1. 總用戶數
    const totalUsersResult = await (db as any).$client.query(
      'SELECT COUNT(*) as count FROM accounts'
    )
    const totalUsers = parseInt(totalUsersResult.rows[0].count)
    
    // 2. Teacher 數量
    const teacherCountResult = await (db as any).$client.query(
      "SELECT COUNT(*) as count FROM user_profiles WHERE role = 'teacher'"
    )
    const teacherCount = parseInt(teacherCountResult.rows[0].count)
    
    // 3. 今日新用戶
    const today = new Date().toISOString().split('T')[0]
    const newUsersResult = await (db as any).$client.query(
      `SELECT COUNT(*) as count FROM accounts WHERE created_at::date = '${today}'`
    )
    const newUsersToday = parseInt(newUsersResult.rows[0].count)
    
    // 4. Token 統計（如果 user_tokens 表存在）
    let totalTokensIssued = 0
    let totalTokensUsed = 0
    
    try {
      const tokensResult = await (db as any).$client.query(
        'SELECT COALESCE(SUM(total_earned), 0) as issued, COALESCE(SUM(total_spent), 0) as used FROM user_tokens'
      )
      totalTokensIssued = parseInt(tokensResult.rows[0].issued)
      totalTokensUsed = parseInt(tokensResult.rows[0].used)
    } catch {
      // 表可能未創建，忽略
    }
    
    return {
      totalUsers,
      teacherCount,
      newUsersToday,
      totalTokensIssued,
      totalTokensUsed
    }
    
  } catch (error: any) {
    console.error('Admin stats error:', error)
    throw createError({
      statusCode: 500,
      message: '獲取統計失敗'
    })
  }
})
