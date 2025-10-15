import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
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
import { useCountSelectedIds, useBulkSelectionActions } from '../../providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { BulkActionsHeader } from '../BulkActionsHeader/BulkActionsHeader'
import { Button } from '../ui/Button/Button'
import { BulkActionsConfirmationModal } from '../BulkActionsConfirmationModal/BulkActionsConfirmationModal'
import { CategorySelect, CategoryOption } from '../CategorySelect/CategorySelect'
import { VStack } from '../ui/Stack/Stack'
import { Label } from '../ui/Typography/Text'

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
  onCategorizationDisplayChange,
  mobileComponent,
  listView,
  stringOverrides,
  isSyncing,
  withUploadMenu,
  showStatusToggle,
  collapseHeader,
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
  const [isCategorizeModalAllOpen, setIsCategorizeAllModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | undefined>(undefined)

  useEffect(() => {
    if (!isCategorizeModalAllOpen) {
      setSelectedCategory(undefined)
    }
  }, [isCategorizeModalAllOpen])

  const BulkActions = useCallback(() => {
    return (
      <HStack align='center' gap='sm'>
        <Button
          variant='outlined'
          onClick={() => setIsConfirmAllModalOpen(true)}
        >
          Confirm All
        </Button>
        <BulkActionsConfirmationModal
          isOpen={isConfirmAllModalOpen}
          onOpenChange={setIsConfirmAllModalOpen}
          itemCount={count}
          actionLabel='confirm'
          itemLabel='suggestions'
          onConfirm={() => {}}
          confirmLabel='Confirm All'
          cancelLabel='Cancel'
        />
        <Button
          variant='outlined'
          onClick={() => setIsCategorizeAllModalOpen(true)}
        >
          Categorize All
        </Button>
        <BulkActionsConfirmationModal
          isOpen={isCategorizeModalAllOpen}
          onOpenChange={setIsCategorizeAllModalOpen}
          itemCount={count}
          actionLabel='categorize'
          itemLabel='transactions'
          descriptionLabel={` as ${selectedCategory?.payload?.display_name}`}
          onConfirm={() => {}}
          confirmLabel='Categorize All'
          cancelLabel='Cancel'
          confirmDisabled={!selectedCategory}
          hideDescription={!selectedCategory}
        >
          <VStack gap='xs'>
            <Label>Select category</Label>
            <CategorySelect
              name='bulk-category-select'
              value={selectedCategory}
              onChange={setSelectedCategory}
              showTooltips={false}
              excludeMatches={true}
            />
          </VStack>
        </BulkActionsConfirmationModal>
      </HStack>
    )
  }, [count, isConfirmAllModalOpen, isCategorizeModalAllOpen, selectedCategory])

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
              {withUploadMenu && <BankTransactionsUploadMenu />}
            </HStack>
          </TransactionsActions>
        )}
    </Header>
  )
}
