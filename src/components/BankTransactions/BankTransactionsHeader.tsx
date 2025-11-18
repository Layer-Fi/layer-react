import { Heading, HeadingSize } from '@components/Typography/Heading'
import { DownloadButton as DownloadButtonComponent } from '@components/Button/DownloadButton'
import { ButtonVariant } from '@components/Button/Button'
import { useCallback, useMemo, useState } from 'react'
import { DisplayState } from '@internal-types/bank_transactions'
import { Header } from '@components/Container/Header'
import { SyncingComponent } from '@components/SyncingComponent/SyncingComponent'
import { Toggle, ToggleSize } from '@components/Toggle/Toggle'
import { MobileComponentType } from '@components/BankTransactions/constants'
import classNames from 'classnames'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { useBankTransactionsFiltersContext } from '@contexts/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
import { useDebounce } from '@hooks/useDebounce/useDebounce'
import { SearchField } from '@components/SearchField/SearchField'
import { BankTransactionsActions } from '@components/BankTransactionsActions/BankTransactionsActions'
import { HStack } from '@ui/Stack/Stack'
import { useBankTransactionsDownload } from '@hooks/useBankTransactions/useBankTransactionsDownload'
import InvisibleDownload, { useInvisibleDownload } from '@components/utility/InvisibleDownload'
import { bankTransactionFiltersToHookOptions } from '@hooks/useBankTransactions/useAugmentedBankTransactions'
import { BankTransactionsDateFilterMode } from '@hooks/useBankTransactions/types'
import { BankTransactionsHeaderMenu, BankTransactionsHeaderMenuActions } from '@components/BankTransactions/BankTransactionsHeaderMenu'
import { useCountSelectedIds } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { BulkActionsModule } from '@components/BulkActionsModule/BulkActionsModule'
import { BankTransactionsBulkActions } from '@components/BankTransactions/BankTransactionsBulkActions/BankTransactionsBulkActions'
import { MonthPicker } from '@components/MonthPicker/MonthPicker'
import { convertDateToZonedDateTime } from '@utils/time/timeUtils'
import type { ZonedDateTime } from '@internationalized/date'
import { endOfMonth, startOfMonth } from 'date-fns'
import { useBusinessActivationDate } from '@hooks/business/useBusinessActivationDate'

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
  showCategorizationRules?: boolean
}

export interface BankTransactionsHeaderStringOverrides {
  header?: string
  downloadButton?: string
}

type TransactionsSearchProps = {
  slot?: string
  isDisabled?: boolean
}

function TransactionsSearch({ slot, isDisabled }: TransactionsSearchProps) {
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

const DownloadButton = ({
  downloadButtonTextOverride,
  iconOnly,
  disabled,
}: {
  downloadButtonTextOverride?: string
  iconOnly?: boolean
  disabled?: boolean
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
        disabled={disabled}
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
  showCategorizationRules = false,

}: BankTransactionsHeaderProps) => {
  const activationDate = useBusinessActivationDate()
  const { display } = useBankTransactionsContext()
  const {
    setFilters,
    filters,
    dateFilterMode,
  } = useBankTransactionsFiltersContext()

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
      {withDatePicker && monthPickerDate && (
        <MonthPicker
          label='Select a month'
          showLabel={false}
          date={monthPickerDate}
          onChange={setDateRange}
          minDate={activationDate ? convertDateToZonedDateTime(activationDate) : null}
          maxDate={convertDateToZonedDateTime(new Date())}
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
  ])

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

  const headerMenuActions = useMemo(() => {
    const actions: BankTransactionsHeaderMenuActions[] = []
    if (withUploadMenu) {
      actions.push(BankTransactionsHeaderMenuActions.UploadTransactions)
    }
    if (showCategorizationRules) {
      actions.push(BankTransactionsHeaderMenuActions.ManageCategorizationRules)
    }
    return actions
  }, [withUploadMenu, showCategorizationRules])

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

      <BankTransactionsActions>
        {showBulkActions
          ? (
            <BulkActionsModule
              slots={{ BulkActions: BankTransactionsBulkActions }}
            />
          )
          : (
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
          )}
        <TransactionsSearch slot='search' isDisabled={showBulkActions} />
        <HStack slot='download-upload' justify='center' gap='xs'>
          <DownloadButton
            downloadButtonTextOverride={stringOverrides?.downloadButton}
            iconOnly={listView}
            disabled={showBulkActions}
          />
          <BankTransactionsHeaderMenu actions={headerMenuActions} isDisabled={showBulkActions} />
        </HStack>
      </BankTransactionsActions>
    </Header>
  )
}
