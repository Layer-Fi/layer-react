import { ChangeEvent, useCallback, useState } from 'react'
import { useLayerContext } from '../../contexts/LayerContext'
import { DateRange, DisplayState } from '../../types'
import { getEarliestDateToBrowse } from '../../utils/business'
import { ButtonVariant, DownloadButton as DownloadButtonComponent } from '../Button'
import { Header } from '../Container'
import { DatePicker } from '../DatePicker'
import { SyncingComponent } from '../SyncingComponent'
import { Toggle } from '../Toggle'
import { ToggleSize } from '../Toggle/Toggle'
import { Heading, HeadingSize } from '../Typography'
import { MobileComponentType } from './constants'
import classNames from 'classnames'
import { endOfMonth, startOfMonth } from 'date-fns'
import { useBankTransactionsContext, useBankTransactionsBulkSelectionContext } from '../../contexts/BankTransactionsContext'
import { useDebounce } from '../../hooks/useDebounce/useDebounce'
import { SearchField } from '../SearchField/SearchField'
import { TransactionsActions } from '../domain/transactions/actions/TransactionsActions'
import { HStack, VStack } from '../ui/Stack/Stack'
import { useBankTransactionsDownload } from '../../hooks/useBankTransactions/useBankTransactionsDownload'
import InvisibleDownload, { useInvisibleDownload } from '../utility/InvisibleDownload'
import { bankTransactionFiltersToHookOptions } from '../../hooks/useBankTransactions/useAugmentedBankTransactions'
import { BankTransactionsUploadMenu } from './BankTransactionsUploadMenu'
import { useMemo } from 'react'

export interface BankTransactionsHeaderProps {
  shiftStickyHeader: number
  asWidget?: boolean
  categorizedOnly?: boolean
  categorizeView?: boolean
  display?: DisplayState
  onCategorizationDisplayChange: (event: ChangeEvent<HTMLInputElement>) => void
  mobileComponent?: MobileComponentType
  withDatePicker?: boolean
  listView?: boolean
  dateRange?: DateRange
  isDataLoading?: boolean
  isSyncing?: boolean
  setDateRange?: (value: DateRange) => void
  stringOverrides?: BankTransactionsHeaderStringOverrides
  withUploadMenu?: boolean
  onBulkActionClick?: () => void
}

export interface BankTransactionsHeaderStringOverrides {
  header?: string
  downloadButton?: string
}

type TransactionsSearchProps = {
  slot?: string
}

function TransactionsSearch({ slot }: TransactionsSearchProps) {
  const { filters, setFilters } = useBankTransactionsContext()

  const [localSearch, setLocalSearch] = useState(() => filters?.query ?? '')

  const debouncedSetDescription = useDebounce((value: string) => {
    setFilters({ query: value })
  })

  const handleSearch = useCallback((value: string) => {
    setLocalSearch(value)

    void debouncedSetDescription(value)
  }, [debouncedSetDescription])

  return (
    <SearchField
      slot={slot}
      label='Search transactions'
      value={localSearch}
      onChange={handleSearch}
    />
  )
}

const DownloadButton = ({
  downloadButtonTextOverride,
  iconOnly,
}: {
  downloadButtonTextOverride?: string
  iconOnly?: boolean
}) => {
  const { filters } = useBankTransactionsContext()

  const { invisibleDownloadRef, triggerInvisibleDownload } = useInvisibleDownload()
  const { trigger, isMutating, error } = useBankTransactionsDownload()

  const handleClick = () => {
    void trigger(bankTransactionFiltersToHookOptions(filters))
      .then((result) => {
        if (result?.presignedUrl) {
          triggerInvisibleDownload({ url: result.presignedUrl })
        }
      })
  }

  return (
    <>
      <DownloadButtonComponent
        variant={ButtonVariant.secondary}
        iconOnly={iconOnly}
        onClick={handleClick}
        isDownloading={isMutating}
        requestFailed={Boolean(error)}
        text={downloadButtonTextOverride ?? 'Download'}
      />
      <InvisibleDownload ref={invisibleDownloadRef} />
    </>
  )
}

