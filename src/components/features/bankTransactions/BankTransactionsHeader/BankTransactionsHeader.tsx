import { type Key, useCallback, useMemo } from 'react'
import type { ZonedDateTime } from '@internationalized/date'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { DisplayState } from '@internal-types/features/bankTransactions/bankTransaction'
import { BankTransactionsViewVariant } from '@utils/features/bankTransactions/constants'
import { BankTransactionsDateFilterMode } from '@utils/features/bankTransactions/shared'
import { translationKey } from '@utils/shared/i18n/translationKey'
import { convertDateToZonedDateTime } from '@utils/shared/time/timeUtils'
import { useGlobalDateRangeActions } from '@providers/global/GlobalDateStore/GlobalDateStoreProvider'
import { useCountSelectedIds } from '@providers/common/BulkSelectionStore/BulkSelectionStoreProvider'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useBankTransactionsContext } from '@providers/features/bankTransactions/BankTransactions/BankTransactionsContext'
import { BankTransactionsFeature, useIsBankTransactionsFeatureEnabled } from '@providers/features/bankTransactions/BankTransactionsFeatureVisibility/BankTransactionsFeatureVisibilityProvider'
import { useBankTransactionsFiltersContext } from '@providers/features/bankTransactions/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
import { useBankTransactionsStringOverrides } from '@providers/features/bankTransactions/BankTransactionsStringOverridesContext/BankTransactionsStringOverridesContext'
import { useBankTransactionsIsCategorizationEnabledContext } from '@providers/features/categorization/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import { useBusinessActivationDate } from '@hooks/features/business/useBusinessActivationDate'
import { MonthPicker } from '@ui/DatePickers/MonthPicker/MonthPicker'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Toggle } from '@ui/Toggle/Toggle'
import { Heading } from '@ui/Typography/Heading'
import { BulkActionsModule } from '@blocks/BulkActionsModule/BulkActionsModule'
import { DeprecatedHeader } from '@blocks/Layout/DeprecatedHeader/DeprecatedHeader'
import { BankTransactionsAccountFilterChip } from '@features/bankTransactions/BankTransactionsAccountFilterChip/BankTransactionsAccountFilterChip'
import { BankTransactionsBulkActions } from '@features/bankTransactions/BankTransactionsBulkActions/BankTransactionsBulkActions'
import { BankTransactionsHeaderActions } from '@features/bankTransactions/BankTransactionsHeader/BankTransactionsHeaderActions'
import { BankTransactionsHeaderMenu, BankTransactionsHeaderMenuActions } from '@features/bankTransactions/BankTransactionsHeader/BankTransactionsHeaderMenu'
import { BankTransactionsSearchField } from '@features/bankTransactions/BankTransactionsSearchField/BankTransactionsSearchField'
import { BankTransactionsSyncingStatus } from '@features/bankTransactions/BankTransactionsSyncingStatus/BankTransactionsSyncingStatus'
import { RecordBankTransactionMenuButton } from '@features/bankTransactions/RecordBankTransactionMenuButton/RecordBankTransactionMenuButton'

import './bankTransactionsHeader.scss'

export interface BankTransactionsHeaderProps {
  asWidget?: boolean
  tableContentMode: BankTransactionsViewVariant
  isSyncing?: boolean
  collapseHeader?: boolean
}

const STATUS_TOGGLE_CONFIG = [
  { ...translationKey('bankTransactions:BankTransactionsHeader.label.to_review', 'To Review'), value: DisplayState.review },
  { ...translationKey('bankTransactions:BankTransactionsHeader.label.categorized', 'Categorized'), value: DisplayState.categorized },
]

