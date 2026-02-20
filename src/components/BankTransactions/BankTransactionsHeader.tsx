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
import { useBankTransactionsIsCategorizationEnabledContext } from '@contexts/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Toggle } from '@ui/Toggle/Toggle'
import { BankTransactionsBulkActions } from '@components/BankTransactions/BankTransactionsBulkActions/BankTransactionsBulkActions'
import { BankTransactionsHeaderMenu, BankTransactionsHeaderMenuActions } from '@components/BankTransactions/BankTransactionsHeaderMenu'
import { BankTransactionsTableContent } from '@components/BankTransactions/constants'
import { BankTransactionsActions } from '@components/BankTransactionsActions/BankTransactionsActions'
import { BulkActionsModule } from '@components/BulkActionsModule/BulkActionsModule'
import { ButtonVariant } from '@components/Button/Button'
import { DownloadButton as DownloadButtonComponent } from '@components/Button/DownloadButton'
import { Header } from '@components/Container/Header'
import { MonthPicker } from '@components/MonthPicker/MonthPicker'
import { SearchField } from '@components/SearchField/SearchField'
import { SyncingComponent } from '@components/SyncingComponent/SyncingComponent'
import { Heading, HeadingSize } from '@components/Typography/Heading'
import InvisibleDownload, { useInvisibleDownload } from '@components/utility/InvisibleDownload'

export interface BankTransactionsHeaderProps {
  shiftStickyHeader: number
  asWidget?: boolean
  tableContentMode: BankTransactionsTableContent
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

type InvisibleDownloadHandle = {
  trigger: (options: { url: string, filename?: string }) => Promise<void>
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
  handleDownload,
  invisibleDownloadRef,
}: {
  downloadButtonTextOverride?: string
  iconOnly?: boolean
  disabled?: boolean
  handleDownload?: () => void
  error?: boolean
  invisibleDownloadRef?: React.RefObject<InvisibleDownloadHandle>
}) => {
  const { isMutating } = useBankTransactionsDownload()

  return (
    <>
      <DownloadButtonComponent
        variant={ButtonVariant.secondary}
        iconOnly={iconOnly}
        onClick={handleDownload}
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
  tableContentMode,
  stringOverrides,
  isSyncing,
  withUploadMenu,
  showStatusToggle,
  collapseHeader,
  showCategorizationRules = false,
}: BankTransactionsHeaderProps) => {
  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabledContext()
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
  const isMobileList = tableContentMode === BankTransactionsTableContent.MobileList
  const isListView = isMobileList || tableContentMode === BankTransactionsTableContent.List

  const { addToast } = useLayerContext()

  const { invisibleDownloadRef, triggerInvisibleDownload } = useInvisibleDownload()

  const { trigger, error } = useBankTransactionsDownload()

  const handleDownloadTransactions = useCallback(() => {
    if (isListView) {
      return void trigger(bankTransactionFiltersToHookOptions(filters))
        .then((result) => {
          if (result?.presignedUrl) {
            triggerInvisibleDownload({ url: result.presignedUrl })
          }
          else {
            addToast({
              content: 'Download Failed, Please Retry',
              type: 'error',
            })
          }
        })
        .catch(() => {
          addToast({ content: 'Download Failed, Please Retry', type: 'error' })
        })
    }
    else {
      return void trigger(bankTransactionFiltersToHookOptions(filters)).then(
        (result) => {
          if (result?.presignedUrl) {
            triggerInvisibleDownload({ url: result.presignedUrl })
          }
        },
      )
    }
  }, [addToast, filters, isListView, trigger, triggerInvisibleDownload])
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
            hideContent={isListView}
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
    isListView,
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
    if (isListView) {
      actions.push(BankTransactionsHeaderMenuActions.DownloadTransactions)
    }
    if (showCategorizationRules) {
      actions.push(BankTransactionsHeaderMenuActions.ManageCategorizationRules)
    }
    return actions
  }, [withUploadMenu, isListView, showCategorizationRules])

  const BulkActions = useCallback(() => {
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

  const isStatusToggleVisible = isCategorizationEnabled && showStatusToggle
  const statusToggle = isStatusToggleVisible
    ? (
      <Toggle
        ariaLabel='Categorization status'
        options={[
          { label: 'To Review', value: DisplayState.review },
          { label: 'Categorized', value: DisplayState.categorized },
        ]}
        selectedKey={display}
        onSelectionChange={onCategorizationDisplayChange}
        fullWidth={isMobileList}
      />
    )
    : null

  if (isListView) {
    return (
      <Header
        className={classNames(
          'Layer__bank-transactions__header',
          withDatePicker && 'Layer__bank-transactions__header--with-date-picker',
          isMobileList && 'Layer__bank-transactions__header--mobile',
        )}
        style={{ top: shiftStickyHeader }}
      >
        <VStack gap='xs'>
          {headerTopRow}

          {showBulkActions && (
            <BulkActionsModule
              showSelectedLabel={!isMobileList}
              fullWidth={isMobileList}
              slots={{ BulkActions }}
            />
          )}
          {!showBulkActions && isStatusToggleVisible && (
            <HStack justify='space-between' align='center' gap='xs'>
              {statusToggle}
              <BankTransactionsHeaderMenu
                actions={headerMenuActions}
                handleDownloadTransactions={handleDownloadTransactions}
                invisibleDownloadRef={invisibleDownloadRef}
              />
            </HStack>
          )}

          <HStack className='Layer__bank-transactions__header__search-and-menu' align='center' gap='xs'>
            <TransactionsSearch isDisabled={showBulkActions} />
            {!isStatusToggleVisible && <BankTransactionsHeaderMenu actions={headerMenuActions} isDisabled={showBulkActions} />}
          </HStack>

        </VStack>
      </Header>
    )
  }

  return (
    <Header
      className={classNames(
        'Layer__bank-transactions__header',
        withDatePicker && 'Layer__bank-transactions__header--with-date-picker',
      )}
      style={{ top: shiftStickyHeader }}
    >
      {!collapseHeader && headerTopRow}

      <BankTransactionsActions>
        {showBulkActions
          ? <BulkActionsModule slots={{ BulkActions }} />
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
            iconOnly={isListView}
            disabled={showBulkActions}
            handleDownload={handleDownloadTransactions}
            error={error}
            invisibleDownloadRef={invisibleDownloadRef}
          />
          <BankTransactionsHeaderMenu actions={headerMenuActions} isDisabled={showBulkActions} />
        </HStack>
      </BankTransactionsActions>
    </Header>
  )
}
