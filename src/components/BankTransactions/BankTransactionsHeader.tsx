import { type Key, useCallback, useMemo } from 'react'
import type { ZonedDateTime } from '@internationalized/date'
import classNames from 'classnames'
import { endOfMonth, startOfMonth } from 'date-fns'
import { useTranslation } from 'react-i18next'

import { DisplayState } from '@internal-types/bankTransactions'
import { BankTransactionsDateFilterMode } from '@utils/bankTransactions/shared'
import { translationKey } from '@utils/i18n/translationKey'
import { convertDateToZonedDateTime } from '@utils/time/timeUtils'
import { useBusinessActivationDate } from '@hooks/features/business/useBusinessActivationDate'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { BankTransactionsFeature, useIsBankTransactionsFeatureEnabled } from '@providers/BankTransactionsFeatureVisibility/BankTransactionsFeatureVisibilityProvider'
import { useCountSelectedIds } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { useBankTransactionsFiltersContext } from '@contexts/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
import { useBankTransactionsIsCategorizationEnabledContext } from '@contexts/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import { useBankTransactionsStringOverrides } from '@contexts/BankTransactionsStringOverridesContext/BankTransactionsStringOverridesContext'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Toggle } from '@ui/Toggle/Toggle'
import { Heading } from '@ui/Typography/Heading'
import { BankTransactionsBulkActions } from '@components/BankTransactions/BankTransactionsBulkActions/BankTransactionsBulkActions'
import { BankTransactionsHeaderMenu, BankTransactionsHeaderMenuActions } from '@components/BankTransactions/BankTransactionsHeaderMenu'
import { BankTransactionsTableContent } from '@components/BankTransactions/constants'
import { RecordTransactionMenuButton } from '@components/BankTransactions/RecordManualTransaction/RecordTransactionMenuButton'
import { SelectedBankAccountsChip } from '@components/BankTransactions/SelectedBankAccountsChip/SelectedBankAccountsChip'
import { TransactionsSearch } from '@components/BankTransactions/TransactionsSearch/TransactionsSearch'
import { BankTransactionsActions } from '@components/BankTransactionsActions/BankTransactionsActions'
import { BulkActionsModule } from '@components/BulkActionsModule/BulkActionsModule'
import { Header } from '@components/Container/Header'
import { MonthPicker } from '@components/MonthPicker/MonthPicker'
import { SyncingComponent } from '@components/SyncingComponent/SyncingComponent'

import './bankTransactionsHeader.scss'

export interface BankTransactionsHeaderProps {
  asWidget?: boolean
  tableContentMode: BankTransactionsTableContent
  isSyncing?: boolean
  collapseHeader?: boolean
}

export interface BankTransactionsHeaderStringOverrides {
  header?: string
  /** @deprecated Download moved into the header menu and no longer supports a custom label. This override is ignored and will be removed. */
  downloadButton?: string
}

const STATUS_TOGGLE_CONFIG = [
  { ...translationKey('bankTransactions:label.to_review', 'To Review'), value: DisplayState.review },
  { ...translationKey('bankTransactions:label.categorized', 'Categorized'), value: DisplayState.categorized },
]

export const BankTransactionsHeader = ({
  tableContentMode,
  isSyncing,
  collapseHeader,
}: BankTransactionsHeaderProps) => {
  const { t } = useTranslation()
  const { bankTransactionsHeader: stringOverrides } = useBankTransactionsStringOverrides()
  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabledContext()
  const withUploadMenu = useIsBankTransactionsFeatureEnabled(BankTransactionsFeature.UploadOptions)
  const showStatusToggle = useIsBankTransactionsFeatureEnabled(BankTransactionsFeature.StatusToggle)
  const showCategorizationRules = useIsBankTransactionsFeatureEnabled(BankTransactionsFeature.CategorizationRules)
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
  const showMonthPicker = withDatePicker && monthPickerDate !== null
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

  const statusToggleOptions = useMemo(
    () => STATUS_TOGGLE_CONFIG.map(opt => ({
      value: opt.value,
      label: t(opt.i18nKey, opt.defaultValue),
    })),
    [t],
  )

  const headerTopRow = useMemo(() => (
    <div className='Layer__bank-transactions__header__content'>
      <HStack align='center' gap='sm'>
        <Heading level={3} size='sm'>
          {stringOverrides?.header || t('common:label.transactions', 'Transactions')}
        </Heading>
        {isSyncing && <SyncingComponent timeSync={5} inProgress hideContent={isListView} />}
        <SelectedBankAccountsChip variant='compact' />
      </HStack>
      {withDatePicker && monthPickerDate && (
        <MonthPicker
          label={t('date:action.select_a_month', 'Select a month')}
          date={monthPickerDate}
          onChange={setDateRange}
          minDate={activationDate ? convertDateToZonedDateTime(activationDate) : null}
          maxDate={convertDateToZonedDateTime(new Date())}
          truncateMonth={sizeClass === 'mobile'}
        />
      )}
    </div>
  ), [
    t,
    activationDate,
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
    if (showCategorizationRules) {
      actions.push(BankTransactionsHeaderMenuActions.ManageCategorizationRules)
    }
    return actions
  }, [withUploadMenu, showCategorizationRules])

  const BulkActions = useCallback(() => {
    return (
      <BankTransactionsBulkActions
        isMobileView={isMobileList}
        slotProps={{
          ConfirmAllModal: {
            label: isMobileList ? t('common:action.confirm_label', 'Confirm') : t('bankTransactions:action.confirm_all', 'Confirm all'),
          },
        }}
      />
    )
  }, [t, isMobileList])

  const isStatusToggleVisible = isCategorizationEnabled && showStatusToggle
  const statusToggle = isStatusToggleVisible
    ? (
      <Toggle
        ariaLabel={t('bankTransactions:label.categorization_status', 'Categorization status')}
        options={statusToggleOptions}
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
              <HStack align='center' gap='xs'>
                <SelectedBankAccountsChip variant='wide' />
                <RecordTransactionMenuButton />
                <BankTransactionsHeaderMenu
                  actions={headerMenuActions}
                  isListView={isListView}
                />
              </HStack>
            </HStack>
          )}

          <HStack className='Layer__bank-transactions__header__search-and-menu' align='center' gap='xs'>
            <TransactionsSearch isDisabled={showBulkActions} />
            {!isStatusToggleVisible && (
              <>
                <SelectedBankAccountsChip variant='wide' />
                <RecordTransactionMenuButton isDisabled={showBulkActions} />
                <BankTransactionsHeaderMenu
                  actions={headerMenuActions}
                  isDisabled={showBulkActions}
                  isListView={isListView}
                />
              </>
            )}
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
    >
      {!collapseHeader && headerTopRow}

      <BankTransactionsActions>
        {showBulkActions
          ? <BulkActionsModule slots={{ BulkActions }} />
          : (
            <HStack slot='toggle' justify='center' align='center' gap={collapseHeader && !showMonthPicker ? 'md' : 'xs'}>
              {collapseHeader && headerTopRow}
              {statusToggle}
            </HStack>
          )}
        <SelectedBankAccountsChip slot='selected-accounts' variant='wide' />
        <TransactionsSearch slot='search' isDisabled={showBulkActions} />
        <HStack slot='download-upload' justify='center' gap='xs'>
          <RecordTransactionMenuButton isDisabled={showBulkActions} />
          <BankTransactionsHeaderMenu
            actions={headerMenuActions}
            isDisabled={showBulkActions}
          />
        </HStack>
      </BankTransactionsActions>
    </Header>
  )
}