export const BankTransactionsHeader = ({
  tableContentMode,
  isSyncing,
  collapseHeader,
}: BankTransactionsHeaderProps) => {
  const { t } = useTranslation()
  const { bankTransactionsHeader: stringOverrides } = useBankTransactionsStringOverrides()
  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabledContext()
  const showUploadOptions = useIsBankTransactionsFeatureEnabled(BankTransactionsFeature.UploadOptions)
  const canRecordTransactions = showUploadOptions && isCategorizationEnabled
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
  const { setMonth } = useGlobalDateRangeActions()
  const setDateRange = useCallback((newMonth: ZonedDateTime) => {
    setMonth({ startDate: newMonth.toDate() })
  }, [setMonth])

  const { count } = useCountSelectedIds()

  const showBulkActions = count > 0
  const isMobileList = tableContentMode === BankTransactionsViewVariant.MobileList
  const isListView = isMobileList || tableContentMode === BankTransactionsViewVariant.List

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
        {isSyncing && <BankTransactionsSyncingStatus timeSync={5} inProgress hideContent={isListView} />}
        <BankTransactionsAccountFilterChip variant='compact' />
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
    if (showUploadOptions) {
      actions.push(BankTransactionsHeaderMenuActions.BankTransactionsUploadWizard)
    }
    if (showCategorizationRules) {
      actions.push(BankTransactionsHeaderMenuActions.ManageCategorizationRules)
    }
    return actions
  }, [showUploadOptions, showCategorizationRules])

  const BulkActions = useCallback(() => {
    return (
      <BankTransactionsBulkActions
        isMobileView={isMobileList}
        slotProps={{
          ConfirmAllModal: {
            label: isMobileList ? t('common:action.confirm_label', 'Confirm') : t('bankTransactions:BankTransactionsHeader.action.confirm_all', 'Confirm all'),
          },
        }}
      />
    )
  }, [t, isMobileList])

  const isStatusToggleVisible = isCategorizationEnabled && showStatusToggle
  const statusToggle = isStatusToggleVisible
    ? (
      <Toggle
        ariaLabel={t('bankTransactions:BankTransactionsHeader.label.categorization_status', 'Categorization status')}
        options={statusToggleOptions}
        selectedKey={display}
        onSelectionChange={onCategorizationDisplayChange}
        fullWidth={isMobileList}
      />
    )
    : null

  if (isListView) {
    return (
      <DeprecatedHeader
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
                <BankTransactionsAccountFilterChip variant='wide' />
                {canRecordTransactions && <RecordBankTransactionMenuButton />}
                <BankTransactionsHeaderMenu
                  actions={headerMenuActions}
                  isListView={isListView}
                />
              </HStack>
            </HStack>
          )}

          <HStack className='Layer__bank-transactions__header__search-and-menu' align='center' gap='xs'>
            <BankTransactionsSearchField isDisabled={showBulkActions} />
            {!isStatusToggleVisible && (
              <>
                <BankTransactionsAccountFilterChip variant='wide' />
                {canRecordTransactions && <RecordBankTransactionMenuButton isDisabled={showBulkActions} />}
                <BankTransactionsHeaderMenu
                  actions={headerMenuActions}
                  isDisabled={showBulkActions}
                  isListView={isListView}
                />
              </>
            )}
          </HStack>

        </VStack>
      </DeprecatedHeader>
    )
  }

  return (
    <DeprecatedHeader
      className={classNames(
        'Layer__bank-transactions__header',
        withDatePicker && 'Layer__bank-transactions__header--with-date-picker',
      )}
    >
      {!collapseHeader && headerTopRow}

      <BankTransactionsHeaderActions>
        {showBulkActions
          ? <BulkActionsModule slots={{ BulkActions }} />
          : (
            <HStack slot='toggle' justify='center' align='center' gap={collapseHeader && !showMonthPicker ? 'md' : 'xs'}>
              {collapseHeader && headerTopRow}
              {statusToggle}
            </HStack>
          )}
        <BankTransactionsAccountFilterChip slot='selected-accounts' variant='wide' />
        <BankTransactionsSearchField slot='search' isDisabled={showBulkActions} />
        <HStack slot='download-upload' justify='center' gap='xs'>
          {canRecordTransactions && <RecordBankTransactionMenuButton isDisabled={showBulkActions} />}
          <BankTransactionsHeaderMenu
            actions={headerMenuActions}
            isDisabled={showBulkActions}
          />
        </HStack>
      </BankTransactionsHeaderActions>
    </DeprecatedHeader>
  )
}
