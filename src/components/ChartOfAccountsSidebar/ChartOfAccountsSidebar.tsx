import React, { useContext } from 'react'
import { ChartOfAccountsContext } from '../ChartOfAccounts/ChartOfAccounts'
import { ChartOfAccountsForm } from '../ChartOfAccountsForm'
import classNames from 'classnames'

export const ChartOfAccountsSidebar = () => {
  const { form } = useContext(ChartOfAccountsContext)

  return (
    <div
      className={classNames(
        'Layer__chart-of-accounts__sidebar',
        form ? 'open' : '',
      )}
    >
      <div className='Layer__chart-of-accounts__sidebar-content'>
        <ChartOfAccountsForm />
      </div>
    </div>
  )
}
