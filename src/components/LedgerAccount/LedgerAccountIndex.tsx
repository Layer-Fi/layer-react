import React, { RefObject, useContext, useMemo } from 'react'
import { DATE_FORMAT } from '../../config/general'
import { flattenAccounts } from '../../hooks/useChartOfAccounts/useChartOfAccounts'
import DownloadCloud from '../../icons/DownloadCloud'
import { centsToDollars } from '../../models/Money'
import { Direction } from '../../types'
import { Button, ButtonVariant } from '../Button'
import {
  ChartOfAccountsContext,
  LedgerAccountsContext,
  View,
} from '../ChartOfAccounts/ChartOfAccounts'
import { LedgerAccountEntryDetails } from '../LedgerAccountEntryDetails'
import { Panel } from '../Panel'
import { Text, TextWeight } from '../Typography'
import classNames from 'classnames'
import { parseISO, format as formatTime } from 'date-fns'

export const LedgerAccount = ({
  view,
  containerRef,
}: {
  view: View
  containerRef: RefObject<HTMLDivElement>
}) => {
  const { data: accountData } = useContext(ChartOfAccountsContext)

  const {
    data,
    entryData,
    accountId,
    setAccountId,
    selectedEntryId,
    setSelectedEntryId,
  } = useContext(LedgerAccountsContext)

  const baseClassName = classNames(
    'Layer__ledger-account__index',
    accountId && 'open',
  )

  const entry = useMemo(() => {
    return flattenAccounts(accountData?.accounts || []).find(
      x => x.id === accountId,
    )
  }, [accountId])

  const close = () => setAccountId(undefined)

  return (
    <Panel
      sidebar={<LedgerAccountEntryDetails />}
      sidebarIsOpen={Boolean(selectedEntryId)}
      parentRef={containerRef}
      className='Layer__ledger-account__panel'
    >
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
              {entry?.name ?? ''}
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
            {data?.map(x => {
              return (
                <tr
                  key={x.id}
                  onClick={() => {
                    if (selectedEntryId === x.entry_id) {
                      setSelectedEntryId(undefined)
                    } else {
                      setSelectedEntryId(x.entry_id)
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
      </div>
    </Panel>
  )
}
