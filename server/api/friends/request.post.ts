import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'
import { getUserSession } from '~/server/utils/session'
import { uuidv7 } from 'uuidv7'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, message: '未登入' })
  }
  
  const userId = session.user.id
  const body = await readBody(event)
  const { identifier } = body
  
  if (!identifier) {
    throw createError({ statusCode: 400, message: '請提供用戶名' })
  }
  
  try {
    const client = (db as any).$client
    
    // 查找目標用戶
    const targetUser = await client.query(`
      SELECT id FROM accounts WHERE identifier = $1
    `, [identifier])
    
    if (targetUser.rows.length === 0) {
      throw createError({ statusCode: 404, message: '用戶不存在' })
    }
    
    const targetId = targetUser.rows[0].id
    
    // 唔可以添加自己
    if (targetId === userId) {
      throw createError({ statusCode: 400, message: '唔可以添加自己為朋友' })
    }
    
    // 檢查係咪已經有朋友關係
    const existing = await client.query(`
      SELECT id, status FROM friendships 
      WHERE (requester_id = $1 AND addressee_id = $2)
         OR (requester_id = $2 AND addressee_id = $1)
    `, [userId, targetId])
    
    if (existing.rows.length > 0) {
      const status = existing.rows[0].status
      if (status === 'accepted') {
        throw createError({ statusCode: 400, message: '已經係朋友' })
      } else if (status === 'pending') {
        throw createError({ statusCode: 400, message: '請求已發送，等待對方確認' })
      }
    }
    
    // 創建朋友請求
    const friendshipId = uuidv7()
    await client.query(`
      INSERT INTO friendships (id, requester_id, addressee_id, status, created_at)
      VALUES ($1, $2, $3, 'pending', NOW())
    `, [friendshipId, userId, targetId])
    
    return { success: true, message: '朋友請求已發送' }
    
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Friend request error:', error)
    throw createError({
      statusCode: 500,
      message: '發送請求失敗'
    })
  }
})
