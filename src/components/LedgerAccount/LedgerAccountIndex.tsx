import React, {
  RefObject,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { ChartOfAccountsContext } from '../../contexts/ChartOfAccountsContext'
import { LedgerAccountsContext } from '../../contexts/LedgerAccountsContext'
import { flattenAccounts } from '../../hooks/useChartOfAccounts/useChartOfAccounts'
import { centsToDollars } from '../../models/Money'
import { BackButton } from '../Button'
import { View } from '../ChartOfAccounts/ChartOfAccounts'
import { DataState, DataStateStatus } from '../DataState'
import { Header, HeaderCol, HeaderRow } from '../Header'
import { LedgerAccountEntryDetails } from '../LedgerAccountEntryDetails'
import { LedgerAccountEntryDetailsStringOverrides } from '../LedgerAccountEntryDetails/LedgerAccountEntryDetails'
import { Loader } from '../Loader'
import { Pagination } from '../Pagination'
import { Panel } from '../Panel'
import { Text, TextSize, TextWeight } from '../Typography'
import { LedgerAccountRow } from './LedgerAccountRow'
import classNames from 'classnames'

interface LedgerEntriesTableStringOverrides {
  dateColumnHeader?: string
  journalIdColumnHeader?: string
  sourceColumnHeader?: string
  debitColumnHeader?: string
  creditColumnHeader?: string
  runningBalanceColumnHeader?: string
}

export interface LedgerAccountStringOverrides {
  ledgerEntryDetail?: LedgerAccountEntryDetailsStringOverrides
  ledgerEntriesTable?: LedgerEntriesTableStringOverrides
}

export interface LedgerAccountProps {
  view: View
  containerRef: RefObject<HTMLDivElement>
  pageSize?: number
  stringOverrides?: LedgerAccountStringOverrides
}

export const LedgerAccount = ({
  containerRef,
  pageSize = 15,
  view,
  stringOverrides,
}: LedgerAccountProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [initialLoad, setInitialLoad] = useState(true)

  const { data: accountData } = useContext(ChartOfAccountsContext)

  const {
    data: rawData,
    error,
    isLoading,
    isValidating,
    accountId,
    setAccountId,
    selectedEntryId,
    closeSelectedEntry,
    refetch,
  } = useContext(LedgerAccountsContext)

  useEffect(() => {
    if (!isLoading) {
      const timeoutLoad = setTimeout(() => {
        setInitialLoad(false)
      }, 1000)
      return () => clearTimeout(timeoutLoad)
    }
  }, [isLoading])

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
      sidebar={
        <LedgerAccountEntryDetails
          stringOverrides={stringOverrides?.ledgerEntryDetail}
        />
      }
      sidebarIsOpen={Boolean(selectedEntryId)}
      parentRef={containerRef}
      className='Layer__ledger-account__panel'
    >
      <div className={baseClassName}>
        <Header className='Layer__ledger-account__header'>
          <HeaderRow>
            <HeaderCol>
              <BackButton onClick={close} />
              <div className='Layer__ledger-account__title-container'>
                <Text
                  weight={TextWeight.bold}
                  className='Layer__ledger-account__title'
                >
                  {entry?.name ?? ''}
                </Text>
                <div className='Layer__ledger-account__balance-container'>
                  <Text
                    className='Layer__ledger-account__balance-label'
                    size={TextSize.sm}
                  >
                    Current balance
                  </Text>
                  <Text
                    className='Layer__ledger-account__balance-value'
                    size={TextSize.sm}
                  >
                    ${centsToDollars(entry?.balance || 0)}
                  </Text>
                </div>
              </div>
            </HeaderCol>
          </HeaderRow>
        </Header>
        <table className='Layer__table Layer__table--hover-effect Layer__ledger-account-table'>
          <thead>
            <tr>
              {view !== 'desktop' && <th />}
              {view === 'desktop' && (
                <>
                  <th className='Layer__table-header'>
                    {stringOverrides?.ledgerEntriesTable?.dateColumnHeader ||
                      'Date'}
                  </th>
                  <th className='Layer__table-header'>
                    {stringOverrides?.ledgerEntriesTable
                      ?.journalIdColumnHeader || 'Journal id #'}
                  </th>
                  <th className='Layer__table-header'>
                    {stringOverrides?.ledgerEntriesTable?.sourceColumnHeader ||
                      'Source'}
                  </th>
                </>
              )}
              {view !== 'mobile' && (
                <>
                  <th className='Layer__table-header Layer__table-cell--amount'>
                    {stringOverrides?.ledgerEntriesTable?.debitColumnHeader ||
                      'Debit'}
                  </th>
                  <th className='Layer__table-header Layer__table-cell--amount'>
                    {stringOverrides?.ledgerEntriesTable?.creditColumnHeader ||
                      'Credit'}
                  </th>
                  <th className='Layer__table-header Layer__table-cell--amount'>
                    {stringOverrides?.ledgerEntriesTable
                      ?.runningBalanceColumnHeader || 'Running balance'}
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {data?.map((x, index) => (
              <LedgerAccountRow
                key={x.id}
                row={x}
                index={index}
                initialLoad={initialLoad}
                view={view}
              />
            ))}
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
