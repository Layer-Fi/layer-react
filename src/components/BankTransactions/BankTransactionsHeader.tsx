import { useCallback, useId, useMemo, useState } from 'react'
import { useLayerContext } from '../../contexts/LayerContext'
import type { DateRange } from '../../types/general'
import { DisplayState } from '../../types/bank_transactions'
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
import { BankTransactionsHeaderMenu } from './BankTransactionsHeaderMenu'
import { useCountSelectedIds, useBulkSelectionActions } from '../../providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { BulkActionsHeader } from '../BulkActionsHeader/BulkActionsHeader'
import { Button } from '../ui/Button/Button'
import { BaseConfirmationModal } from '../BaseConfirmationModal/BaseConfirmationModal'
import { CategoryOption } from '../../types/categoryOption'
import { CategorySelect } from '../CategorySelect/CategorySelect'
import { VStack } from '../ui/Stack/Stack'
import { Label, Span } from '../ui/Typography/Text'
import pluralize from 'pluralize'

export interface BankTransactionsHeaderProps {
  shiftStickyHeader: number
  asWidget?: boolean
  categorizedOnly?: boolean
  categorizeView?: boolean
  mobileComponent?: MobileComponentType
  listView?: boolean
  isDataLoading?: boolean
  isSyncing?: boolean
  stringOverrides?: BankTransactionsHeaderStringOverrides
  withUploadMenu?: boolean
  showStatusToggle?: boolean
  collapseHeader?: boolean
  _showCategorizationRules?: boolean
  _showBulkSelection?: boolean
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
  mobileComponent,
  listView,
  stringOverrides,
  isSyncing,
  withUploadMenu,
  showStatusToggle,
  collapseHeader,
  _showCategorizationRules = false,
  _showBulkSelection = false,
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
  const { clearSelection } = useBulkSelectionActions()

  const [isConfirmAllModalOpen, setIsConfirmAllModalOpen] = useState(false)
  const [isCategorizeAllModalOpen, setIsCategorizeAllModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | undefined>(undefined)

  const categorySelectId = useId()

  const handleConfirmAllClick = useCallback(() => {
    setIsConfirmAllModalOpen(true)
  }, [])

  const handleCategorizeAllClick = useCallback(() => {
    setIsCategorizeAllModalOpen(true)
  }, [])

  const handleCategorizeModalClose = useCallback((isOpen: boolean) => {
    setIsCategorizeAllModalOpen(isOpen)
    if (!isOpen) {
      setSelectedCategory(undefined)
    }
  }, [])

  const BulkActions = useCallback(() => {
    return (
      <HStack align='center' gap='sm'>
        <Button
          variant='outlined'
          onClick={handleConfirmAllClick}
        >
          Confirm all
        </Button>
        <BaseConfirmationModal
          isOpen={isConfirmAllModalOpen}
          onOpenChange={setIsConfirmAllModalOpen}
          title='Confirm all suggestions?'
          content={(
            <Span>
              {`This action will confirm ${count} selected ${pluralize('transaction', count)}.`}
            </Span>
          )}
          onConfirm={() => {}}
          confirmLabel='Confirm All'
          cancelLabel='Cancel'
          closeOnConfirm
        />
        <Button
          variant='outlined'
          onClick={handleCategorizeAllClick}
        >
          Set category
        </Button>
        <BaseConfirmationModal
          isOpen={isCategorizeAllModalOpen}
          onOpenChange={handleCategorizeModalClose}
          title='Categorize all selected transactions?'
          content={(
            <VStack gap='xs'>
              <VStack gap='3xs'>
                <Label htmlFor={categorySelectId}>Select category</Label>
                <CategorySelect
                  name={categorySelectId}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  showTooltips={false}
                  excludeMatches={true}
                />
              </VStack>
              {selectedCategory && (
                <Span>
                  {`This action will categorize ${count} selected transactions as ${selectedCategory?.payload?.display_name}.`}
                </Span>
              )}
            </VStack>
          )}
          onConfirm={() => {}}
          confirmLabel='Categorize All'
          cancelLabel='Cancel'
          confirmDisabled={!selectedCategory}
          closeOnConfirm
        />
      </HStack>
    )
  }, [
    count,
    categorySelectId,
    isConfirmAllModalOpen,
    isCategorizeAllModalOpen,
    selectedCategory,
    handleConfirmAllClick,
    handleCategorizeAllClick,
    handleCategorizeModalClose])

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

  const onCategorizationDisplayChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setFilters({
      categorizationStatus:
        event.target.value === 'categorized' // see DisplayState enum
          ? DisplayState.categorized
          : event.target.value === 'all' // see DisplayState enum
            ? DisplayState.all
            : DisplayState.review,
    })
  }

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

      {_showBulkSelection && count > 0
        ? (
          <BulkActionsHeader
            count={{ showCount: true, totalCount: count }}
            slotProps={{ ClearSelectionButton: { onClick: clearSelection } }}
            slots={{ Actions: BulkActions }}
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
              {_showCategorizationRules
                ? <BankTransactionsHeaderMenu withUploadMenu={withUploadMenu} />
                : withUploadMenu && <BankTransactionsUploadMenu />}
            </HStack>
          </TransactionsActions>
        )}
    </Header>
  )
}
