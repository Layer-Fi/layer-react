import { useCallback, useMemo, useState } from 'react'
import type { ZonedDateTime } from '@internationalized/date'
import classNames from 'classnames'
import { endOfMonth, startOfMonth } from 'date-fns'
import type { Key } from 'react-aria-components'

import { DisplayState } from '@internal-types/bank_transactions'
import { convertDateToZonedDateTime } from '@utils/time/timeUtils'
import { useBusinessActivationDate } from '@hooks/business/useBusinessActivationDate'
import { BankTransactionsDateFilterMode } from '@hooks/useBankTransactions/types'
import { useDebounce } from '@hooks/useDebounce/useDebounce'
import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { useCountSelectedIds } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { useBankTransactionsFiltersContext } from '@contexts/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
import { HStack, VStack } from '@ui/Stack/Stack'
import { BankTransactionsBulkActions } from '@components/BankTransactions/BankTransactionsBulkActions/BankTransactionsBulkActions'
import { type MobileComponentType } from '@components/BankTransactions/constants'
import { BulkActionsModule } from '@components/BulkActionsModule/BulkActionsModule'
import { Header } from '@components/Container/Header'
import { MonthPicker } from '@components/MonthPicker/MonthPicker'
import { NewToggle } from '@components/NewToggle/NewToggle'
import { SearchField } from '@components/SearchField/SearchField'
import { SyncingComponent } from '@components/SyncingComponent/SyncingComponent'
import { Heading, HeadingSize } from '@components/Typography/Heading'

import type { BankTransactionsHeaderStringOverrides } from './BankTransactionsHeader'

export interface BankTransactionsHeaderListViewProps {
  shiftStickyHeader: number
  asWidget?: boolean
  categorizedOnly?: boolean
  categorizeView?: boolean
  mobileComponent?: MobileComponentType
  isSyncing?: boolean
  stringOverrides?: BankTransactionsHeaderStringOverrides
  showStatusToggle?: boolean
}

function TransactionsSearchListView({ isDisabled }: { isDisabled?: boolean }) {
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
      label='Search transactions'
      value={localSearch}
      onChange={handleSearch}
      isDisabled={isDisabled}
    />
  )
}

export function BankTransactionsHeaderListView({
  shiftStickyHeader,
  asWidget,
  categorizedOnly,
  categorizeView = true,
  mobileComponent,
  isSyncing,
  stringOverrides,
  showStatusToggle,
}: BankTransactionsHeaderListViewProps) {
  const activationDate = useBusinessActivationDate()
  const { display } = useBankTransactionsContext()
  const {
    setFilters,
    filters,
    dateFilterMode,
  } = useBankTransactionsFiltersContext()
  const { value: sizeClass } = useSizeClass()

  const withDatePicker = dateFilterMode === BankTransactionsDateFilterMode.MonthlyView
  const monthPickerDate = filters?.dateRange ? convertDateToZonedDateTime(filters.dateRange.startDate) : null
  const setDateRange = useCallback((newMonth: ZonedDateTime) => {
    const newMonthAsDate = newMonth.toDate()
    setFilters({
      dateRange: {
        startDate: startOfMonth(newMonthAsDate),
        endDate: endOfMonth(newMonthAsDate),
      },
    })
  }, [setFilters])

  const { count } = useCountSelectedIds()
  const showBulkActions = count > 0

  const isMobileList = mobileComponent === 'mobileList'

  const onCategorizationDisplayChange = (value: Key) => {
    setFilters({
      categorizationStatus:
        value === 'categorized'
          ? DisplayState.categorized
          : value === 'all'
            ? DisplayState.all
            : DisplayState.review,
    })
  }

  const headerTopRow = useMemo(() => (
    <div className='Layer__bank-transactions__header__content'>
      <HStack align='center'>
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
            hideContent={true}
          />
        )}
      </HStack>
      {withDatePicker && monthPickerDate && (
        <MonthPicker
          label='Select a month'
          showLabel={false}
          date={monthPickerDate}
          onChange={setDateRange}
          minDate={activationDate ? convertDateToZonedDateTime(activationDate) : null}
          maxDate={convertDateToZonedDateTime(new Date())}
          truncateMonth={sizeClass === 'mobile'}
        />
      )}
    </div>
  ), [
    activationDate,
    asWidget,
    isSyncing,
    monthPickerDate,
    setDateRange,
    stringOverrides?.header,
    withDatePicker,
    sizeClass,
  ])

  const BulkActionsModuleSlot = useCallback(() => {
    return (
      <BankTransactionsBulkActions
        isMobileView={isMobileList}
        slotProps={{
          ConfirmAllModal: {
            label: isMobileList ? 'Confirm' : 'Confirm all',
          },
        }}
      />
    )
  }, [isMobileList])

  return (
    <Header
      className={classNames(
        'Layer__bank-transactions__header',
        'Layer__bank-transactions__header--list-view',
        withDatePicker && 'Layer__bank-transactions__header--with-date-picker',
        mobileComponent && 'Layer__bank-transactions__header--mobile',
      )}
      style={{ top: shiftStickyHeader }}
    >
      <VStack gap='xs'>
        {/* Row 1: headerTopRow + Toggle (or BulkActionsModule) */}
        <HStack justify='space-between' align='center' gap='xs'>
          {headerTopRow}
          {showBulkActions
            ? (
              <BulkActionsModule
                slots={{ BulkActions: BulkActionsModuleSlot }}
              />
            )
            : (
              !categorizedOnly && categorizeView && showStatusToggle && (
                <NewToggle
                  options={[
                    { label: 'To Review', value: DisplayState.review },
                    { label: 'Categorized', value: DisplayState.categorized },
                  ]}
                  selectedKey={display}
                  onSelectionChange={onCategorizationDisplayChange}
                />
              )
            )}
        </HStack>

        {/* Row 2: Search only */}
        <TransactionsSearchListView isDisabled={showBulkActions} />
      </VStack>
    </Header>
  )
}
