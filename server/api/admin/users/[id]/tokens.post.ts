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
  const { amount, reason } = body
  
  // 驗證數量
  if (typeof amount !== 'number' || amount === 0) {
    throw createError({ statusCode: 400, message: '無效的金額' })
  }
  
  try {
    const client = (db as any).$client
    
    // 檢查用戶是否存在
    const userResult = await client.query(`
      SELECT id FROM accounts WHERE id = '${userId}'
    `)
    
    if (userResult.rows.length === 0) {
      throw createError({ statusCode: 404, message: '用戶不存在' })
    }
    
    // 檢查當前餘額（扣除時需要）
    if (amount < 0) {
      const balanceResult = await client.query(`
        SELECT COALESCE(balance, 0) as balance FROM user_tokens WHERE user_id = '${userId}'
      `)
      const currentBalance = parseInt(balanceResult.rows[0]?.balance || '0')
      
      if (currentBalance + amount < 0) {
        throw createError({ statusCode: 400, message: '餘額不足，無法扣除' })
      }
    }
    
    // 創建 user_tokens 記錄（如果不存在）
    await client.query(`
      INSERT INTO user_tokens (user_id, balance, total_earned, total_spent)
      VALUES ('${userId}', 0, 0, 0)
      ON CONFLICT (user_id) DO NOTHING
    `)
    
    // 更新餘額
    const isDeduction = amount < 0
    const absAmount = Math.abs(amount)
    
    await client.query(`
      UPDATE user_tokens 
      SET 
        balance = balance + ${amount},
        ${isDeduction ? 'total_spent' : 'total_earned'} = ${isDeduction ? 'total_spent' : 'total_earned'} + ${absAmount},
        updated_at = NOW()
      WHERE user_id = '${userId}'
    `)
    
    // 記錄交易
    await client.query(`
      INSERT INTO token_transactions (user_id, type, amount, description, created_by, created_at)
      VALUES ('${userId}', '${isDeduction ? 'admin_deduct' : 'admin_grant'}', ${amount}, '${reason || ''}', '${session.user.id}', NOW())
    `)
    
    // 獲取新餘額
    const newBalanceResult = await client.query(`
      SELECT balance FROM user_tokens WHERE user_id = '${userId}'
    `)
    
    return { 
      success: true, 
      newBalance: parseInt(newBalanceResult.rows[0].balance) 
    }
    
  } catch (error: any) {
    console.error('Token recharge error:', error)
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: '操作失敗: ' + error.message
    })
  }
})
