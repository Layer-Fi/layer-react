import { ChangeEvent, useCallback, useMemo, useState } from 'react'
import { useLayerContext } from '../../contexts/LayerContext'
import { DisplayState, type DateRange } from '../../types'
import { getEarliestDateToBrowse } from '../../utils/business'
import { ButtonVariant, DownloadButton as DownloadButtonComponent } from '../Button'
import { Header } from '../Container'
import { DeprecatedDatePicker } from '../DeprecatedDatePicker/DeprecatedDatePicker'
import { SyncingComponent } from '../SyncingComponent'
import { Toggle } from '../Toggle'
import { ToggleSize } from '../Toggle/Toggle'
import { Heading, HeadingSize } from '../Typography'
import { MobileComponentType } from './constants'
import classNames from 'classnames'
import { endOfMonth, startOfMonth } from 'date-fns'
import { useBankTransactionsContext } from '../../contexts/BankTransactionsContext'
import { useBankTransactionsFiltersContext } from '../../contexts/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
import { useDebounce } from '../../hooks/useDebounce/useDebounce'
import { SearchField } from '../SearchField/SearchField'
import { TransactionsActions } from '../domain/transactions/actions/TransactionsActions'
import { HStack } from '../ui/Stack/Stack'
import { useBankTransactionsDownload } from '../../hooks/useBankTransactions/useBankTransactionsDownload'
import InvisibleDownload, { useInvisibleDownload } from '../utility/InvisibleDownload'
import { bankTransactionFiltersToHookOptions } from '../../hooks/useBankTransactions/useAugmentedBankTransactions'
import { BankTransactionsUploadMenu } from './BankTransactionsUploadMenu'
import { BankTransactionsDateFilterMode } from '../../hooks/useBankTransactions/types'
import { useCountSelectedIds, useBulkSelectionActions, useSelectedIds } from '../../providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { BulkActionsHeader } from '../BulkActionsHeader/BulkActionsHeader'
import { useBulkCategorizeBankTransactions } from '../../hooks/useBankTransactions/useBulkCategorizeBankTransactions'
import { Button } from '../ui/Button/Button'

export interface BankTransactionsHeaderProps {
  shiftStickyHeader: number
  asWidget?: boolean
  categorizedOnly?: boolean
  categorizeView?: boolean
  onCategorizationDisplayChange: (event: ChangeEvent<HTMLInputElement>) => void
  mobileComponent?: MobileComponentType
  listView?: boolean
  isDataLoading?: boolean
  isSyncing?: boolean
  stringOverrides?: BankTransactionsHeaderStringOverrides
  withUploadMenu?: boolean
  showStatusToggle?: boolean
  collapseHeader?: boolean
}

export interface BankTransactionsHeaderStringOverrides {
  header?: string
  downloadButton?: string
}

type TransactionsSearchProps = {
  slot?: string
}

function TransactionsSearch({ slot }: TransactionsSearchProps) {
  const { filters, setFilters } = useBankTransactionsFiltersContext()

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
  const { filters } = useBankTransactionsFiltersContext()

  const { invisibleDownloadRef, triggerInvisibleDownload } = useInvisibleDownload()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
  onCategorizationDisplayChange,
  mobileComponent,
  listView,
  stringOverrides,
  isSyncing,
  withUploadMenu,
  showStatusToggle,
  collapseHeader,
}: BankTransactionsHeaderProps) => {
  const { business } = useLayerContext()
  const { display } = useBankTransactionsContext()
  const {
    setFilters,
    filters,
    dateFilterMode,
  } = useBankTransactionsFiltersContext()

  const withDatePicker = dateFilterMode === BankTransactionsDateFilterMode.MonthlyView
  const dateRange = filters?.dateRange
  const setDateRange = useCallback((newRange: DateRange) => {
    setFilters({ dateRange: newRange })
  }, [setFilters])

  const { count } = useCountSelectedIds()
  const { selectedIds } = useSelectedIds()
  const { clearSelection } = useBulkSelectionActions()
  const { trigger: bulkCategorize, isMutating } = useBulkCategorizeBankTransactions()
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedAction, setSelectedAction] = useState<'categorize' | 'uncategorize' | 'match' | null>(null)

  const handleConfirm = useCallback(async () => {
    if (!selectedAction) return

    setIsProcessing(true)
    try {
      switch (selectedAction) {
        case 'categorize': {
          const transactions = Array.from(selectedIds).map(transactionId => ({
            transactionId,
            categorization: {
              type: 'Category' as const,
              category: {
                type: 'StableName' as const,
                stableName: 'MEALS', // TODO: Input category
              },
            },
          }))
          await bulkCategorize({ transactions })
          clearSelection()
          setSelectedAction(null)
          break
        }
        case 'uncategorize': {
          // TODO: Implement bulk uncategorize
          setSelectedAction(null)
          break
        }
        case 'match': {
          // TODO: Implement bulk match
          setSelectedAction(null)
          break
        }
      }
    }
    catch (error) {
      console.error('Bulk action failed:', error)
    }
    finally {
      setIsProcessing(false)
    }
  }, [selectedAction, selectedIds, bulkCategorize, clearSelection])

  const handleClearBulkActions = useCallback(() => {
    setSelectedAction(null)
    clearSelection()
  }, [clearSelection])

  const headerTopRow = useMemo(() => (
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
      {withDatePicker && dateRange
        ? (
          <DeprecatedDatePicker
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
  ), [asWidget, business, dateRange, isSyncing, listView, setDateRange, stringOverrides?.header, withDatePicker])

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
      {!collapseHeader && headerTopRow}

      {count > 0
        ? (
          <BulkActionsHeader
            selectedCount={count}
            slotProps={{
              ClearButton: {
                onClick: handleClearBulkActions,
              },
              ConfirmButton: {
                onClick: () => void handleConfirm(),
                isDisabled: !selectedAction || isMutating || isProcessing,
                label: isMutating || isProcessing ? 'Processing...' : 'Apply',
              },
            }}
            slots={{
              Actions: () => (
                <>
                  <Button
                    variant={selectedAction === 'categorize' ? 'solid' : 'outlined'}
                    onClick={() => setSelectedAction('categorize')}
                    isDisabled={isMutating || isProcessing}
                  >
                    Categorize
                  </Button>
                  <Button
                    variant={selectedAction === 'uncategorize' ? 'solid' : 'outlined'}
                    onClick={() => setSelectedAction('uncategorize')}
                    isDisabled={isMutating || isProcessing}
                  >
                    Uncategorize
                  </Button>
                  <Button
                    variant={selectedAction === 'match' ? 'solid' : 'outlined'}
                    onClick={() => setSelectedAction('match')}
                    isDisabled={isMutating || isProcessing}
                  >
                    Match
                  </Button>
                </>
              ),
            }}
          />
        )
        : (
          <TransactionsActions>
            <HStack slot='toggle' justify='center' gap='xs'>
              {collapseHeader && headerTopRow}
              {!categorizedOnly && categorizeView && showStatusToggle && (
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
              )}
            </HStack>
            <TransactionsSearch slot='search' />
            <HStack slot='download-upload' justify='center' gap='xs'>
              <DownloadButton
                downloadButtonTextOverride={stringOverrides?.downloadButton}
                iconOnly={listView}
              />
              {withUploadMenu && <BankTransactionsUploadMenu />}
            </HStack>
          </TransactionsActions>
        )}
    </Header>
  )
}
