import { ChangeEvent, useCallback, useState } from 'react'
import { useLayerContext } from '../../contexts/LayerContext'
import { DateRange, DisplayState } from '../../types'
import { getEarliestDateToBrowse } from '../../utils/business'
import { DownloadButton as DownloadButtonComponent } from '../Button'
import { Header } from '../Container'
import { DatePicker } from '../DatePicker'
import { SyncingComponent } from '../SyncingComponent'
import { Toggle } from '../Toggle'
import { ToggleSize } from '../Toggle/Toggle'
import { Heading, HeadingSize } from '../Typography'
import { MobileComponentType } from './constants'
import classNames from 'classnames'
import { endOfMonth, startOfMonth } from 'date-fns'
import { useBankTransactionsContext } from '../../contexts/BankTransactionsContext'
import { useDebounce } from '../../hooks/useDebounce/useDebounce'
import { TransactionsSearchField } from '../domain/transactions/searchField/TransactionsSearchField'
import { TransactionsActions } from '../domain/transactions/actions/TransactionsActions'
import { VStack } from '../ui/Stack/Stack'
import { useBankTransactionsDownload } from '../../hooks/useBankTransactions/useBankTransactionsDownload'
import InvisibleDownload, { useInvisibleDownload } from '../utility/InvisibleDownload'
import { bankTransactionFiltersToHookOptions } from '../../hooks/useBankTransactions/useAugmentedBankTransactions'
import { BankTransactionsUploadMenu } from './BankTransactionsUploadMenu'

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

  const [localSearch, setLocalSearch] = useState(() => filters?.descriptionFilter ?? '')

  const debouncedSetDescription = useDebounce((value: string) => {
    setFilters({ descriptionFilter: value })
  })

  const handleSearch = useCallback((value: string) => {
    setLocalSearch(value)

    void debouncedSetDescription(value)
  }, [debouncedSetDescription])

  return (
    <TransactionsSearchField
      slot={slot}
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
}: BankTransactionsHeaderProps) => {
  const { business } = useLayerContext()

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
      <TransactionsActions withUploadMenu={withUploadMenu}>
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
        <VStack slot='download' justify='center'>
          <DownloadButton
            downloadButtonTextOverride={stringOverrides?.downloadButton}
            iconOnly={listView}
          />
        </VStack>
        {withUploadMenu && (
          <VStack slot='upload' justify='center'>
            <BankTransactionsUploadMenu iconOnly={listView} />
          </VStack>
        )}
      </TransactionsActions>
    </Header>
  )
}
