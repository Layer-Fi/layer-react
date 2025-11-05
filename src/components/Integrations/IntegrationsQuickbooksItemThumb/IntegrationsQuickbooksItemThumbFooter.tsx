import { Text, TextSize } from '../../Typography/Text'
import { useContext } from 'react'
import { BadgeLoader } from '../../BadgeLoader/BadgeLoader'
import { HStack, Spacer, VStack } from '../../ui/Stack/Stack'
import { QuickbooksContext } from '../../../contexts/QuickbooksContext/QuickbooksContext'
import { format, isValid } from 'date-fns'
import { QuickbooksConnectionSyncUiState } from './utils'

const formatLastSyncedAt = (datetime: string) => {
  const parsed = new Date(datetime)
  if (!isValid(parsed)) return ''

  return `${format(parsed, 'MMMM d, yyyy')} at ${format(parsed, 'h:mm a')}`
}

const getFooterConfig = (quickbooksUiState: QuickbooksConnectionSyncUiState, lastSyncedAt?: string) => {
  switch (quickbooksUiState) {
    case QuickbooksConnectionSyncUiState.Syncing: {
      return {
        title: 'Syncing account data',
        description: 'This may take up to 5 minutes',
        badgeVariant: 'info',
      } as const
    }
    case QuickbooksConnectionSyncUiState.SyncFailed: {
      return {
        title: 'Last sync failed at',
        description: formatLastSyncedAt(lastSyncedAt!),
        badgeVariant: 'error',
      } as const
    }
    case QuickbooksConnectionSyncUiState.SyncSuccess: {
      return {
        title: 'Last synced on',
        description: formatLastSyncedAt(lastSyncedAt!),
        badgeVariant: 'success',
      } as const
    }
    case QuickbooksConnectionSyncUiState.Connected:
    default: {
      return {
        title: 'Connected to QuickBooks',
        badgeVariant: 'success',
      } as const
    }
  }
}

type IntegrationsQuickbooksItemThumbFooterProps = {
  quickbooksUiState: QuickbooksConnectionSyncUiState
}

export const IntegrationsQuickbooksItemThumbFooter = ({ quickbooksUiState }: IntegrationsQuickbooksItemThumbFooterProps) => {
  const { quickbooksConnectionStatus } = useContext(QuickbooksContext)
  if (!quickbooksConnectionStatus) return null

  const { title, description, badgeVariant } = getFooterConfig(quickbooksUiState, quickbooksConnectionStatus.last_synced_at)
  return (
    <HStack className='loadingbar'>
      <VStack>
        <Text size={TextSize.sm}>{title}</Text>
        {description && (
          <Text size={TextSize.sm} className='syncing-data-description'>
            {description}
          </Text>
        )}
      </VStack>
      <Spacer />
      <BadgeLoader variant={badgeVariant} />
    </HStack>
  )
}
