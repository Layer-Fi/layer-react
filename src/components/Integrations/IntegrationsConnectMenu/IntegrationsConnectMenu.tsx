import { useCallback, useContext } from 'react'
import { DropdownMenu, Heading, MenuList, MenuItem } from '../../ui/DropdownMenu/DropdownMenu'
import QuickbooksIcon from '../../../icons/QuickbooksIcon'
import LinkIcon from '../../../icons/Link'
import { Text, TextSize } from '../../Typography'
import CheckIcon from '../../../icons/Check'
import Cog from '../../../icons/Cog'
import { Button } from '../../ui/Button/Button'
import { Spacer } from '../../ui/Stack/Stack'
import { QuickbooksContext } from '../../../contexts/QuickbooksContext/QuickbooksContext'

const MenuTriggerButton = () => (
  <Button variant='ghost'>
    Manage
    <Cog size={16} />
  </Button>
)

export const IntegrationsConnectMenu = () => {
  const {
    quickbooksIsConnected,
    linkQuickbooks,
  } = useContext(QuickbooksContext)

  const initiateQuickbooksOAuth = useCallback(async () => {
    const authorizationUrl = await linkQuickbooks()
    window.location.href = authorizationUrl
  }, [linkQuickbooks])

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
                Quickbooks connected
              </Text>
              <Spacer />
              <CheckIcon size={16} />
            </MenuItem>
          )
          : (
            <MenuItem key='connect-quickbooks' onClick={initiateQuickbooksOAuth}>
              <QuickbooksIcon size={20} />
              <Text size={TextSize.sm}>
                Connect Quickbooks
              </Text>
              <Spacer />
              <LinkIcon size={12} />
            </MenuItem>
          )}
      </MenuList>
    </DropdownMenu>
  )
}
