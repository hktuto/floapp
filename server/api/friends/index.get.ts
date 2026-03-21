import { db, schema } from '@nuxthub/db'
import { eq, or, and } from 'drizzle-orm'
import { getUserSession } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, message: '未登入' })
  }
  
  const userId = session.user.id
  
  try {
    const client = (db as any).$client
    
    // 查詢已接受嘅朋友關係
    const result = await client.query(`
      SELECT 
        f.id as friendship_id,
        f.requester_id,
        f.addressee_id,
        f.status,
        f.created_at,
        a.id as friend_id,
        a.identifier,
        p.first_name,
        p.last_name,
        p.avatar_url,
        p.latest_record
      FROM friendships f
      JOIN accounts a ON (f.requester_id = a.id OR f.addressee_id = a.id)
      LEFT JOIN user_profiles p ON a.id = p.account_id
      WHERE (f.requester_id = $1 OR f.addressee_id = $1)
        AND f.status = 'accepted'
        AND a.id != $1
      ORDER BY f.created_at DESC
    `, [userId])
    
    const friends = result.rows.map((row: any) => {
      // 解析 latest_record 獲取體重信息
      let weight = 0
      let lastRecord = '暫時冇記錄'
      
      if (row.latest_record) {
        try {
          const record = typeof row.latest_record === 'string' 
            ? JSON.parse(row.latest_record) 
            : row.latest_record
          if (record.weight_kg) {
            weight = parseFloat(record.weight_kg)
          }
          if (record.recorded_at) {
            lastRecord = new Date(record.recorded_at).toLocaleDateString('zh-HK')
          }
        } catch {
          // 忽略解析錯誤
        }
      }
      
      return {
        id: row.friendship_id,
        userId: row.friend_id,
        username: row.identifier,
        firstName: row.first_name,
        lastName: row.last_name,
        avatarUrl: row.avatar_url,
        weight: weight,
        lastRecord: lastRecord
      }
    })
    
    return friends
    
  } catch (error: any) {
    console.error('Get friends error:', error)
    throw createError({
      statusCode: 500,
      message: '獲取朋友列表失敗'
    })
  }
})
