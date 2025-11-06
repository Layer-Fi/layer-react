import { QuickbooksConnectionLastSyncStatus, StatusOfQuickbooksConnection } from '@internal-types/quickbooks'

export enum QuickbooksConnectionSyncUiState {
  Syncing = 'Syncing',
  SyncFailed = 'SyncFailed',
  SyncSuccess = 'SyncSuccess',
  Connected = 'Connected',
}

export const getQuickbooksConnectionSyncUiState = (quickbooksConnectionStatus: StatusOfQuickbooksConnection): QuickbooksConnectionSyncUiState => {
  const isSyncing = quickbooksConnectionStatus?.is_syncing ?? false
  const lastSyncedAt = quickbooksConnectionStatus?.last_synced_at
  const syncFailed = quickbooksConnectionStatus?.last_sync_status === QuickbooksConnectionLastSyncStatus.SYNC_FAILURE

  if (isSyncing) {
    return QuickbooksConnectionSyncUiState.Syncing
  }

  if (lastSyncedAt) {
    return syncFailed ? QuickbooksConnectionSyncUiState.SyncFailed : QuickbooksConnectionSyncUiState.SyncSuccess
  }

  return QuickbooksConnectionSyncUiState.Connected
}
