import {
  type RefObject,
  useContext,
  useMemo,
  useState,
} from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { LedgerAccountNodeType } from '@internal-types/chartOfAccounts'
import { type View } from '@internal-types/general'
import { centsToDollars } from '@utils/money'
import { LedgerAccountsContext } from '@contexts/LedgerAccountsContext/LedgerAccountsContext'
import { BackButton } from '@components/Button/BackButton'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { Header } from '@components/Header/Header'
import { HeaderCol } from '@components/Header/HeaderCol'
import { HeaderRow } from '@components/Header/HeaderRow'
import { LedgerAccountRow } from '@components/LedgerAccount/LedgerAccountRow'
import { LedgerAccountEntryDetails } from '@components/LedgerAccountEntryDetails/LedgerAccountEntryDetails'
import { type LedgerAccountEntryDetailsStringOverrides } from '@components/LedgerAccountEntryDetails/LedgerAccountEntryDetails'
import { Loader } from '@components/Loader/Loader'
import { Pagination } from '@components/Pagination/Pagination'
import { Panel } from '@components/Panel/Panel'
import { Text, TextSize, TextWeight } from '@components/Typography/Text'

interface LedgerEntriesTableStringOverrides {
  dateColumnHeader?: string
  journalIdColumnHeader?: string
  sourceColumnHeader?: string
  accountColumnHeader?: string
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
  const { t } = useTranslation()
  const [currentPage, setCurrentPage] = useState(1)

  const {
    data: rawData,
    error,
    isLoading,
    isValidating,
    selectedAccount,
    setSelectedAccount,
    selectedEntryId,
    closeSelectedEntry,
    refetch,
    hasMore,
    fetchMore,
  } = useContext(LedgerAccountsContext)
  const baseClassName = classNames(
    'Layer__ledger-account__index',
    selectedAccount && 'open',
  )

  const nodeType = selectedAccount?.nodeType

  const data = useMemo(() => {
    if (!rawData) return undefined

    const firstPageIndex = (currentPage - 1) * pageSize
    const lastPageIndex = firstPageIndex + pageSize
    return rawData
      ?.sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
      ?.slice(firstPageIndex, lastPageIndex)
  }, [rawData, currentPage, pageSize])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    if (rawData) {
      const requestedItemIndex = (page - 1) * pageSize + pageSize - 1
      const lastAvailableIndex = rawData.length - 1
      if (requestedItemIndex > lastAvailableIndex && hasMore) {
        fetchMore()
      }
    }
  }

  const close = () => {
    setSelectedAccount(undefined)
    closeSelectedEntry()
  }

  return (
    <Panel
      sidebar={(
        <LedgerAccountEntryDetails
          stringOverrides={stringOverrides?.ledgerEntryDetail}
        />
      )}
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
                  {selectedAccount?.name ?? ''}
                </Text>
                <div className='Layer__ledger-account__balance-container'>
                  <Text
                    className='Layer__ledger-account__balance-label'
                    size={TextSize.sm}
                  >
                    {t('generalLedger.currentBalance', 'Current balance')}
                  </Text>
                  <Text
                    className='Layer__ledger-account__balance-value'
                    size={TextSize.sm}
                  >
                    $
                    {centsToDollars(selectedAccount?.balance || 0)}
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
                    {stringOverrides?.ledgerEntriesTable?.dateColumnHeader
                      || t('common.date', 'Date')}
                  </th>
                  <th className='Layer__table-header'>
                    {stringOverrides?.ledgerEntriesTable
                      ?.journalIdColumnHeader || t('generalLedger.journalId', 'Journal ID #')}
                  </th>
                  <th className='Layer__table-header'>
                    {stringOverrides?.ledgerEntriesTable?.sourceColumnHeader
                      || t('common.source', 'Source')}
                  </th>
                  {nodeType !== LedgerAccountNodeType.Leaf
                    && (
                      <th className='Layer__table-header'>
                        {stringOverrides?.ledgerEntriesTable?.accountColumnHeader
                          || t('common.account', 'Account')}
                      </th>
                    )}
                </>
              )}
              {view !== 'mobile' && (
                <>
                  <th className='Layer__table-header Layer__table-cell--amount'>
                    {stringOverrides?.ledgerEntriesTable?.debitColumnHeader
                      || t('common.debit', 'Debit')}
                  </th>
                  <th className='Layer__table-header Layer__table-cell--amount'>
                    {stringOverrides?.ledgerEntriesTable?.creditColumnHeader
                      || t('common.credit', 'Credit')}
                  </th>
                  <th className='Layer__table-header Layer__table-cell--amount'>
                    {stringOverrides?.ledgerEntriesTable
                      ?.runningBalanceColumnHeader || t('generalLedger.runningBalance', 'Running balance')}
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
                view={view}
                nodeType={nodeType}
              />
            ))}
          </tbody>
        </table>

        {data && (
          <Pagination
            currentPage={currentPage}
            totalCount={rawData?.length || 0}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            hasMore={hasMore}
            fetchMore={fetchMore}
          />
        )}

        {error
          ? (
            <div className='Layer__table-state-container Layer__border-top'>
              <DataState
                status={DataStateStatus.failed}
                title={t('common.somethingWentWrong', 'Something went wrong')}
                description={t('common.weCouldntLoadYourData', 'We couldn’t load your data.')}
                onRefresh={() => { void refetch() }}
                isLoading={isValidating || isLoading}
              />
            </div>
          )
          : null}

        {(!data || isLoading) && !error
          ? (
            <div className='Layer__ledger-account__loader-container'>
              <Loader />
            </div>
          )
          : null}

        {!isLoading && !error && data?.length === 0
          ? (
            <div className='Layer__table-state-container Layer__border-top'>
              <DataState
                status={DataStateStatus.info}
                title={t('generalLedger.noLedgerActivity', 'No ledger activity')}
                description={t('generalLedger.thereAreNoLedgerEntriesInThisAccount', 'There are no ledger entries in this account.')}
              />
            </div>
          )
          : null}
      </div>
    </Panel>
  )
}
