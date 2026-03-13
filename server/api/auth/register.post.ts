import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

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

  // 生成 UUID v7
  const accountId = generateUUIDv7()

  // Hash 密碼 (簡單版，實際應用應使用 bcrypt)
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

  // Return directly with the destructured account
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

// UUID v7 生成函數
function generateUUIDv7(): string {
  const timestamp = Date.now()
  const timestampHex = timestamp.toString(16).padStart(12, '0')
  
  const randomBytes = new Uint8Array(10)
  crypto.getRandomValues(randomBytes)
  
  const bytes = Array.from(randomBytes)
  
  const uuid = [
    timestampHex.slice(0, 8),
    timestampHex.slice(8) + '7',
    ((bytes[0]! & 0x0f) | 0x70).toString(16).padStart(2, '0') + 
      bytes[1]!.toString(16).padStart(2, '0'),
    ((bytes[2]! & 0x3f) | 0x80).toString(16).padStart(2, '0') + 
      bytes[3]!.toString(16).padStart(2, '0'),
    bytes.slice(4, 10)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  ].join('-')
  
  return uuid
}

// 密碼 hash 函數 (簡單版，實際應用應使用 bcrypt)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
