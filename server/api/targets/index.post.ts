import { db } from '@nuxthub/db'
import { getUserSession } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, message: '未登入' })
  }

  const body = await readBody(event)
  const targetId = generateUUIDv7()

  try {
    // Access underlying PGlite client
    const client = (db as any).$client
    
    const result = await client.query(`
      INSERT INTO targets (
        id, account_id, target_type, target_value, target_date,
        status, is_active, created_at
      ) VALUES (
        $1, $2, $3, $4::numeric, $5,
        $6, $7, NOW()
      ) RETURNING *
    `, [
      targetId,
      session.user.id,
      body.targetType,
      body.targetValue?.toString(),
      body.targetDate || null,
      'active',
      true
    ])

    const target = result.rows?.[0]

    if (!target) {
      throw createError({ statusCode: 500, message: '創建目標失敗' })
    }

    return {
      success: true,
      target
    }
  } catch (error: any) {
    console.error('Insert error:', error)
    throw createError({ 
      statusCode: 500, 
      message: '創建目標失敗: ' + error.message 
    })
  }
})

function generateUUIDv7(): string {
  return crypto.randomUUID()
}
