import { db, schema } from '@nuxthub/db'
import { getUserSession } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, message: '未登入' })
  }
  
  const userId = session.user.id
  const friendshipId = getRouterParam(event, 'id')
  
  if (!friendshipId) {
    throw createError({ statusCode: 400, message: '請提供朋友關係 ID' })
  }
  
  try {
    const client = (db as any).$client
    
    // 檢查係咪關係其中一方
    const friendship = await client.query(`
      SELECT id 
      FROM friendships 
      WHERE id = $1 AND (requester_id = $2 OR addressee_id = $2)
    `, [friendshipId, userId])
    
    if (friendship.rows.length === 0) {
      throw createError({ statusCode: 404, message: '朋友關係不存在' })
    }
    
    // 刪除關係
    await client.query(`
      DELETE FROM friendships WHERE id = $1
    `, [friendshipId])
    
    return { success: true, message: '已刪除朋友' }
    
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Delete friend error:', error)
    throw createError({
      statusCode: 500,
      message: '刪除朋友失敗'
    })
  }
})
