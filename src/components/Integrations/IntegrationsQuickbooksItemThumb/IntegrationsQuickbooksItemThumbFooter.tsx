import { useContext } from 'react'
import { format, isValid } from 'date-fns'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import { MONTH_FORMAT } from '@utils/time/timeFormats'
import { QuickbooksContext } from '@contexts/QuickbooksContext/QuickbooksContext'
import { HStack, Spacer, VStack } from '@ui/Stack/Stack'
import { BadgeLoader } from '@components/BadgeLoader/BadgeLoader'
import { QuickbooksConnectionSyncUiState } from '@components/Integrations/IntegrationsQuickbooksItemThumb/utils'
import { Text, TextSize } from '@components/Typography/Text'

const formatLastSyncedAt = (datetime: string, t: TFunction) => {
  const parsed = new Date(datetime)
  if (!isValid(parsed)) return ''

  return t('integrations.dateAtTime', '{{date}} at {{time}}', {
    date: format(parsed, `${MONTH_FORMAT} d, yyyy`),
    time: format(parsed, 'h:mm a'),
  })
}

const useFooterConfig = (
  quickbooksUiState: QuickbooksConnectionSyncUiState,
  lastSyncedAt: string | undefined,
) => {
  const { t } = useTranslation()

  switch (quickbooksUiState) {
    case QuickbooksConnectionSyncUiState.Syncing: {
      return {
        title: t('integrations.syncingAccountData', 'Syncing account data'),
        description: t('integrations.thisMayTakeUpTo5Minutes', 'This may take up to 5 minutes'),
        badgeVariant: 'info',
      } as const
    }
    case QuickbooksConnectionSyncUiState.SyncFailed: {
      return {
        title: t('integrations.lastSyncFailedAt', 'Last sync failed at'),
        description: formatLastSyncedAt(lastSyncedAt!, t),
        badgeVariant: 'error',
      } as const
    }
    case QuickbooksConnectionSyncUiState.SyncSuccess: {
      return {
        title: t('integrations.lastSyncedOn', 'Last synced on'),
        description: formatLastSyncedAt(lastSyncedAt!, t),
        badgeVariant: 'success',
      } as const
    }
    case QuickbooksConnectionSyncUiState.Connected:
    default: {
      return {
        title: t('integrations.connectedToQuickbooks', 'Connected to QuickBooks'),
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
  const { title, description, badgeVariant } = useFooterConfig(
    quickbooksUiState,
    quickbooksConnectionStatus?.last_synced_at,
  )

  if (!quickbooksConnectionStatus) return null

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
