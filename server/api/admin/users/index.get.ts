import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'
import { getUserSession } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, message: '未登入' })
  }
  
  const adminProfile = await db.query.userProfiles.findFirst({
    where: eq(schema.userProfiles.accountId, session.user.id)
  })
  
  if (adminProfile?.role !== 'admin') {
    throw createError({ statusCode: 403, message: '無權限訪問' })
  }
  
  const query = getQuery(event)
  const search = (query.search as string) || ''
  const role = (query.role as string) || ''
  const page = parseInt((query.page as string) || '1')
  const limit = parseInt((query.limit as string) || '10')
  
  try {
    const client = (db as any).$client
    
    // 簡化版：查詢所有用戶
    const result = await client.query(`
      SELECT 
        a.id, a.type, a.identifier, a.is_active as isActive, a.created_at as createdAt,
        p.first_name as firstName, p.last_name as lastName, p.avatar_url as avatarUrl, p.role,
        COALESCE(t.balance, 0) as tokenBalance
      FROM accounts a
      LEFT JOIN user_profiles p ON a.id = p.account_id
      LEFT JOIN user_tokens t ON a.id = t.user_id
      ORDER BY a.created_at DESC
    `)
    
    const users = result.rows.map((row: any) => ({
      id: row.id,
      type: row.type,
      identifier: row.identifier,
      isActive: row.isactive,
      createdAt: row.createdat,
      profile: {
        firstName: row.firstname,
        lastName: row.lastname,
        avatarUrl: row.avatarurl,
        role: row.role || 'user'
      },
      tokenBalance: parseInt(row.tokenbalance) || 0
    }))
    
    return {
      users,
      total: users.length
    }
    
  } catch (error: any) {
    console.error('Admin users list error:', error)
    throw createError({
      statusCode: 500,
      message: '獲取用戶列表失敗'
    })
  }
})
