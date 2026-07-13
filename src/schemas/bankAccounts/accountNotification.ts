import { Schema } from 'effect'

export const AccountNotificationSchema = Schema.Struct({
  type: Schema.String,
})
export type AccountNotification = typeof AccountNotificationSchema.Type
