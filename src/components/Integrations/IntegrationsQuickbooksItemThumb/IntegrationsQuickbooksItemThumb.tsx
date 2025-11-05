import { useCallback, useContext, useMemo, useState } from 'react'
import QuickbooksIcon from '../../../icons/QuickbooksIcon'
import { Badge, BadgeSize, BadgeVariant } from '../../Badge/Badge'
import { BadgeLoader } from '../../BadgeLoader'
import RefreshCcw from '../../../icons/RefreshCcw'
import { HStack } from '../../ui/Stack/Stack'
import { Card } from '../../Card/Card'
import { Text, TextSize } from '../../Typography'
import { QuickbooksContext } from '../../../contexts/QuickbooksContext/QuickbooksContext'
import { LinkedAccountOptions } from '../../LinkedAccountOptions/LinkedAccountOptions'
import { IntegrationsQuickbooksItemThumbFooter } from './IntegrationsQuickbooksItemThumbFooter'
import { getQuickbooksConnectionSyncUiState, QuickbooksConnectionSyncUiState } from './utils'
import { AlertCircle, CheckIcon } from 'lucide-react'
import { IntegrationsQuickbooksUnlinkConfirmationModal } from './IntegrationsQuickbooksUnlinkConfirmationModal'

const getBadgeConfig = (quickbooksUiState: QuickbooksConnectionSyncUiState, hasSynced: boolean) => {
  if (!hasSynced) {
    return {
      variant: BadgeVariant.INFO,
      text: 'Sync',
      icon: <RefreshCcw size={12} />,
    } as const
  }

  switch (quickbooksUiState) {
    case QuickbooksConnectionSyncUiState.SyncFailed: {
      return {
        variant: BadgeVariant.ERROR,
        text: 'Retry Sync',
        icon: <AlertCircle size={12} />,
      } as const
    }
    case QuickbooksConnectionSyncUiState.Connected:
    case QuickbooksConnectionSyncUiState.SyncSuccess: {
      return {
        variant: BadgeVariant.SUCCESS,
        text: 'Synced',
        icon: <CheckIcon size={12} />,
      } as const
    }
    default:
    case QuickbooksConnectionSyncUiState.Syncing: {
      return {
        variant: BadgeVariant.INFO,
        text: 'Sync',
        icon: <RefreshCcw size={12} />,
      } as const
    }
  }
}

export const IntegrationsQuickbooksItemThumb = () => {
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
        name: 'Unlink account',
        action: () => {
          setIsConfirmationModalOpen(true)
        },
      },
    ]
  }, [])

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
                  {badgeConfig.text}
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
