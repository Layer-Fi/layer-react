import React, { useContext, useMemo, useState } from 'react'
import { Layer } from '../../api/layer'
import { DATE_FORMAT } from '../../config/general'
import { flattenAccounts } from '../../hooks/useChartOfAccounts/useChartOfAccounts'
import { useLayerContext } from '../../hooks/useLayerContext'
import DownloadCloud from '../../icons/DownloadCloud'
import { centsToDollars } from '../../models/Money'
import { Direction } from '../../types'
import { Button, ButtonVariant } from '../Button'
import { ChartOfAccountsContext } from '../ChartOfAccounts/ChartOfAccounts'
import { Text, TextWeight } from '../Typography'
import classNames from 'classnames'
import { parseISO, format as formatTime } from 'date-fns'
import useSWR from 'swr'

export const LedgerAccount = () => {
  const { auth, businessId, apiUrl } = useLayerContext()
  const {
    data: accountData,
    showARForAccountId,
    setShowARForAccountId,
  } = useContext(ChartOfAccountsContext)

  const { data, isLoading, isValidating, error, mutate } = useSWR(
    businessId &&
      showARForAccountId &&
      auth?.access_token &&
      `ledger-accounts-lines-${businessId}-${showARForAccountId}`,
    Layer.getLedgerAccountsLines(apiUrl, auth?.access_token, {
      params: { businessId, accountId: showARForAccountId },
    }),
  )

  const [lineId, setLineId] = useState<string | undefined>()

  const { data: entryData } = useSWR(
    businessId &&
      lineId &&
      auth?.access_token &&
      `ledger-accounts-entry-${businessId}-${lineId}}`,
    Layer.getLedgerAccountsEntry(apiUrl, auth?.access_token, {
      params: { businessId, entryId: lineId },
    }),
  )

  const baseClassName = classNames(
    'Layer__ledger-account__index',
    showARForAccountId && 'open',
  )

  const entry = useMemo(() => {
    return flattenAccounts(accountData?.accounts || []).find(
      x => x.id === showARForAccountId,
    )
  }, [showARForAccountId])

  const close = () => setShowARForAccountId(undefined)

  return (
    <div className={baseClassName}>
      <div className='Layer__ledger-account__header'>
        <Button onClick={close} variant={ButtonVariant.secondary}>
          Back
        </Button>
        <div className='Layer__ledger-account__title-container'>
          <Text
            weight={TextWeight.bold}
            className='Layer__ledger-account__title'
          >
            Name
          </Text>
          <Button
            variant={ButtonVariant.secondary}
            rightIcon={<DownloadCloud size={12} />}
          >
            Download
          </Button>
        </div>
        <div className='Layer__ledger-account__balance-container'>
          <Text
            weight={TextWeight.bold}
            className='Layer__ledger-account__balance-label'
          >
            Current balance
          </Text>
          <Text
            weight={TextWeight.bold}
            className='Layer__ledger-account__balance-value'
          >
            ${centsToDollars(entry?.balance || 0)}
          </Text>
        </div>
      </div>
      <table className='Layer__table Layer__ledger-account-table'>
        <thead>
          <tr>
            <th className='Layer__table-header'>Date</th>
            <th className='Layer__table-header'>Journal id #</th>
            <th className='Layer__table-header'>Source</th>
            <th className='Layer__table-header Layer__table-cell--amount'>
              Debit
            </th>
            <th className='Layer__table-header Layer__table-cell--amount'>
              Credit
            </th>
            <th className='Layer__table-header Layer__table-cell--amount'>
              Running balance
            </th>
          </tr>
        </thead>
        <tbody>
          {data?.data?.map(x => {
            return (
              <tr
                key={x.id}
                onClick={() => {
                  if (lineId === x.entry_id) {
                    setLineId(undefined)
                  } else {
                    setLineId(x.entry_id)
                  }
                }}
              >
                <td className='Layer__table-cell'>
                  <span className='Layer__table-cell-content'>
                    {x.date && formatTime(parseISO(x.date), DATE_FORMAT)}
                  </span>
                </td>
                <td className='Layer__table-cell'>
                  <span className='Layer__table-cell-content'>#123</span>
                </td>
                <td className='Layer__table-cell'>
                  <span className='Layer__table-cell-content'>
                    Invoice (TBD null)
                  </span>
                </td>
                <td className='Layer__table-cell'>
                  <span className='Layer__table-cell-content Layer__table-cell--amount'>
                    {x.direction === Direction.DEBIT &&
                      `$${centsToDollars(x?.amount || 0)}`}
                  </span>
                </td>
                <td className='Layer__table-cell'>
                  <span className='Layer__table-cell-content Layer__table-cell--amount'>
                    {x.direction === Direction.CREDIT &&
                      `$${centsToDollars(x?.amount || 0)}`}
                  </span>
                </td>
                <td className='Layer__table-cell'>
                  <span className='Layer__table-cell-content Layer__table-cell--amount'>
                    $X,XXX.XX
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {lineId && (
        <div
          style={{
            position: 'absolute',
          }}
        ></div>
      )}
    </div>
  )
}