export const BankTransactionsHeader = ({
  shiftStickyHeader,
  asWidget,
  categorizedOnly,
  categorizeView = true,
  display,
  onCategorizationDisplayChange,
  mobileComponent,
  withDatePicker,
  listView,
  dateRange,
  setDateRange,
  stringOverrides,
  isSyncing,
  withUploadMenu,
  onBulkActionClick,
}: BankTransactionsHeaderProps) => {
  const { business } = useLayerContext()
  const { selectedTransactions, bulkSelectionActive, clearSelection } = useBankTransactionsBulkSelectionContext()
  const hasSelectedTransactions = selectedTransactions.length > 0

  return (
    <Header
      className={classNames(
        'Layer__bank-transactions__header',
        withDatePicker && 'Layer__bank-transactions__header--with-date-picker',
        mobileComponent && listView
          ? 'Layer__bank-transactions__header--mobile'
          : undefined,
      )}
      style={{ top: shiftStickyHeader }}
    >
      <div className='Layer__bank-transactions__header__content'>
        <div className='Layer__bank-transactions__header__content-title'>
          <Heading
            className='Layer__bank-transactions__title'
            size={asWidget ? HeadingSize.secondary : HeadingSize.secondary}
          >
            {stringOverrides?.header || 'Transactions'}
          </Heading>
          {isSyncing && (
            <SyncingComponent
              timeSync={5}
              inProgress={true}
              hideContent={listView}
            />
          )}
        </div>
        {withDatePicker && dateRange && setDateRange
          ? (
            <DatePicker
              displayMode='monthPicker'
              selected={dateRange.startDate}
              onChange={(date) => {
                if (!Array.isArray(date)) {
                  setDateRange({
                    startDate: startOfMonth(date),
                    endDate: endOfMonth(date),
                  })
                }
              }}
              minDate={getEarliestDateToBrowse(business)}
            />
          )
          : null}
      </div>
      <div className={hasSelectedTransactions ? 'Layer__transactions-actions--bulk-selection-active' : ''}>
        <TransactionsActions>
          {hasSelectedTransactions ? (
            // Selection overlay content
            <>
              <VStack slot='toggle' justify='center'>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: 'bold', 
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    {selectedTransactions.length}
                  </span>
                  {selectedTransactions.length === 1 ? ' transaction selected' : ' transactions selected'}
                </span>
              </VStack>
              <HStack slot='search' justify='center'>
                <button
                  onClick={clearSelection}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#374151'
                  }}
                >
                  Clear Selection
                </button>
              </HStack>
              <HStack slot='download-upload' justify='center' gap='xs'>
                <button
                  onClick={onBulkActionClick}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ef4444',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: 'white'
                  }}
                >
                  Bulk Actions
                </button>
              </HStack>
            </>
          ) : (
            // Default content
            <>
              {(!categorizedOnly && categorizeView) && (
                <VStack slot='toggle' justify='center'>
                  <Toggle
                    name='bank-transaction-display'
                    size={
                      mobileComponent === 'mobileList'
                        ? ToggleSize.small
                        : ToggleSize.medium
                    }
                    options={[
                      { label: 'To Review', value: DisplayState.review },
                      { label: 'Categorized', value: DisplayState.categorized },
                    ]}
                    selected={display}
                    onChange={onCategorizationDisplayChange}
                  />
                </VStack>
              )}
              <TransactionsSearch slot='search' />
              <HStack slot='download-upload' justify='center' gap='xs'>
                <DownloadButton
                  downloadButtonTextOverride={stringOverrides?.downloadButton}
                  iconOnly={listView}
                />
                {withUploadMenu && <BankTransactionsUploadMenu />}
              </HStack>
            </>
          )}
        </TransactionsActions>
      </div>
    </Header>
  )
}
