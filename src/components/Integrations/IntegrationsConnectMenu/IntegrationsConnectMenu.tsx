import { useCallback, useContext, useState } from 'react'
import { DropdownMenu, Heading, MenuList, MenuItem } from '../../ui/DropdownMenu/DropdownMenu'
import QuickbooksIcon from '../../../icons/QuickbooksIcon'
import LinkIcon from '../../../icons/Link'
import { Text, TextSize } from '../../Typography'
import CheckIcon from '../../../icons/Check'
import Cog from '../../../icons/Cog'
import { Button } from '../../ui/Button/Button'
import { Spacer } from '../../ui/Stack/Stack'
import { QuickbooksContext } from '../../../contexts/QuickbooksContext/QuickbooksContext'
import { useLayerContext } from '../../../contexts/LayerContext'

const MenuTriggerButton = () => (
  <Button variant='outlined'>
    Manage
    <Cog size={16} />
  </Button>
)

export const IntegrationsConnectMenu = () => {
  const { addToast } = useLayerContext()

  const { quickbooksConnectionStatus, linkQuickbooks } = useContext(QuickbooksContext)
  const quickbooksIsConnected = quickbooksConnectionStatus?.is_connected

  const [isLinkQuickbooksError, setIsLinkQuickbooksError] = useState(false)

  const initiateQuickbooksOAuth = useCallback(() => {
    linkQuickbooks()
      .then((res) => { window.location.href = res })
      .catch(() => {
        setIsLinkQuickbooksError(true)
        addToast({ content: 'Failed to connect QuickBooks', type: 'error' })
      })
  }, [linkQuickbooks, addToast])

  return (
    <DropdownMenu
      ariaLabel='Connect Integration'
      slots={{ Trigger: MenuTriggerButton }}
      slotProps={{ Dialog: { width: 280 } }}
    >
      <Heading>Integrations</Heading>
      <MenuList>
        {quickbooksIsConnected
          ? (
            <MenuItem key='quickbooks-connected' isDisabled>
              <QuickbooksIcon size={20} />
              <Text size={TextSize.sm}>
                QuickBooks connected
              </Text>
              <Spacer />
              <CheckIcon size={16} />
            </MenuItem>
          )
          : (
            <MenuItem key='connect-quickbooks' onClick={initiateQuickbooksOAuth}>
              <QuickbooksIcon size={20} />
              <Text {...isLinkQuickbooksError && { status: 'error' }} size={TextSize.sm}>
                { isLinkQuickbooksError ? 'Retry Connect QuickBooks' : 'Connect QuickBooks' }
              </Text>
              <Spacer />
              <LinkIcon size={12} />
            </MenuItem>
          )}
      </MenuList>
    </DropdownMenu>
  )
}
