import { db, schema } from '@nuxthub/db'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { type, identifier, password } = body

  if (!type || !identifier || !password) {
    throw createError({
      statusCode: 400,
      message: '請提供登入類型、識別碼同密碼'
    })
  }

  // 查找帳戶
  const account = await db.query.accounts.findFirst({
    where: and(
      eq(schema.accounts.type, type),
      eq(schema.accounts.identifier, identifier),
      eq(schema.accounts.isActive, true)
    )
  })

  if (!account) {
    throw createError({
      statusCode: 401,
      message: '帳戶不存在或已停用'
    })
  }

  // 驗證密碼
  const passwordHash = await hashPassword(password)
  if (passwordHash !== account.hash) {
    throw createError({
      statusCode: 401,
      message: '密碼錯誤'
    })
  }

  // 設置 session
  setCookie(event, 'session', JSON.stringify({
    user: {
      id: account.id,
      type: account.type,
      identifier: account.identifier
    }
  }), {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7
  })

  return {
    success: true,
    message: '登入成功',
    account: {
      id: account.id,
      type: account.type,
      identifier: account.identifier
    }
  }
})

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
