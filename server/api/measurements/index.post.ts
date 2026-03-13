import { db } from '@nuxthub/db'
import { getUserSession } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, message: '未登入' })
  }

  const body = await readBody(event)
  const recordId = generateUUIDv7()

  try {
    // Access underlying PGlite client
    const client = (db as any).$client
    
    const result = await client.query(`
      INSERT INTO measurement_records (
        id, account_id, recorded_at, weight_kg, body_fat_pct, note, created_at
      ) VALUES (
        $1, $2, $3, $4::numeric, $5::numeric, $6, NOW()
      ) RETURNING *
    `, [
      recordId,
      session.user.id,
      body.recordedAt || new Date().toISOString().split('T')[0],
      body.weightKg?.toString() || null,
      body.bodyFatPct?.toString() || null,
      body.note || null
    ])

    const record = result.rows?.[0]

    if (!record) {
      throw createError({ statusCode: 500, message: '創建記錄失敗' })
    }

    return {
      success: true,
      record
    }
  } catch (error: any) {
    console.error('Insert error:', error)
    throw createError({ 
      statusCode: 500, 
      message: '創建記錄失敗: ' + error.message 
    })
  }
})

function generateUUIDv7(): string {
  return crypto.randomUUID()
}
