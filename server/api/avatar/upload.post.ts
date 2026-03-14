import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'
import { getUserSession } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, message: '未登入' })
  }
  
  const userId = session.user.id
  
  const form = await readFormData(event)
  const image = form.get('image') as File
  
  if (!image) {
    throw createError({ statusCode: 400, message: '請上傳圖片' })
  }
  
  if (!image.type.startsWith('image/')) {
    throw createError({ statusCode: 400, message: '只支持圖片文件' })
  }
  
  if (image.size > 2 * 1024 * 1024) {
    throw createError({ statusCode: 400, message: '圖片大小不能超過 2MB' })
  }
  
  try {
    // 使用 PGlite 存儲圖片數據（簡化版，直接存 base64）
    const arrayBuffer = await image.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    const dataUrl = `data:${image.type};base64,${base64}`
    
    // 更新數據庫
    await db.update(schema.userProfiles)
      .set({
        avatarUrl: dataUrl,
        updatedAt: new Date()
      })
      .where(eq(schema.userProfiles.accountId, userId))
    
    return {
      success: true,
      url: dataUrl
    }
    
  } catch (error: any) {
    console.error('Avatar upload error:', error)
    throw createError({
      statusCode: 500,
      message: '上傳失敗: ' + error.message
    })
  }
})
