import React, { useContext } from 'react'
import { LedgerAccountsContext } from '../LedgerAccounts/LedgerAccounts'
import { LedgerAccountsForm } from '../LedgerAccountsForm'
import classNames from 'classnames'

export const LedgerAccountsSidebar = () => {
  const { form } = useContext(LedgerAccountsContext)

  return (
    <div
      className={classNames(
        'Layer__ledger-accounts__sidebar',
        form ? 'open' : '',
      )}
    >
      <div className='Layer__ledger-accounts__sidebar-content'>
        <LedgerAccountsForm />
      </div>
    </div>
  )
}
