import { db } from '@nuxthub/db'
import * as schema from '@nuxthub/db/schema'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    console.log('🌱 Starting seed...')

    // Step 1: Clear data
    await db.delete(schema.friendships)
    await db.delete(schema.targets)
    await db.delete(schema.measurementRecords)
    await db.delete(schema.userProfiles)
    await db.delete(schema.accounts)
    console.log('✅ Data cleared')

    // Step 2: Create accounts (one by one)
    console.log('👤 Creating accounts...')
    const passwordHash = 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f'
    
    const seanId = crypto.randomUUID()
    await db.insert(schema.accounts).values({ id: seanId, type: 'username', identifier: 'sean', hash: passwordHash, isActive: true } as any)
    
    const alexId = crypto.randomUUID()
    await db.insert(schema.accounts).values({ id: alexId, type: 'username', identifier: 'alex', hash: passwordHash, isActive: true } as any)
    
    const samId = crypto.randomUUID()
    await db.insert(schema.accounts).values({ id: samId, type: 'username', identifier: 'sam', hash: passwordHash, isActive: true } as any)
    
    console.log('✅ Created 3 accounts')

    // Step 3: Update profiles
    console.log('👤 Updating profiles...')
    await db.update(schema.userProfiles).set({ firstName: 'Sean', lastName: 'Ts', gender: 'male', heightCm: '175.0', birthDate: '1990-01-01', preferences: { theme: 'light', language: 'zh-HK' } }).where(eq(schema.userProfiles.accountId, seanId))
    await db.update(schema.userProfiles).set({ firstName: 'Alex', lastName: 'Wong', gender: 'male', heightCm: '170.0', birthDate: '1992-03-15', preferences: { theme: 'dark', language: 'zh-HK' } }).where(eq(schema.userProfiles.accountId, alexId))
    await db.update(schema.userProfiles).set({ firstName: 'Sam', lastName: 'Lee', gender: 'female', heightCm: '165.0', birthDate: '1995-07-20', preferences: { theme: 'light', language: 'en' } }).where(eq(schema.userProfiles.accountId, samId))
    console.log('✅ Updated 3 profiles')

    // Step 4: Create records
    console.log('📊 Creating records...')
    const dates: string[] = []
    for (let i = 4; i >= 0; i--) {
      const date = new Date(); date.setDate(date.getDate() - i); dates.push(date.toISOString().split('T')[0] as string)
    }
    
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i]
      // Sean
      await db.insert(schema.measurementRecords).values({ id: crypto.randomUUID(), accountId: seanId, recordedAt: date, weightKg: (72.0 - (i * 0.3)).toFixed(1), bodyFatPct: (20.0 - (i * 0.2)).toFixed(1), muscleKg: (32.0 + (i * 0.1)).toFixed(1), waterPct: (54.0 + (i * 0.2)).toFixed(1), boneKg: '3.2', visceralFat: i > 2 ? 8 : 9, chestCm: (96.0 - (i * 0.1)).toFixed(1), waistCm: (80.0 - (i * 0.2)).toFixed(1), hipsCm: '93.0', thighCm: '56.0', armCm: '33.0', note: i === 0 ? '早餐後' : i === 2 ? '運動後' : null } as any)
      // Alex
      await db.insert(schema.measurementRecords).values({ id: crypto.randomUUID(), accountId: alexId, recordedAt: date, weightKg: (68.5 + (i * 0.1)).toFixed(1), bodyFatPct: (17.5 + (i * 0.1)).toFixed(1), muscleKg: '31.5', waterPct: '55.0', boneKg: '3.0', visceralFat: 7, chestCm: '94.0', waistCm: '78.0', hipsCm: '91.0', thighCm: '54.0', armCm: '31.5', note: null } as any)
      // Sam
      await db.insert(schema.measurementRecords).values({ id: crypto.randomUUID(), accountId: samId, recordedAt: date, weightKg: (55.0 - (i * 0.1)).toFixed(1), bodyFatPct: (22.0 - (i * 0.2)).toFixed(1), muscleKg: (26.0 + (i * 0.1)).toFixed(1), waterPct: '52.0', boneKg: '2.8', visceralFat: 5, chestCm: '85.0', waistCm: '68.0', hipsCm: '88.0', thighCm: '50.0', armCm: '28.0', note: i === 4 ? '瑜伽後' : null } as any)
    }
    console.log(`✅ Created ${dates.length * 3} records`)

    // Step 5: Update latest_record
    const seanLatest = await db.query.measurementRecords.findFirst({ where: eq(schema.measurementRecords.accountId, seanId), orderBy: [desc(schema.measurementRecords.recordedAt)] })
    const alexLatest = await db.query.measurementRecords.findFirst({ where: eq(schema.measurementRecords.accountId, alexId), orderBy: [desc(schema.measurementRecords.recordedAt)] })
    const samLatest = await db.query.measurementRecords.findFirst({ where: eq(schema.measurementRecords.accountId, samId), orderBy: [desc(schema.measurementRecords.recordedAt)] })
    if (seanLatest) await db.update(schema.userProfiles).set({ latestRecord: seanLatest as any }).where(eq(schema.userProfiles.accountId, seanId))
    if (alexLatest) await db.update(schema.userProfiles).set({ latestRecord: alexLatest as any }).where(eq(schema.userProfiles.accountId, alexId))
    if (samLatest) await db.update(schema.userProfiles).set({ latestRecord: samLatest as any }).where(eq(schema.userProfiles.accountId, samId))
    console.log('✅ Updated latest records')

    // Step 6: Create friendships
    await db.insert(schema.friendships).values({ id: crypto.randomUUID(), requesterId: seanId, addresseeId: alexId, status: 'accepted' } as any)
    await db.insert(schema.friendships).values({ id: crypto.randomUUID(), requesterId: alexId, addresseeId: seanId, status: 'accepted' } as any)
    await db.insert(schema.friendships).values({ id: crypto.randomUUID(), requesterId: seanId, addresseeId: samId, status: 'accepted' } as any)
    await db.insert(schema.friendships).values({ id: crypto.randomUUID(), requesterId: samId, addresseeId: seanId, status: 'accepted' } as any)
    console.log('✅ Created 4 friendships')

    // Step 7: Create targets
    await db.insert(schema.targets).values({ id: crypto.randomUUID(), accountId: seanId, targetType: 'weight', targetValue: '68.0', targetDate: '2025-06-01', status: 'active', isActive: true } as any)
    await db.insert(schema.targets).values({ id: crypto.randomUUID(), accountId: seanId, targetType: 'body_fat', targetValue: '17.0', targetDate: '2025-06-01', status: 'active', isActive: true } as any)
    await db.insert(schema.targets).values({ id: crypto.randomUUID(), accountId: alexId, targetType: 'weight', targetValue: '67.0', targetDate: '2025-05-01', status: 'active', isActive: true } as any)
    await db.insert(schema.targets).values({ id: crypto.randomUUID(), accountId: alexId, targetType: 'waist', targetValue: '75.0', targetDate: '2025-05-01', status: 'active', isActive: true } as any)
    await db.insert(schema.targets).values({ id: crypto.randomUUID(), accountId: samId, targetType: 'weight', targetValue: '53.0', targetDate: '2025-04-01', status: 'active', isActive: true } as any)
    await db.insert(schema.targets).values({ id: crypto.randomUUID(), accountId: samId, targetType: 'body_fat', targetValue: '20.0', targetDate: '2025-04-01', status: 'active', isActive: true } as any)
    console.log('✅ Created 6 targets')

    console.log('🎉 Seed completed!')
    return { success: true, message: 'Seed completed', data: { accounts: 3, profiles: 3, records: 15, friendships: 4, targets: 6 } }

  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw createError({ statusCode: 500, message: 'Seed failed: ' + (error as Error).message })
  }
})
