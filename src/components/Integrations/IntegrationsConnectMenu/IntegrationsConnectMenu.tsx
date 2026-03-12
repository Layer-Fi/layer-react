import { useCallback, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { QuickbooksContext } from '@contexts/QuickbooksContext/QuickbooksContext'
import CheckIcon from '@icons/Check'
import Cog from '@icons/Cog'
import LinkIcon from '@icons/Link'
import QuickbooksIcon from '@icons/QuickbooksIcon'
import { Button } from '@ui/Button/Button'
import { DropdownMenu, MenuItem, MenuList } from '@ui/DropdownMenu/DropdownMenu'
import { Spacer } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'

const MenuTriggerButton = () => {
  const { t } = useTranslation()
  return (
    <Button variant='outlined'>
      {t('manage', 'Manage')}
      <Cog size={16} />
    </Button>
  )
}

export const IntegrationsConnectMenu = () => {
  const { t } = useTranslation()
  const { addToast } = useLayerContext()

  const { quickbooksConnectionStatus, linkQuickbooks } = useContext(QuickbooksContext)
  const quickbooksIsConnected = quickbooksConnectionStatus?.is_connected

  const [isLinkQuickbooksError, setIsLinkQuickbooksError] = useState(false)

  const initiateQuickbooksOAuth = useCallback(() => {
    linkQuickbooks()
      .then((res) => { window.location.href = res })
      .catch(() => {
        setIsLinkQuickbooksError(true)
        addToast({ content: t('failedToConnectQuickbooks', 'Failed to connect QuickBooks'), type: 'error' })
      })
  }, [linkQuickbooks, addToast, t])

  return (
    <DropdownMenu
      ariaLabel={t('connectIntegration', 'Connect Integration')}
      slots={{ Trigger: MenuTriggerButton }}
      slotProps={{ Dialog: { width: 280 } }}
    >
      <Heading size='2xs' weight='bold'>{t('integrations', 'Integrations')}</Heading>
      <MenuList>
        {quickbooksIsConnected
          ? (
            <MenuItem key='quickbooks-connected' isDisabled>
              <QuickbooksIcon size={20} />
              <Span size='sm'>{t('quickbooksConnected', 'QuickBooks connected')}</Span>
              <Spacer />
              <CheckIcon size={16} />
            </MenuItem>
          )
          : (
            <MenuItem key='connect-quickbooks' onClick={initiateQuickbooksOAuth}>
              <QuickbooksIcon size={20} />
              <Span {...isLinkQuickbooksError && { status: 'error' }} size='sm'>
                { isLinkQuickbooksError ? t('retryConnectQuickbooks', 'Retry Connect QuickBooks') : t('connectQuickbooks', 'Connect QuickBooks') }
              </Span>
              <Spacer />
              <LinkIcon size={12} />
            </MenuItem>
          )}
      </MenuList>
    </DropdownMenu>
  )
}
