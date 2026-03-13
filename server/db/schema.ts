import { pgTable, text, boolean, timestamp, decimal, date, integer, jsonb, uuid, uniqueIndex, index } from 'drizzle-orm/pg-core'

// ============================================
// accounts - 用戶帳戶表
// ============================================
export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey(),
  type: text('type').notNull(), // username / email / oauth / google / apple
  identifier: text('identifier').notNull().unique(),
  hash: text('hash').notNull(), // password hash or OAuth token hash
  meta: jsonb('meta').default({}),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  typeIdentifierIdx: index('type_identifier_idx').on(table.type, table.identifier)
}))

// ============================================
// user_profiles - 用戶個人資料
// ============================================
export const userProfiles = pgTable('user_profiles', {
  accountId: uuid('account_id').primaryKey().references(() => accounts.id),
  firstName: text('first_name'),
  lastName: text('last_name'),
  gender: text('gender'), // male / female / other
  heightCm: decimal('height_cm', { precision: 5, scale: 2 }),
  birthDate: date('birth_date'),
  latestRecord: jsonb('latest_record').default({}),
  preferences: jsonb('preferences').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
})

// ============================================
// targets - 目標設定
// ============================================
export const targets = pgTable('targets', {
  id: uuid('id').primaryKey(),
  accountId: uuid('account_id').notNull().references(() => accounts.id),
  targetType: text('target_type').notNull(), // weight / body_fat / muscle / waist / chest / hips / thigh / arm
  targetValue: decimal('target_value', { precision: 6, scale: 2 }).notNull(),
  targetDate: date('target_date'),
  status: text('status').default('active').notNull(), // active / completed / abandoned
  achievedAt: timestamp('achieved_at', { withTimezone: true }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  accountStatusIdx: index('targets_account_status_idx').on(table.accountId, table.status)
}))

// ============================================
// measurement_records - 測量記錄
// ============================================
export const measurementRecords = pgTable('measurement_records', {
  id: uuid('id').primaryKey(),
  accountId: uuid('account_id').notNull().references(() => accounts.id),
  recordedAt: date('recorded_at').notNull(),
  // 身體組成
  weightKg: decimal('weight_kg', { precision: 5, scale: 2 }),
  bodyFatPct: decimal('body_fat_pct', { precision: 4, scale: 2 }),
  muscleKg: decimal('muscle_kg', { precision: 5, scale: 2 }),
  waterPct: decimal('water_pct', { precision: 4, scale: 2 }),
  boneKg: decimal('bone_kg', { precision: 4, scale: 2 }),
  visceralFat: integer('visceral_fat'),
  // 身體圍度
  chestCm: decimal('chest_cm', { precision: 5, scale: 2 }),
  waistCm: decimal('waist_cm', { precision: 5, scale: 2 }),
  hipsCm: decimal('hips_cm', { precision: 5, scale: 2 }),
  thighCm: decimal('thigh_cm', { precision: 5, scale: 2 }),
  armCm: decimal('arm_cm', { precision: 5, scale: 2 }),
  // 其他
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  accountRecordedIdx: index('measurements_account_recorded_idx').on(table.accountId, table.recordedAt)
}))

// ============================================
// attachments - 附件
// ============================================
export const attachments = pgTable('attachments', {
  id: uuid('id').primaryKey(),
  accountId: uuid('account_id').notNull().references(() => accounts.id),
  recordId: uuid('record_id').references(() => measurementRecords.id),
  fileName: text('file_name').notNull(),
  contentType: text('content_type').notNull(),
  blobPath: text('blob_path').notNull(),
  fileSize: integer('file_size').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  accountIdx: index('attachments_account_idx').on(table.accountId),
  recordIdx: index('attachments_record_idx').on(table.recordId)
}))

// ============================================
// friendships - 朋友關係
// ============================================
export const friendships = pgTable('friendships', {
  id: uuid('id').primaryKey(),
  requesterId: uuid('requester_id').notNull().references(() => accounts.id),
  addresseeId: uuid('addressee_id').notNull().references(() => accounts.id),
  status: text('status').default('pending').notNull(), // pending / accepted / rejected
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  requesterIdx: index('friendships_requester_idx').on(table.requesterId),
  addresseeIdx: index('friendships_addressee_idx').on(table.addresseeId),
  uniqueFriendship: uniqueIndex('unique_friendship_idx').on(table.requesterId, table.addresseeId)
}))
