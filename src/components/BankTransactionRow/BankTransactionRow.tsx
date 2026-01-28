import { useCallback, useMemo, useState } from 'react'
import classNames from 'classnames'
import { format as formatTime, parseISO } from 'date-fns'

import { type BankTransaction } from '@internal-types/bank_transactions'
import {
  isCredit,
} from '@utils/bankTransactions'
import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import { useDelayedRemoveBankTransaction } from '@hooks/useBankTransactions/useDelayedRemoveBankTransaction'
import { useSaveBankTransactionRow } from '@hooks/useBankTransactions/useSaveBankTransactionRow'
import { useDelayedVisibility } from '@hooks/visibility/useDelayedVisibility'
import { useBankTransactionsCategoryActions, useGetBankTransactionCategory } from '@providers/BankTransactionsCategoryStore/BankTransactionsCategoryStoreProvider'
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
import {
  type BankTransactionCTAStringOverrides,
} from '@components/BankTransactions/BankTransactions'
import { isCategorized } from '@components/BankTransactions/utils'
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
  dateFormat: string
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
  dateFormat,
  bankTransaction,
  initialLoad,
  showDescriptions,
  showReceiptUploads,
  showReceiptUploadColumn,
  showTooltips,
  stringOverrides,
}: Props) => {
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
  const { setTransactionCategory } = useBankTransactionsCategoryActions()
  const { selectedCategory } = useGetBankTransactionCategory(bankTransaction.id)
  const { saveBankTransactionRow, isProcessing, isError } = useSaveBankTransactionRow()

  const { isBeingRemoved } = useDelayedRemoveBankTransaction({ bankTransaction })

  const displayAsCategorized = isBeingRemoved ? false : categorized

  const save = useCallback(async () => {
    if (open && !isExpandedRowValid) return
    if (!selectedCategory) return

    await saveBankTransactionRow(selectedCategory, bankTransaction)

    // Remove from bulk selection store
    deselect(bankTransaction.id)
    setOpen(false)
  }, [bankTransaction, deselect, isExpandedRowValid, open, saveBankTransactionRow, selectedCategory])

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
      disabled={selectedCategory === null || isBulkSelectionActive}
      action={displayAsCategorized ? SubmitAction.SAVE : SubmitAction.UPDATE}
      withRetry
      error={isError ? 'Approval failed. Check connection and retry in few seconds.' : undefined}
    >
      {isError
        ? 'Retry'
        : displayAsCategorized
          ? stringOverrides?.updateButtonText || 'Update'
          : stringOverrides?.approveButtonText || 'Confirm'}
    </SubmitButton>
  ), [
    displayAsCategorized,
    isBulkSelectionActive,
    isError,
    isProcessing,
    open,
    save,
    selectedCategory,
    stringOverrides?.approveButtonText,
    stringOverrides?.updateButtonText,
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
              {formatTime(parseISO(bankTransaction.date), dateFormat)}
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
                {isError
                  && (
                    <Text
                      as='span'
                      size={TextSize.md}
                      className='Layer__unsaved-info'
                    >
                      <span>Unsaved</span>
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
                    onSelectedValueChange={(selectedCategory: BankTransactionCategoryComboBoxOption | null) => {
                      setTransactionCategory(bankTransaction.id, selectedCategory)
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
              onValidityChange={setIsExpandedRowValid}
            />
          </AnimatedPresenceElement>
        </td>
      </tr>
    </>
  )
}
