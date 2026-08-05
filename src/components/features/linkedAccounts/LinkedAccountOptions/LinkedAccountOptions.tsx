import { type PropsWithChildren, useCallback } from 'react'
import classNames from 'classnames'
import { EllipsisVertical } from 'lucide-react'
import { Button } from 'react-aria-components/Button'
import { useTranslation } from 'react-i18next'

import type { Awaitable } from '@internal-types/utility/awaitable'
import { DropdownMenu, MenuItem, MenuList } from '@ui/DropdownMenu/DropdownMenu'
import { Span } from '@ui/Typography/Text'

import './linkedAccountOptions.scss'

export type LinkedAccountOptionsConfig = Array<{
  name: string
  action: () => Awaitable<void>
}>

type LinkedAccountOptionsProps = PropsWithChildren<{
  config: LinkedAccountOptionsConfig
  showLedgerBalance?: boolean
}>

export const LinkedAccountOptions = ({
  children,
  config,
  showLedgerBalance,
}: LinkedAccountOptionsProps) => {
  const { t } = useTranslation()
  const accountOptionsLabel = t('linkedAccounts:label.account_options', 'Account options')

  const Trigger = useCallback(() => (
    <Button
      aria-label={accountOptionsLabel}
      className='Layer__linked-accounts__options-overlay-button'
    >
      <EllipsisVertical size={16} />
    </Button>
  ), [accountOptionsLabel])

  const linkedAccountOptionsClassName = classNames(
    'Layer__linked-accounts__options',
    showLedgerBalance == false && '--hide-ledger-balance',
  )
  return (
    <div className={linkedAccountOptionsClassName}>
      <div className='Layer__linked-accounts__options-overlay'>
        {config.length
          ? (
            <DropdownMenu ariaLabel={accountOptionsLabel} slots={{ Trigger }} variant='compact'>
              <MenuList>
                {config.map(item => (
                  <MenuItem key={item.name} onClick={() => void item.action()}>
                    <Span size='sm' variant='inherit'>{item.name}</Span>
                  </MenuItem>
                ))}
              </MenuList>
            </DropdownMenu>
          )
          : null}
      </div>
      {children}
    </div>
  )
}
