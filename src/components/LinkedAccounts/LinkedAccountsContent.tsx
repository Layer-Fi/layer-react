import React, { useContext } from 'react'
import { LinkedAccountsContext } from '../../contexts/LinkedAccountsContext'
import PlusIcon from '../../icons/PlusIcon'
import { Source } from '../../types/linked_accounts'
import { LinkedAccountOptions } from '../LinkedAccountOptions'
import { LinkedAccountThumb } from '../LinkedAccountThumb'
import { Text, TextSize } from '../Typography'
import classNames from 'classnames'

interface LinkedAccountsDataProps {
  asWidget?: boolean
}

export const LinkedAccountsContent = ({
  asWidget,
}: LinkedAccountsDataProps) => {
  const { data, addConnection, unlinkAccount } = useContext(
    LinkedAccountsContext,
  )

  const linkedAccountOptionsConfig = [
    {
      name: 'Unlink account',
      action: (source: Source, __: string, accountId: string) =>
        unlinkAccount(source, accountId),
    },
  ]

  const linkedAccountsNewAccountClassName = classNames(
    'Layer__linked-accounts__new-account',
    asWidget && '--as-widget',
  )

  return (
    <div className='Layer__linked-accounts__list'>
      {data?.map((account, index) => (
        <LinkedAccountOptions
          key={`linked-acc-${index}`}
          config={linkedAccountOptionsConfig}
          accountId={account.id}
          connectionId={account.connection_id}
          source={account.external_account_source}
        >
          <LinkedAccountThumb account={account} asWidget={asWidget} />
        </LinkedAccountOptions>
      ))}
      <div
        role='button'
        tabIndex={0}
        aria-label='new-account'
        onClick={() => addConnection('PLAID')}
        className={linkedAccountsNewAccountClassName}
      >
        <div className='Layer__linked-accounts__new-account-label'>
          <PlusIcon size={15} />
          <Text as='span' size={'sm' as TextSize}>
            Add Account
          </Text>
        </div>
      </div>
    </div>
  )
}
