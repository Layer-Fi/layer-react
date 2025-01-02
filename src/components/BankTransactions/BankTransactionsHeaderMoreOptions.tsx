import React, { useContext } from 'react'
import { useQuickbooks } from '../../hooks/useQuickbooks'
import { DropdownMenu, Heading, ActionableItem, Separator, MenuList } from '../ui/DropdownMenu/DropdownMenu'
import { LinkedAccountsContext } from '../../contexts/LinkedAccountsContext'
import { LinkedAccountsProvider } from '../../providers/LinkedAccountsProvider'
import PlaidIcon from '../../icons/PlaidIcon'
import ChevronRightIcon from '../../icons/ChevronRight'
import QuickbooksIcon from '../../icons/Quickbooks'
import LinkIcon from '../../icons/Link'
import { Text, TextSize } from '../Typography'
import CheckIcon from '../../icons/Check'
import { TextButton } from '../Button'
import { Badge, BadgeVariant } from '../Badge'
import { BadgeLoader } from '../BadgeLoader'
import RefreshCcw from '../../icons/RefreshCcw'
import { BadgeSize } from '../Badge/Badge'

export const BankTransactionsHeaderMoreOptions = () => (
  <LinkedAccountsProvider>
    <MoreOptionsContent />
  </LinkedAccountsProvider>
)

const QuickbooksConnected = ({
  isSyncing,
  syncFromQuickbooks,
  unlinkQuickbooks,
}: {
  isSyncing?: boolean
  syncFromQuickbooks: () => void
  unlinkQuickbooks: () => void
}) => {
  return (
    <div className='Layer__qb-tile Layer__qb-tile--connected'>
      <div className='Layer__qb-tile__base'>
        <QuickbooksIcon size={20} />
        <Text size={TextSize.sm} className='Layer__qb-tile__name'>Quickbooks</Text>
        <CheckIcon size={16} />
      </div>
      <div className='Layer__qb-tile__details'>
        <div className='Layer__qb-tile__details__status'>
          <Text className='Layer__qb-tile__details__status__text' size={TextSize.sm}>
            Last sync
            <span className='Layer__qb-tile__details__status__date'>12.12.2024</span>
          </Text>
          <TextButton onClick={unlinkQuickbooks}>Unlink</TextButton>
        </div>
        <div className='Layer__qb-tile__details__actions'>
          {isSyncing
            ? <BadgeLoader variant='info' />
            : (
              <Badge
                icon={<RefreshCcw size={12} />}
                variant={BadgeVariant.INFO}
                onClick={syncFromQuickbooks}
                size={BadgeSize.SMALL}
              >
                Sync
              </Badge>
            )}
        </div>
      </div>
    </div>
  )
}

const MoreOptionsContent = () => {
  const { addConnection } = useContext(LinkedAccountsContext)

  const {
    syncFromQuickbooks,
    isSyncingFromQuickbooks,
    quickbooksIsLinked,
    linkQuickbooks,
    unlinkQuickbooks,
  } = useQuickbooks()

  return (
    <DropdownMenu ariaLabel='Bank transactions more options'>
      <Heading>Connect accounts</Heading>
      <MenuList>
        <ActionableItem
          onClick={() => addConnection('PLAID')}
          leftIcon={<PlaidIcon />}
          rightIcon={<ChevronRightIcon size={12} />}
        >
          Connect next business account
        </ActionableItem>
        <Separator />
      </MenuList>
      <Heading>Integrations</Heading>
      {quickbooksIsLinked
        ? (
          <QuickbooksConnected
            unlinkQuickbooks={unlinkQuickbooks}
            syncFromQuickbooks={syncFromQuickbooks}
            isSyncing={isSyncingFromQuickbooks}
          />
        )
        : (
          <MenuList>
            <ActionableItem
              onClick={async () => {
                const authorizationUrl = await linkQuickbooks()
                window.location.href = authorizationUrl
              }}
              leftIcon={<QuickbooksIcon size={20} />}
              rightIcon={<LinkIcon size={12} />}
            >
              Connect Quickbooks
            </ActionableItem>
          </MenuList>
        )}
    </DropdownMenu>
  )
}
