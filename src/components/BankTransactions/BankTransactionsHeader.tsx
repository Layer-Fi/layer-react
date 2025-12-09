import { type ReactNode, useCallback, useMemo, useState } from 'react'
import type { ZonedDateTime } from '@internationalized/date'
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
import { HStack } from '@ui/Stack/Stack'
import { BankTransactionsBulkActions } from '@components/BankTransactions/BankTransactionsBulkActions/BankTransactionsBulkActions'
import { type MobileComponentType } from '@components/BankTransactions/constants'
import { BulkActionsModule } from '@components/BulkActionsModule/BulkActionsModule'
import { MonthPicker } from '@components/MonthPicker/MonthPicker'
import { NewToggle } from '@components/NewToggle/NewToggle'
import { SearchField } from '@components/SearchField/SearchField'
import { SyncingComponent } from '@components/SyncingComponent/SyncingComponent'
import { Heading, HeadingSize } from '@components/Typography/Heading'

import { BankTransactionsHeaderListView } from './BankTransactionsHeaderListView'
import { BankTransactionsHeaderTableView } from './BankTransactionsHeaderTableView'

export interface BankTransactionsHeaderProps {
  shiftStickyHeader: number
  asWidget?: boolean
  categorizedOnly?: boolean
  categorizeView?: boolean
  mobileComponent?: MobileComponentType
  listView?: boolean
  isSyncing?: boolean
  stringOverrides?: BankTransactionsHeaderStringOverrides
  withUploadMenu?: boolean
  showStatusToggle?: boolean
  collapseHeader?: boolean
  showCategorizationRules?: boolean
}

export interface BankTransactionsHeaderStringOverrides {
  header?: string
  downloadButton?: string
}

export interface BankTransactionsHeaderSharedProps {
  shiftStickyHeader: number
  withDatePicker: boolean
  mobileComponent?: MobileComponentType
  listView?: boolean
  showBulkActions: boolean
  headerTopRow: ReactNode
  statusToggle: ReactNode
  bulkActionsModule: ReactNode
  transactionsSearch: ReactNode
}

export interface BankTransactionsHeaderTableViewExtraProps {
  stringOverrides?: BankTransactionsHeaderStringOverrides
  withUploadMenu?: boolean
  showCategorizationRules?: boolean
  collapseHeader?: boolean
}

type TransactionsSearchProps = {
  slot?: string
  isDisabled?: boolean
}

export function TransactionsSearch({ slot, isDisabled }: TransactionsSearchProps) {
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
      isDisabled={isDisabled}
    />
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
  showCategorizationRules = false,
}: BankTransactionsHeaderProps) => {
  const activationDate = useBusinessActivationDate()
  const { display } = useBankTransactionsContext()
  const {
    setFilters,
    filters,
    dateFilterMode,
  } = useBankTransactionsFiltersContext()
  const { value: sizeClass } = useSizeClass()
  const { count } = useCountSelectedIds()

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

  const showBulkActions = count > 0
  const isMobileList = listView && mobileComponent === 'mobileList'

  const onCategorizationDisplayChange = useCallback((value: Key) => {
    setFilters({
      categorizationStatus:
        value === 'categorized'
          ? DisplayState.categorized
          : value === 'all'
            ? DisplayState.all
            : DisplayState.review,
    })
  }, [setFilters])

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
            hideContent={listView}
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
    listView,
    monthPickerDate,
    setDateRange,
    stringOverrides?.header,
    withDatePicker,
    sizeClass,
  ])

  const statusToggle = useMemo(() => {
    if (categorizedOnly || !categorizeView || !showStatusToggle) {
      return null
    }
    return (
      <NewToggle
        options={[
          { label: 'To Review', value: DisplayState.review },
          { label: 'Categorized', value: DisplayState.categorized },
        ]}
        selectedKey={display}
        onSelectionChange={onCategorizationDisplayChange}
      />
    )
  }, [categorizedOnly, categorizeView, showStatusToggle, display, onCategorizationDisplayChange])

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

  const bulkActionsModule = useMemo(() => (
    <BulkActionsModule
      slots={{ BulkActions: BulkActionsModuleSlot }}
    />
  ), [BulkActionsModuleSlot])

  const transactionsSearch = useMemo(() => (
    <TransactionsSearch isDisabled={showBulkActions} />
  ), [showBulkActions])

  const sharedProps: BankTransactionsHeaderSharedProps = {
    shiftStickyHeader,
    withDatePicker,
    mobileComponent,
    listView,
    showBulkActions,
    headerTopRow,
    statusToggle,
    bulkActionsModule,
    transactionsSearch,
  }

  if (listView) {
    return (
      <BankTransactionsHeaderListView
        {...sharedProps}
      />
    )
  }

  return (
    <BankTransactionsHeaderTableView
      {...sharedProps}
      stringOverrides={stringOverrides}
      withUploadMenu={withUploadMenu}
      showCategorizationRules={showCategorizationRules}
      collapseHeader={collapseHeader}
    />
  )
}
