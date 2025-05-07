export type StatusOfQuickbooksConnection = {
  is_connected: boolean
  last_synced_at: string | null
}

export type StatusOfSyncFromQuickbooks = {
  is_syncing: boolean
}
