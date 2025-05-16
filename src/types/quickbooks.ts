export enum QuickbooksConnectionLastSyncStatus {
  SYNC_SUCCESS = 'SYNC_SUCCESS',
  SYNC_FAILURE = 'SYNC_FAILURE',
}

export type StatusOfQuickbooksConnection = {
  is_connected: boolean
  is_syncing: boolean
  last_synced_at?: string
  last_sync_status?: QuickbooksConnectionLastSyncStatus
}
