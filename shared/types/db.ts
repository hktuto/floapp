import * as schema from '@nuxthub/db/schema'

// Select types (for reading data)
export type Account = typeof schema.accounts.$inferSelect
export type UserProfile = typeof schema.userProfiles.$inferSelect
export type MeasurementRecord = typeof schema.measurementRecords.$inferSelect
export type Target = typeof schema.targets.$inferSelect
export type Attachment = typeof schema.attachments.$inferSelect
export type Friendship = typeof schema.friendships.$inferSelect

// Insert types (for creating data)
export type NewAccount = typeof schema.accounts.$inferInsert
export type NewUserProfile = typeof schema.userProfiles.$inferInsert
export type NewMeasurementRecord = typeof schema.measurementRecords.$inferInsert
export type NewTarget = typeof schema.targets.$inferInsert
export type NewAttachment = typeof schema.attachments.$inferInsert
export type NewFriendship = typeof schema.friendships.$inferInsert
