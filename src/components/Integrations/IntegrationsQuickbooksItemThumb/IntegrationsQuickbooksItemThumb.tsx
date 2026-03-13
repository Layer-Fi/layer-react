import { useCallback, useContext, useMemo, useState } from 'react'
import { AlertCircle, CheckIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { translationKey } from '@utils/i18n/translationKey'
import { QuickbooksContext } from '@contexts/QuickbooksContext/QuickbooksContext'
import QuickbooksIcon from '@icons/QuickbooksIcon'
import RefreshCcw from '@icons/RefreshCcw'
import { HStack } from '@ui/Stack/Stack'
import { Badge, BadgeVariant } from '@components/Badge/Badge'
import { BadgeSize } from '@components/Badge/Badge'
import { BadgeLoader } from '@components/BadgeLoader/BadgeLoader'
import { Card } from '@components/Card/Card'
import { IntegrationsQuickbooksItemThumbFooter } from '@components/Integrations/IntegrationsQuickbooksItemThumb/IntegrationsQuickbooksItemThumbFooter'
import { IntegrationsQuickbooksUnlinkConfirmationModal } from '@components/Integrations/IntegrationsQuickbooksItemThumb/IntegrationsQuickbooksUnlinkConfirmationModal'
import { getQuickbooksConnectionSyncUiState, QuickbooksConnectionSyncUiState } from '@components/Integrations/IntegrationsQuickbooksItemThumb/utils'
import { LinkedAccountOptions } from '@components/LinkedAccountOptions/LinkedAccountOptions'
import { Text, TextSize } from '@components/Typography/Text'

const getBadgeConfig = (
  quickbooksUiState: QuickbooksConnectionSyncUiState,
  hasSynced: boolean,
) => {
  if (!hasSynced) {
    return {
      variant: BadgeVariant.INFO,
      icon: <RefreshCcw size={12} />,
      ...translationKey('sync', 'Sync'),
    } as const
  }

  switch (quickbooksUiState) {
    case QuickbooksConnectionSyncUiState.SyncFailed: {
      return {
        variant: BadgeVariant.ERROR,
        icon: <AlertCircle size={12} />,
        ...translationKey('retrySync', 'Retry Sync'),
      } as const
    }
    case QuickbooksConnectionSyncUiState.Connected:
    case QuickbooksConnectionSyncUiState.SyncSuccess: {
      return {
        variant: BadgeVariant.SUCCESS,
        icon: <CheckIcon size={12} />,
        ...translationKey('synced', 'Synced'),
      } as const
    }
    default:
    case QuickbooksConnectionSyncUiState.Syncing: {
      return {
        variant: BadgeVariant.INFO,
        icon: <RefreshCcw size={12} />,
        ...translationKey('sync', 'Sync'),
      } as const
    }
  }
}

export const IntegrationsQuickbooksItemThumb = () => {
  const { t } = useTranslation()
  const { quickbooksConnectionStatus, syncFromQuickbooks } = useContext(QuickbooksContext)
  const [hasSynced, setHasSynced] = useState(false)
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)

  const onSync = useCallback(() => {
    setHasSynced(true)
    syncFromQuickbooks()
  }, [syncFromQuickbooks])

  const menuConfig = useMemo(() => {
    return [
      {
        name: t('unlinkAccount', 'Unlink account'),
        action: () => {
          setIsConfirmationModalOpen(true)
        },
      },
    ]
  }, [t])

  if (!quickbooksConnectionStatus) return null

  const quickbooksUiState = getQuickbooksConnectionSyncUiState(quickbooksConnectionStatus)
  const badgeConfig = getBadgeConfig(quickbooksUiState, hasSynced)
  return (
    <LinkedAccountOptions config={menuConfig}>
      <Card className='Layer__linked-account-thumb Layer__integrations-quickbooks-item-thumb'>
        <div className='topbar'>
          <HStack gap='xs'>
            <Text size={TextSize.md}>QuickBooks</Text>
            {quickbooksUiState === QuickbooksConnectionSyncUiState.Syncing
              ? <BadgeLoader variant={BadgeVariant.INFO} />
              : (
                <Badge
                  aria-role='button'
                  icon={badgeConfig.icon}
                  variant={badgeConfig.variant}
                  onClick={onSync}
                  size={BadgeSize.SMALL}
                  hoverable
                >
                  {t(badgeConfig.i18nKey, badgeConfig.defaultValue)}
                </Badge>
              )}
          </HStack>
          <div className='topbar-logo'>
            <QuickbooksIcon size={28} />
          </div>
        </div>
        <IntegrationsQuickbooksItemThumbFooter quickbooksUiState={quickbooksUiState} />
      </Card>
      {isConfirmationModalOpen && <IntegrationsQuickbooksUnlinkConfirmationModal isOpen onOpenChange={setIsConfirmationModalOpen} />}
    </LinkedAccountOptions>
  )
}
