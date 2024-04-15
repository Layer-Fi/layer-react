import React, { useContext } from 'react'
import { ChartOfAccountsContext } from '../ChartOfAccounts/ChartOfAccounts'
import { ChartOfAccountsForm } from '../ChartOfAccountsForm'
import classNames from 'classnames'

export const ChartOfAccountsSidebar = ({ offset }: { offset: number }) => {
  const { form } = useContext(ChartOfAccountsContext)

  return (
    <div
      className={classNames(
        'Layer__chart-of-accounts__sidebar',
        form ? 'open' : '',
      )}
      style={{
        position: 'absolute',
        top: offset,
        left: 0,
        right: 0,
        background: '#f2f2f2',
      }}
    >
      <div className='Layer__chart-of-accounts__sidebar-content'>
        <ChartOfAccountsForm />
      </div>
    </div>
  )
}
