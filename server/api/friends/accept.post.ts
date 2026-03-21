import { db, schema } from '@nuxthub/db'
import { getUserSession } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, message: '未登入' })
  }
  
  const userId = session.user.id
  const body = await readBody(event)
  const { friendshipId } = body
  
  if (!friendshipId) {
    throw createError({ statusCode: 400, message: '請提供請求 ID' })
  }
  
  try {
    const client = (db as any).$client
    
    // 檢查請求是否存在同是否發送給當前用戶
    const friendship = await client.query(`
      SELECT id, addressee_id, status 
      FROM friendships 
      WHERE id = $1 AND addressee_id = $2
    `, [friendshipId, userId])
    
    if (friendship.rows.length === 0) {
      throw createError({ statusCode: 404, message: '請求不存在' })
    }
    
    if (friendship.rows[0].status !== 'pending') {
      throw createError({ statusCode: 400, message: '請求已處理' })
    }
    
    // 接受請求
    await client.query(`
      UPDATE friendships 
      SET status = 'accepted', updated_at = NOW()
      WHERE id = $1
    `, [friendshipId])
    
    return { success: true, message: '已接受朋友請求' }
    
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Accept friend error:', error)
    throw createError({
      statusCode: 500,
      message: '接受請求失敗'
    })
  }
})
