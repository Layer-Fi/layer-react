import { useCallback, useMemo, useState } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { applyCategoryChange } from '@utils/bankTransactions/categorization'
import {
  isCategorized,
  isCredit,
} from '@utils/bankTransactions/shared'
import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import { useCategorizationSubmit } from '@hooks/features/bankTransactions/useCategorizationSubmit'
import { useDelayedRemoveBankTransaction } from '@hooks/features/bankTransactions/useDelayedRemoveBankTransaction'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useDelayedVisibility } from '@hooks/utils/visibility/useDelayedVisibility'
import {
  useBankTransactionsCategorizationActions,
  useGetBankTransactionCategorizationByTransactionId,
} from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { useBulkSelectionActions, useCountSelectedIds, useIdIsSelected } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { useBankTransactionsIsCategorizationEnabledContext } from '@contexts/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import AlertCircle from '@icons/AlertCircle'
import ChevronDownFill from '@icons/ChevronDownFill'
import FileIcon from '@icons/File'
import { AnimatedPresenceElement } from '@ui/AnimatedPresenceElement/AnimatedPresenceElement'
import { Checkbox } from '@ui/Checkbox/Checkbox'
import { VStack } from '@ui/Stack/Stack'
import { HStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { BankTransactionCategoryComboBox } from '@components/BankTransactionCategoryComboBox/BankTransactionCategoryComboBox'
import { type BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { BankTransactionErrorText } from '@components/BankTransactions/BankTransactionErrorText'
import {
  type BankTransactionCTAStringOverrides,
} from '@components/BankTransactions/BankTransactions'
import { BankTransactionsProcessingInfo } from '@components/BankTransactionsList/BankTransactionsProcessingInfo'
import { BankTransactionsCategorizedSelectedValue } from '@components/BankTransactionsSelectedValue/BankTransactionsCategorizedSelectedValue'
import { IconButton } from '@components/Button/IconButton'
import { SubmitAction, SubmitButton } from '@components/Button/SubmitButton'
import { ExpandedBankTransactionRow } from '@components/ExpandedBankTransactionRow/ExpandedBankTransactionRow'
import { IconBox } from '@components/IconBox/IconBox'
import { Text, TextSize } from '@components/Typography/Text'

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
  const { selectedCategorization } = useGetBankTransactionCategorizationByTransactionId(bankTransaction.id)

  const { isBeingRemoved } = useDelayedRemoveBankTransaction({ bankTransaction })

  const displayAsCategorized = isBeingRemoved ? false : categorized

  const onSubmitSuccess = useCallback(() => {
    deselect(bankTransaction.id)
    setOpen(false)
  }, [bankTransaction.id, deselect])

  const {
    submit,
    errorMessage: submitErrorMessage,
    isProcessing,
    isError,
  } = useCategorizationSubmit({ bankTransaction, onSuccess: onSubmitSuccess })

  const save = useCallback(async () => {
    await submit()
  }, [submit])

  const selectedCategory = selectedCategorization?.category

  const submitButton = useMemo(() => (
    <SubmitButton
      onClick={() => {
        if (!isProcessing) {
          void save()
        }
      }}
      className={isError ? 'Layer__bank-transaction__retry-btn' : 'Layer__bank-transaction__submit-btn'}
      processing={isProcessing}
      active={open}
      disabled={isBulkSelectionActive}
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
    open,
    save,
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
            <Span>
              {formatDate(bankTransaction.date)}
            </Span>
          </span>
        </td>
        <td
          className='Layer__table-cell Layer__bank-transactions__tx-col'
        >
          <span className='Layer__table-cell-content'>
            <Span withTooltip>
              {bankTransaction.counterparty_name ?? bankTransaction.description}
            </Span>
          </span>
        </td>
        <td
          className='Layer__table-cell Layer__bank-transactions__account-col'
        >
          <span className='Layer__table-cell-content'>
            <VStack align='start'>
              <Span ellipsis>
                {bankTransaction.account_name}
                {bankTransaction.account_mask && ` ${bankTransaction.account_mask}`}
              </Span>
              {bankTransaction.account_institution?.name && (
                <Span ellipsis variant='subtle' size='sm'>
                  {bankTransaction.account_institution.name}
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
          {showReceiptUploads && bankTransaction.document_ids?.length > 0 && (
            <span className='Layer__table-cell-content'>
              <IconBox>
                <FileIcon size={12} />
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
                <BankTransactionErrorText submitErrorMessage={submitErrorMessage} layout='inline' />
                {isError
                  && (
                    <Text
                      as='span'
                      size={TextSize.md}
                      className='Layer__unsaved-info'
                    >
                      <span>{t('common:state.unsaved', 'Unsaved')}</span>
                      <AlertCircle size={12} />
                    </Text>
                  )}
                {isCategorizationEnabled && submitButton}
                {!isCategorizationEnabled && !displayAsCategorized && (
                  <VStack pis='lg' fluid>
                    <BankTransactionsProcessingInfo />
                  </VStack>
                )}
                <IconButton
                  onClick={toggleOpen}
                  className='Layer__bank-transaction-row__expand-button'
                  active={open}
                  icon={(
                    <ChevronDownFill
                      className={`Layer__chevron ${open ? 'Layer__chevron__up' : 'Layer__chevron__down'
                      }`}
                    />
                  )}
                />
              </HStack>
            )
            : (
              <HStack pi='md' gap='md' className='Layer__bank-transaction-row__category-hstack'>
                {isCategorizationEnabled && !displayAsCategorized && (
                  <BankTransactionCategoryComboBox
                    bankTransaction={bankTransaction}
                    selectedValue={selectedCategory ?? null}
                    onSelectedValueChange={(nextCategory: BankTransactionCategoryComboBoxOption | null) => {
                      setTransactionCategorization(
                        bankTransaction.id,
                        applyCategoryChange(selectedCategorization, nextCategory),
                      )
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
                <BankTransactionErrorText submitErrorMessage={submitErrorMessage} layout='inline' />
                {!displayAsCategorized && isCategorizationEnabled && !isBeingRemoved && submitButton}
                {!isCategorizationEnabled && !displayAsCategorized && !isBeingRemoved && (
                  <VStack pis='xs' fluid>
                    <BankTransactionsProcessingInfo />
                  </VStack>
                )}
                {!isBeingRemoved && (
                  <IconButton
                    onClick={toggleOpen}
                    className='Layer__bank-transaction-row__expand-button'
                    active={open}
                    icon={(
                      <ChevronDownFill
                        className={`Layer__chevron ${open ? 'Layer__chevron__up' : 'Layer__chevron__down'
                        }`}
                      />
                    )}
                  />
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
            />
          </AnimatedPresenceElement>
        </td>
      </tr>
    </>
  )
}
