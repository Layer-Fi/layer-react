import React from 'react'
import { useChartOfAccounts } from '../../hooks/useChartOfAccounts'
import DownloadCloud from '../../icons/DownloadCloud'
import { ChartOfAccountsRow } from '../ChartOfAccountsRow'

export const ChartOfAccounts = () => {
  const { data, isLoading } = useChartOfAccounts()
  return (
    <div className="Layer__component Layer__chart-of-accounts">
      {!data || isLoading ? (
        'Loading.'
      ) : (
        <>
          <div className="Layer__chart-of-accounts__header">
            <h2 className="Layer__chart-of-accounts__title">
              Chart of Accounts
            </h2>
            <div className="Layer__chart-of-accounts__actions">
              <button className="Layer__chart-of-accounts__download-button">
                <DownloadCloud />
                Download
              </button>
              <button className="Layer__chart-of-accounts__edit-accounts-button">
                Edit Accounts
              </button>
            </div>
          </div>
          <div className="Layer__chart-of-accounts__table">
            <div className="Layer__chart-of-accounts__table-cell Layer__chart-of-accounts__table-cell--header">
              Name
            </div>
            <div className="Layer__chart-of-accounts__table-cell Layer__chart-of-accounts__table-cell--header">
              Type
            </div>
            <div className="Layer__chart-of-accounts__table-cell Layer__chart-of-accounts__table-cell--header">
              Sub-Type
            </div>
            <div className="Layer__chart-of-accounts__table-cell Layer__chart-of-accounts__table-cell--header Layer__chart-of-accounts__table-cell--header-balance">
              Balance
            </div>
            <div className="Layer__chart-of-accounts__table-cell Layer__chart-of-accounts__table-cell--header"></div>
            {data.accounts.map(account => (
              <ChartOfAccountsRow
                key={account.id}
                account={account}
                depth={0}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
