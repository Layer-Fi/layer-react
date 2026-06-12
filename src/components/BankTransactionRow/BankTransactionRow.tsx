import { useCallback, useMemo, useState } from 'react'
import classNames from 'classnames'
import { CircleAlert, File } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { isCategorized, isCredit } from '@utils/bankTransactions/shared'
import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import { useDelayedRemoveBankTransaction } from '@hooks/features/bankTransactions/useDelayedRemoveBankTransaction'
import { useGetBankTransactionMatchOrCategoryWithDefault } from '@hooks/features/bankTransactions/useGetBankTransactionCategorizationWithDefault'
import { useSaveBankTransactionRow } from '@hooks/features/bankTransactions/useSaveBankTransactionRow'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useDelayedVisibility } from '@hooks/utils/visibility/useDelayedVisibility'
import { useBankTransactionsCategorizationActions } from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { useBulkSelectionActions, useCountSelectedIds, useIdIsSelected } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { useBankTransactionsIsCategorizationEnabledContext } from '@contexts/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import ChevronDownFill from '@icons/ChevronDownFill'
import { AnimatedPresenceElement } from '@ui/AnimatedPresenceElement/AnimatedPresenceElement'
import { Button } from '@ui/Button/Button'
import { SubmitAction, SubmitButton } from '@ui/Button/SubmitButton'
import { Checkbox } from '@ui/Checkbox/Checkbox'
import { VStack } from '@ui/Stack/Stack'
import { HStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { BankTransactionCategoryComboBox } from '@components/BankTransactionCategoryComboBox/BankTransactionCategoryComboBox'
import { type BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import {
  type BankTransactionCTAStringOverrides,
} from '@components/BankTransactions/BankTransactions'
import { BankTransactionsProcessingInfo } from '@components/BankTransactionsList/BankTransactionsProcessingInfo'
import { BankTransactionsCategorizedSelectedValue } from '@components/BankTransactionsSelectedValue/BankTransactionsCategorizedSelectedValue'
import { ExpandedBankTransactionRow } from '@components/ExpandedBankTransactionRow/ExpandedBankTransactionRow'
import { IconBox } from '@components/IconBox/IconBox'

import './bankTransactionRow.scss'

type Props = {
  index: number
  bankTransaction: BankTransaction
  initialLoad?: boolean
  showDescriptions: boolean
  showReceiptUploads: boolean
  showReceiptUploadColumn: boolean
  showTooltips: boolean
  stringOverrides?: BankTransactionCTAStringOverrides
}

export type LastSubmittedForm = 'simple' | 'match' | 'split' | undefined

export const BankTransactionRow = ({
  index,
  bankTransaction,
  initialLoad,
  showDescriptions,
  showReceiptUploads,
  showReceiptUploadColumn,
  showTooltips,
  stringOverrides,
}: Props) => {
  const { t } = useTranslation()
  const { formatDate } = useIntlFormatter()

  const [open, setOpen] = useState(false)
  const [isExpandedRowValid, setIsExpandedRowValid] = useState(true)
  const toggleOpen = useCallback(() => {
    setOpen(!open)
  }, [open])

  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabledContext()

  const categorized = isCategorized(bankTransaction)

  const { isVisible } = useDelayedVisibility({ delay: index * 20, initialVisibility: Boolean(initialLoad) })

  const { select, deselect } = useBulkSelectionActions()
  const isSelected = useIdIsSelected()
  const isTransactionSelected = isSelected(bankTransaction.id)
  const { count: bulkSelectionCount } = useCountSelectedIds()
  const isBulkSelectionActive = bulkSelectionCount > 0
  const { setTransactionCategorization } = useBankTransactionsCategorizationActions()
  const selectedOption = useGetBankTransactionMatchOrCategoryWithDefault(bankTransaction)
  const { saveBankTransactionRow, isProcessing, isError } = useSaveBankTransactionRow()

  const { isBeingRemoved } = useDelayedRemoveBankTransaction({ bankTransaction })

  const displayAsCategorized = isBeingRemoved ? false : categorized

  const onBankTransactionSaveSuccess = useCallback(() => {
    deselect(bankTransaction.id)
    setOpen(false)
  }, [bankTransaction.id, deselect, setOpen])

  const save = useCallback(async () => {
    if (open && !isExpandedRowValid) return
    if (!selectedOption) return

    await saveBankTransactionRow(selectedOption, bankTransaction, {
      onSuccess: onBankTransactionSaveSuccess,
    })
  }, [open, isExpandedRowValid, selectedOption, saveBankTransactionRow, bankTransaction, onBankTransactionSaveSuccess])

  const submitButton = useMemo(() => (
    <SubmitButton
      onClick={() => {
        if (!isProcessing) {
          void save()
        }
      }}
      processing={isProcessing}
      disabled={selectedOption === null || isBulkSelectionActive}
      action={displayAsCategorized ? SubmitAction.SAVE : SubmitAction.UPDATE}
      withRetry
      error={isError ? t('bankTransactions:error.approval_failed_check_connection', 'Approval failed. Check connection and retry in a few seconds.') : undefined}
    >
      {isError
        ? t('common:action.retry_label', 'Retry')
        : displayAsCategorized
          ? stringOverrides?.updateButtonText ?? t('common:action.update_label', 'Update')
          : stringOverrides?.approveButtonText ?? t('common:action.confirm_label', 'Confirm')}
    </SubmitButton>
  ), [
    displayAsCategorized,
    isBulkSelectionActive,
    isError,
    isProcessing,
    save,
    selectedOption,
    stringOverrides?.approveButtonText,
    stringOverrides?.updateButtonText,
    t,
  ])

  const preventRowExpansion = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const className = 'Layer__bank-transaction-row'
  const openClassName = open ? `${className}--expanded` : ''
  const rowClassName = classNames(
    className,
    open ? openClassName : '',
    initialLoad ? 'initial-load' : '',
    isVisible ? 'show' : '',
  )

  const showReceiptDataProperties = useMemo(
    () => toDataProperties({ 'show-receipt-upload-column': showReceiptUploadColumn }),
    [showReceiptUploadColumn],
  )

  const colSpan = isCategorizationEnabled ? 7 : 6

  return (
    <>
      <AnimatedPresenceElement as='tr' variant='fade' isOpen={!isBeingRemoved} motionKey={bankTransaction.id} className={rowClassName} onClick={toggleOpen}>
        {isCategorizationEnabled && (
          <td className='Layer__table-cell Layer__bank-transactions__checkbox-col' onClick={preventRowExpansion}>
            <span className='Layer__table-cell-content'>
              <Checkbox
                isSelected={isTransactionSelected}
                onChange={(selected) => {
                  if (selected) {
                    select(bankTransaction.id)
                  }
                  else {
                    deselect(bankTransaction.id)
                  }
                }}
              />
            </span>
          </td>
        )}
        <td
          className='Layer__table-cell Layer__bank-transaction-table__date-col'
        >
          <span className='Layer__table-cell-content'>
            <Span>{formatDate(bankTransaction.date)}</Span>
          </span>
        </td>
        <td
          className='Layer__table-cell Layer__bank-transactions__tx-col'
        >
          <span className='Layer__table-cell-content'>
            <Span withTooltip>
              {bankTransaction.counterpartyName ?? bankTransaction.description}
            </Span>
          </span>
        </td>
        <td
          className='Layer__table-cell Layer__bank-transactions__account-col'
        >
          <span className='Layer__table-cell-content'>
            <VStack align='start'>
              <Span ellipsis>
                {bankTransaction.accountName}
                {bankTransaction.accountMask && ` ${bankTransaction.accountMask}`}
              </Span>
              {bankTransaction.accountInstitution?.name && (
                <Span ellipsis variant='subtle' size='sm'>
                  {bankTransaction.accountInstitution.name}
                </Span>
              )}
            </VStack>
          </span>
        </td>
        <td
          className={`Layer__table-cell Layer__table-cell__amount-col Layer__bank-transactions__amount-col Layer__table-cell--amount ${className}__table-cell--amount-${isCredit(bankTransaction) ? 'credit' : 'debit'
          }`}
          {...showReceiptDataProperties}
        >
          <VStack align='end'>
            <MoneySpan
              amount={bankTransaction.amount}
              displayPlusSign={isCredit(bankTransaction)}
              className='Layer__table-cell-content'
            />
          </VStack>
        </td>
        <td
          className='Layer__table-cell Layer__bank-transactions__documents-col'
          {...showReceiptDataProperties}
        >
          {showReceiptUploads && bankTransaction.documentIds?.length > 0 && (
            <span className='Layer__table-cell-content'>
              <IconBox>
                <File size={12} />
              </IconBox>
            </span>
          )}
        </td>
        <td
          className={classNames(
            'Layer__table-cell',
            'Layer__table-cell__category-col',
            `${className}__actions-cell`,
            `${className}__actions-cell--${open ? 'open' : 'close'}`,
          )}
          onClick={preventRowExpansion}
        >
          {open
            ? (
              <HStack pie='md' gap='md' justify='end' className='Layer__bank-transaction-row__category-open'>
                {isError
                  && (
                    <Span status='error'>
                      {t('common:state.unsaved', 'Unsaved')}
                      <CircleAlert size={12} />
                    </Span>
                  )}
                {isCategorizationEnabled && submitButton}
                {!isCategorizationEnabled && !displayAsCategorized && (
                  <VStack pis='lg' fluid>
                    <BankTransactionsProcessingInfo />
                  </VStack>
                )}
                <Button
                  variant='ghost'
                  icon
                  onPress={toggleOpen}
                  aria-label={t('common:action.toggle_details', 'Toggle details')}
                >
                  <ChevronDownFill
                    className={`Layer__chevron ${open ? 'Layer__chevron__up' : 'Layer__chevron__down'
                    }`}
                  />
                </Button>
              </HStack>
            )
            : (
              <HStack pi='md' gap='md' className='Layer__bank-transaction-row__category-hstack'>
                {isCategorizationEnabled && !displayAsCategorized && (
                  <BankTransactionCategoryComboBox
                    bankTransaction={bankTransaction}
                    selectedValue={selectedOption}
                    onSelectedValueChange={(selectedCategory: BankTransactionCategoryComboBoxOption | null) => {
                      setTransactionCategorization(bankTransaction.id, selectedCategory)
                    }}
                    isDisabled={isProcessing}
                  />
                )}
                {displayAsCategorized
                  && (
                    <BankTransactionsCategorizedSelectedValue
                      bankTransaction={bankTransaction}
                      className='Layer__bank-transaction-row__category'
                    />
                  )}
                {!displayAsCategorized && isCategorizationEnabled && !isBeingRemoved && submitButton}
                {!isCategorizationEnabled && !displayAsCategorized && !isBeingRemoved && (
                  <VStack pis='xs' fluid>
                    <BankTransactionsProcessingInfo />
                  </VStack>
                )}
                {!isBeingRemoved && (
                  <Button
                    variant='ghost'
                    icon
                    onPress={toggleOpen}
                    aria-label={t('common:action.toggle_details', 'Toggle details')}
                  >
                    <ChevronDownFill
                      className={`Layer__chevron ${open ? 'Layer__chevron__up' : 'Layer__chevron__down'
                      }`}
                    />
                  </Button>
                )}
              </HStack>
            )}
        </td>
      </AnimatedPresenceElement>
      <tr>
        <td colSpan={colSpan} className='Layer__bank-transaction-row__expanded-td'>
          <AnimatedPresenceElement variant='expand' isOpen={open} motionKey={`${bankTransaction.id}--expanded`}>
            <ExpandedBankTransactionRow
              bankTransaction={bankTransaction}
              categorized={displayAsCategorized}
              isOpen={open}
              showDescriptions={showDescriptions}
              showReceiptUploads={showReceiptUploads}
              showTooltips={showTooltips}
              onValidityChange={setIsExpandedRowValid}
            />
          </AnimatedPresenceElement>
        </td>
      </tr>
    </>
  )
}
