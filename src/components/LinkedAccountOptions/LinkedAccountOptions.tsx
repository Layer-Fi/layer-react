import { type PropsWithChildren } from 'react'
import classNames from 'classnames'
import { EllipsisVertical } from 'lucide-react'
import { Button } from 'react-aria-components/Button'
import { Menu, MenuItem, MenuTrigger, Popover } from 'react-aria-components/Menu'
import { useTranslation } from 'react-i18next'

import type { Awaitable } from '@internal-types/utility/promises'
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

  const linkedAccountOptionsClassName = classNames(
    'Layer__linked-accounts__options',
    showLedgerBalance == false && '--hide-ledger-balance',
  )
  return (
    <div className={linkedAccountOptionsClassName}>
      <div className='Layer__linked-accounts__options-overlay'>
        {config.length
          ? (
            <MenuTrigger>
              <Button
                aria-label={t('linkedAccounts:label.account_options', 'Account options')}
                className='Layer__linked-accounts__options-overlay-button'
              >
                <EllipsisVertical size={16} />
              </Button>
              <Popover placement='bottom end' className='Layer__linked-accounts__options-menu Layer__variables'>
                <Menu
                  aria-label={t('linkedAccounts:label.account_options', 'Account options')}
                  className='Layer__linked-accounts__options-menu-list'
                >
                  {config.map(item => (
                    <MenuItem
                      key={item.name}
                      className='Layer__linked-accounts__options-menu-item'
                      onAction={() => void item.action()}
                    >
                      <Span size='sm' variant='inherit'>{item.name}</Span>
                    </MenuItem>
                  ))}
                </Menu>
              </Popover>
            </MenuTrigger>
          )
          : null}
      </div>
      {children}
    </div>
  )
}
