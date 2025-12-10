import { useCallback, useMemo, useState } from 'react'
import type { ZonedDateTime } from '@internationalized/date'
import classNames from 'classnames'
import { endOfMonth, startOfMonth } from 'date-fns'
import type { Key } from 'react-aria-components'

import { DisplayState } from '@internal-types/bank_transactions'
import { convertDateToZonedDateTime } from '@utils/time/timeUtils'
import { useBusinessActivationDate } from '@hooks/business/useBusinessActivationDate'
import { BankTransactionsDateFilterMode } from '@hooks/useBankTransactions/types'
import { bankTransactionFiltersToHookOptions } from '@hooks/useBankTransactions/useAugmentedBankTransactions'
import { useBankTransactionsDownload } from '@hooks/useBankTransactions/useBankTransactionsDownload'
import { useDebounce } from '@hooks/useDebounce/useDebounce'
import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { useCountSelectedIds } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { useBankTransactionsFiltersContext } from '@contexts/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
import { HStack, VStack } from '@ui/Stack/Stack'
import { BankTransactionsBulkActions } from '@components/BankTransactions/BankTransactionsBulkActions/BankTransactionsBulkActions'
import { BankTransactionsHeaderMenu, BankTransactionsHeaderMenuActions } from '@components/BankTransactions/BankTransactionsHeaderMenu'
import { type MobileComponentType } from '@components/BankTransactions/constants'
import { BankTransactionsActions } from '@components/BankTransactionsActions/BankTransactionsActions'
import { BulkActionsModule } from '@components/BulkActionsModule/BulkActionsModule'
import { ButtonVariant } from '@components/Button/Button'
import { DownloadButton as DownloadButtonComponent } from '@components/Button/DownloadButton'
import { Header } from '@components/Container/Header'
import { MonthPicker } from '@components/MonthPicker/MonthPicker'
import { NewToggle } from '@components/NewToggle/NewToggle'
import { SearchField } from '@components/SearchField/SearchField'
import { SyncingComponent } from '@components/SyncingComponent/SyncingComponent'
import { Heading, HeadingSize } from '@components/Typography/Heading'
import InvisibleDownload, { useInvisibleDownload } from '@components/utility/InvisibleDownload'

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
  const isMobileList = listView && mobileComponent === 'mobileList'

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

  const statusToggle = !categorizedOnly && categorizeView && showStatusToggle
    ? (
      <NewToggle
        options={[
          { label: 'To Review', value: DisplayState.review },
          { label: 'Categorized', value: DisplayState.categorized },
        ]}
        selectedKey={display}
        onSelectionChange={onCategorizationDisplayChange}
      />
    )
    : null

  if (isMobileList) {
    return (
      <Header
        className={classNames(
          'Layer__bank-transactions__header',
          withDatePicker && 'Layer__bank-transactions__header--with-date-picker',
          mobileComponent && listView
            ? 'Layer__bank-transactions__header--mobile'
            : undefined,
        )}
      >
        <VStack gap='sm'>
          {headerTopRow}

          <TransactionsSearch isDisabled={showBulkActions} />

          <HStack justify={showBulkActions ? 'end' : 'space-between'} align='center' gap='xs'>
            {showBulkActions
              ? (
                <BulkActionsModule
                  showSelectedCount={false}
                  slots={{ BulkActions: BulkActionsModuleSlot }}
                />
              )
              : statusToggle}
          </HStack>

        </VStack>
      </Header>
    )
  }

  if (listView) {
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
        <VStack gap='xs'>
          {headerTopRow}

          <HStack justify='space-between' align='center' gap='xs'>
            {showBulkActions
              ? (
                <BulkActionsModule
                  slots={{ BulkActions: BulkActionsModuleSlot }}
                />
              )
              : statusToggle}
          </HStack>

          <TransactionsSearch isDisabled={showBulkActions} />

        </VStack>
      </Header>
    )
  }

  else {
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
                slots={{ BulkActions: BulkActionsModuleSlot }}
              />
            )
            : (
              <HStack slot='toggle' justify='center' gap='xs'>
                {collapseHeader && headerTopRow}
                {statusToggle}
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
}
