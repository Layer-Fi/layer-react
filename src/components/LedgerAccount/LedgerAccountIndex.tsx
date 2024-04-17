import React, { RefObject, useContext, useMemo, useState } from 'react'
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
import { DataState, DataStateStatus } from '../DataState'
import { LedgerAccountEntryDetails } from '../LedgerAccountEntryDetails'
import { Loader } from '../Loader'
import { Pagination } from '../Pagination'
import { Panel } from '../Panel'
import { Text, TextWeight } from '../Typography'
import classNames from 'classnames'
import { parseISO, format as formatTime } from 'date-fns'

export interface LedgerAccountProps {
  view: View
  containerRef: RefObject<HTMLDivElement>
  pageSize?: number
}

export const LedgerAccount = ({
  containerRef,
  pageSize = 15,
}: LedgerAccountProps) => {
  const [currentPage, setCurrentPage] = useState(1)

  const { data: accountData } = useContext(ChartOfAccountsContext)

  const {
    data: rawData,
    error,
    isLoading,
    isValidating,
    accountId,
    setAccountId,
    selectedEntryId,
    setSelectedEntryId,
    closeSelectedEntry,
    refetch,
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

  const data = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize
    const lastPageIndex = firstPageIndex + pageSize
    return rawData
      ?.sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
      ?.slice(firstPageIndex, lastPageIndex)
  }, [rawData, currentPage])

  const close = () => {
    setAccountId(undefined)
    closeSelectedEntry()
  }

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
                  className={classNames(
                    'Layer__table-row',
                    x.entry_id === selectedEntryId &&
                      'Layer__table-row--active',
                  )}
                  onClick={() => {
                    if (selectedEntryId === x.entry_id) {
                      closeSelectedEntry()
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
                  <td className='Layer__table-cell Layer__table-cell--primary'>
                    <span className='Layer__table-cell-content'>#123</span>
                  </td>
                  <td className='Layer__table-cell'>
                    <span className='Layer__table-cell-content'>
                      Invoice (TBD null)
                    </span>
                  </td>
                  <td className='Layer__table-cell Layer__table-cell--primary'>
                    <span className='Layer__table-cell-content Layer__table-cell--amount'>
                      {x.direction === Direction.DEBIT &&
                        `$${centsToDollars(x?.amount || 0)}`}
                    </span>
                  </td>
                  <td className='Layer__table-cell Layer__table-cell--primary'>
                    <span className='Layer__table-cell-content Layer__table-cell--amount'>
                      {x.direction === Direction.CREDIT &&
                        `$${centsToDollars(x?.amount || 0)}`}
                    </span>
                  </td>
                  <td className='Layer__table-cell Layer__table-cell--primary'>
                    <span className='Layer__table-cell-content Layer__table-cell--amount'>
                      $X,XXX.XX
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {data && (
          <div className='Layer__ledger-account__pagination'>
            <Pagination
              currentPage={currentPage}
              totalCount={rawData?.length || 0}
              pageSize={pageSize}
              onPageChange={page => setCurrentPage(page)}
            />
          </div>
        )}

        {error ? (
          <div className='Layer__table-state-container'>
            <DataState
              status={DataStateStatus.failed}
              title='Something went wrong'
              description='We couldn’t load your data.'
              onRefresh={() => refetch()}
              isLoading={isValidating || isLoading}
            />
          </div>
        ) : null}

        {(!data || isLoading) && !error ? (
          <div className={`Layer__ledger-account__loader-container`}>
            <Loader />
          </div>
        ) : null}

        {!isLoading && !error && data?.length === 0 ? (
          <div className='Layer__table-state-container'>
            <DataState
              status={DataStateStatus.info}
              title='No records found'
              onRefresh={() => refetch()}
              isLoading={isValidating}
            />
          </div>
        ) : null}
      </div>
    </Panel>
  )
}
