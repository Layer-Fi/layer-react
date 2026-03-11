import { useContext } from 'react'
import { format, isValid } from 'date-fns'
import i18next from 'i18next'

import { MONTH_FORMAT } from '@utils/time/timeFormats'
import { QuickbooksContext } from '@contexts/QuickbooksContext/QuickbooksContext'
import { HStack, Spacer, VStack } from '@ui/Stack/Stack'
import { BadgeLoader } from '@components/BadgeLoader/BadgeLoader'
import { QuickbooksConnectionSyncUiState } from '@components/Integrations/IntegrationsQuickbooksItemThumb/utils'
import { Text, TextSize } from '@components/Typography/Text'

const formatLastSyncedAt = (datetime: string) => {
  const parsed = new Date(datetime)
  if (!isValid(parsed)) return ''

  return i18next.t('dateAtTime', '{{date}} at {{time}}', {
    date: format(parsed, `${MONTH_FORMAT} d, yyyy`),
    time: format(parsed, 'h:mm a'),
  })
}

const getFooterConfig = (quickbooksUiState: QuickbooksConnectionSyncUiState, lastSyncedAt?: string) => {
  switch (quickbooksUiState) {
    case QuickbooksConnectionSyncUiState.Syncing: {
      return {
        title: i18next.t('syncingAccountData', 'Syncing account data'),
        description: i18next.t('thisMayTakeUpTo5Minutes', 'This may take up to 5 minutes'),
        badgeVariant: 'info',
      } as const
    }
    case QuickbooksConnectionSyncUiState.SyncFailed: {
      return {
        title: i18next.t('lastSyncFailedAt', 'Last sync failed at'),
        description: formatLastSyncedAt(lastSyncedAt!),
        badgeVariant: 'error',
      } as const
    }
    case QuickbooksConnectionSyncUiState.SyncSuccess: {
      return {
        title: i18next.t('lastSyncedOn', 'Last synced on'),
        description: formatLastSyncedAt(lastSyncedAt!),
        badgeVariant: 'success',
      } as const
    }
    case QuickbooksConnectionSyncUiState.Connected:
    default: {
      return {
        title: i18next.t('connectedToQuickbooks', 'Connected to QuickBooks'),
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
