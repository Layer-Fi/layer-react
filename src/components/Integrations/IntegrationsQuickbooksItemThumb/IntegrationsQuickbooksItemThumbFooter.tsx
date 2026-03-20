import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

import { DateFormat } from '@utils/time/timeFormats'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { QuickbooksContext } from '@contexts/QuickbooksContext/QuickbooksContext'
import { HStack, Spacer, VStack } from '@ui/Stack/Stack'
import { BadgeLoader } from '@components/BadgeLoader/BadgeLoader'
import { QuickbooksConnectionSyncUiState } from '@components/Integrations/IntegrationsQuickbooksItemThumb/utils'
import { Text, TextSize } from '@components/Typography/Text'

const useFooterConfig = (
  quickbooksUiState: QuickbooksConnectionSyncUiState,
  lastSyncedAt: string | undefined,
) => {
  const { t } = useTranslation()
  const { formatDate } = useIntlFormatter()

  switch (quickbooksUiState) {
    case QuickbooksConnectionSyncUiState.Syncing: {
      return {
        title: t('integrations:state.syncing_account_data', 'Syncing account data'),
        description: t('integrations:label.take_five_minutes', 'This may take up to 5 minutes'),
        badgeVariant: 'info',
      } as const
    }
    case QuickbooksConnectionSyncUiState.SyncFailed: {
      return {
        title: t('integrations:state.last_sync_failed_at', 'Last sync failed at'),
        description: formatDate(lastSyncedAt!, DateFormat.DateWithTimeReadable),
        badgeVariant: 'error',
      } as const
    }
    case QuickbooksConnectionSyncUiState.SyncSuccess: {
      return {
        title: t('integrations:state.last_sync', 'Last synced on'),
        description: formatDate(lastSyncedAt!, DateFormat.DateWithTimeReadable),
        badgeVariant: 'success',
      } as const
    }
    case QuickbooksConnectionSyncUiState.Connected:
    default: {
      return {
        title: t('integrations:state.connected_quickbooks', 'Connected to QuickBooks'),
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
