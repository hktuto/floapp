import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'
import { uuidv7 } from 'uuidv7'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { type, identifier, password } = body

  if (!type || !identifier || !password) {
    throw createError({
      statusCode: 400,
      message: '請提供登入類型、識別碼同密碼'
    })
  }

  if (password.length < 6) {
    throw createError({
      statusCode: 400,
      message: '密碼至少需要6個字符'
    })
  }

  // 檢查 identifier 是否已存在
  const existing = await db.query.accounts.findFirst({
    where: eq(schema.accounts.identifier, identifier)
  })

  if (existing) {
    throw createError({
      statusCode: 400,
      message: '此識別碼已被使用'
    })
  }

  // 使用 uuidv7 生成 ID
  const accountId = uuidv7()

  // Hash 密碼
  const passwordHash = await hashPassword(password)

  // 創建帳戶
  const [account] = await db.insert(schema.accounts).values({
    id: accountId,
    type,
    identifier,
    hash: passwordHash,
    isActive: true
  }).returning()

  if (!account) {
    throw createError({ statusCode: 500, message: '創建帳戶失敗' })
  }

  // 創建空的 user profile
  await db.insert(schema.userProfiles).values({
    accountId: accountId,
    preferences: {},
    latestRecord: {}
  })

  return {
    success: true,
    message: '註冊成功',
    account: {
      id: account.id,
      type: account.type,
      identifier: account.identifier
    }
  }
})

// 密碼 hash 函數
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
