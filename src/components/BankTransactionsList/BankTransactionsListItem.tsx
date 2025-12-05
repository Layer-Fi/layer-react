import { useCallback, useEffect, useState } from 'react'
import classNames from 'classnames'
import { format as formatTime, parseISO } from 'date-fns'

import { type BankTransaction } from '@internal-types/bank_transactions'
import {
  hasReceipts,
  isCredit,
} from '@utils/bankTransactions'
import { isCategorizationEnabledForStatus } from '@utils/bookkeeping/isCategorizationEnabled'
import { useEffectiveBookkeepingStatus } from '@hooks/bookkeeping/useBookkeepingStatus'
import { useSaveBankTransactionRow } from '@hooks/useBankTransactions/useSaveBankTransactionRow'
import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { useDelayedVisibility } from '@hooks/visibility/useDelayedVisibility'
import { useBankTransactionsCategoryActions, useGetBankTransactionCategory } from '@providers/BankTransactionsCategoryStore/BankTransactionsCategoryStoreProvider'
import { useBulkSelectionActions, useIdIsSelected } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import ChevronDownFill from '@icons/ChevronDownFill'
import FileIcon from '@icons/File'
import { AnimatedPresenceDiv } from '@ui/AnimatedPresenceDiv/AnimatedPresenceDiv'
import { Checkbox } from '@ui/Checkbox/Checkbox'
import { HStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { BankTransactionCategoryComboBox } from '@components/BankTransactionCategoryComboBox/BankTransactionCategoryComboBox'
import { type BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import {
  type BankTransactionCTAStringOverrides,
} from '@components/BankTransactions/BankTransactions'
import { BankTransactionsListItemCategory } from '@components/BankTransactions/BankTransactionsListItemCategory/BankTransactionsListItemCategory'
import { isCategorized } from '@components/BankTransactions/utils'
import { BankTransactionsProcessingInfo } from '@components/BankTransactionsList/BankTransactionsProcessingInfo'
import { SubmitAction, SubmitButton } from '@components/Button/SubmitButton'
import { ExpandedBankTransactionRow } from '@components/ExpandedBankTransactionRow/ExpandedBankTransactionRow'
import { ErrorText } from '@components/Typography/ErrorText'

type BankTransactionsListItemProps = {
  index: number
  dateFormat: string
  bankTransaction: BankTransaction
  editable: boolean
  removeTransaction: (bt: BankTransaction) => void
  stringOverrides?: BankTransactionCTAStringOverrides

  showDescriptions: boolean
  showReceiptUploads: boolean
  showTooltips: boolean
}

export const BankTransactionsListItem = ({
  index,
  dateFormat,
  bankTransaction,
  editable,
  removeTransaction,
  stringOverrides,

  showDescriptions,
  showReceiptUploads,
  showTooltips,
}: BankTransactionsListItemProps) => {
  const { shouldHideAfterCategorize } = useBankTransactionsContext()
  const { saveBankTransactionRow, isProcessing, isError } = useSaveBankTransactionRow()
  const [openExpandedRow, setOpenExpandedRow] = useState(false)
  const [isExpandedRowValid, setIsExpandedRowValid] = useState(true)
  const toggleExpandedRow = () => {
    setOpenExpandedRow(!openExpandedRow)
  }

  const { isDesktop } = useSizeClass()

  const bookkeepingStatus = useEffectiveBookkeepingStatus()
  const categorizationEnabled = isCategorizationEnabledForStatus(bookkeepingStatus)

  const categorized = isCategorized(bankTransaction)

  const isBeingRemoved = bankTransaction.recently_categorized && shouldHideAfterCategorize()
  // Keep showing as uncategorized during removal animation to prevent UI flashing
  const displayAsCategorized = isBeingRemoved
    ? false
    : categorized

  const { isVisible } = useDelayedVisibility({ delay: index * 80 })

  const { select, deselect } = useBulkSelectionActions()
  const isSelected = useIdIsSelected()
  const isTransactionSelected = isSelected(bankTransaction.id)
  const { setTransactionCategory } = useBankTransactionsCategoryActions()
  const { selectedCategory } = useGetBankTransactionCategory(bankTransaction.id)

  useEffect(() => {
    if (editable && isBeingRemoved) {
      setTimeout(() => {
        removeTransaction(bankTransaction)
      }, 300)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankTransaction.recently_categorized])

  const save = useCallback(async () => {
    if (openExpandedRow && !isExpandedRowValid) return
    if (!selectedCategory) return

    await saveBankTransactionRow(selectedCategory, bankTransaction)

    // Remove from bulk selection store
    deselect(bankTransaction.id)
    setOpenExpandedRow(false)
  }, [bankTransaction, deselect, isExpandedRowValid, openExpandedRow, saveBankTransactionRow, selectedCategory])

  const preventRowExpansion = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const openClassName = openExpandedRow ? 'Layer__bank-transaction-list-item--expanded' : ''
  const rowClassName = classNames(
    'Layer__bank-transaction-list-item',
    editable && isBeingRemoved
      ? 'Layer__bank-transaction-row--removing'
      : '',
    openExpandedRow ? openClassName : '',
    isVisible ? 'show' : '',
  )

  return (
    <li className={rowClassName} onClick={toggleExpandedRow}>
      <span className='Layer__bank-transaction-list-item__heading'>
        <div className='Layer__bank-transaction-list-item__heading__main'>
          <Span ellipsis size='sm'>
            {formatTime(parseISO(bankTransaction.date), dateFormat)}
          </Span>

          <span className='Layer__bank-transaction-list-item__heading-separator' />

          {bankTransaction.account_institution?.name && (
            <Span ellipsis size='sm'>
              {`${bankTransaction.account_institution.name} — `}
            </Span>
          )}

          <Span ellipsis size='sm'>
            {bankTransaction.account_name}
            {bankTransaction.account_mask && ` ${bankTransaction.account_mask}`}
          </Span>

          {hasReceipts(bankTransaction) ? <FileIcon size={12} /> : null}

        </div>
        <div
          onClick={toggleExpandedRow}
          className={classNames(
            'Layer__bank-transaction-row__expand-button',
            !isDesktop && 'Layer__bank-transaction-row__expand-button--mobile',
          )}
        >
          <ChevronDownFill
            className={`Layer__chevron ${
              openExpandedRow ? 'Layer__chevron__up' : 'Layer__chevron__down'
            }`}
          />
        </div>
      </span>
      <HStack className='Layer__bank-transaction-list-item__body'>
        <HStack gap='sm' className='Layer__bank-transaction-list-item__body__name'>
          {categorizationEnabled && (
            <div className='Layer__bank-transaction-list-item__checkbox' onClick={preventRowExpansion}>
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
            </div>
          )}
          <Span withTooltip>
            {bankTransaction.counterparty_name ?? bankTransaction.description}
          </Span>
        </HStack>
        <MoneySpan
          amount={bankTransaction.amount}
          displayPlusSign={isCredit(bankTransaction)}
          size='md'
        />
      </HStack>
      {!categorizationEnabled && !displayAsCategorized
        && (
          <span className='Layer__bank-transaction-list-item__processing-info'>
            <BankTransactionsProcessingInfo />
          </span>
        )}
      <span className='Layer__bank-transaction-list-item__expanded-row' onClick={preventRowExpansion}>
        <AnimatedPresenceDiv variant='expand' isOpen={openExpandedRow} key={`expanded-${bankTransaction.id}`}>
          <ExpandedBankTransactionRow
            bankTransaction={bankTransaction}
            isOpen={openExpandedRow}
            categorized={displayAsCategorized}
            asListItem={true}
            submitBtnText={
              displayAsCategorized
                ? stringOverrides?.updateButtonText || 'Update'
                : stringOverrides?.approveButtonText || 'Approve'
            }

            showDescriptions={showDescriptions}
            showReceiptUploads={showReceiptUploads}
            showTooltips={showTooltips}

            variant='list'
            onValidityChange={setIsExpandedRowValid}
          />
        </AnimatedPresenceDiv>
      </span>
      {categorizationEnabled && !displayAsCategorized && (
        <div onClick={preventRowExpansion}>
          <HStack pi='md' gap='md' pb='md' justify='end'>
            {!openExpandedRow && (
              <BankTransactionCategoryComboBox
                bankTransaction={bankTransaction}
                selectedValue={selectedCategory ?? null}
                onSelectedValueChange={(selectedCategory: BankTransactionCategoryComboBoxOption | null) => {
                  setTransactionCategory(bankTransaction.id, selectedCategory)
                }}
                isDisabled={isProcessing}
              />
            )}
            <SubmitButton
              disabled={isProcessing}
              onClick={() => { void save() }}
              className={isError ? 'Layer__bank-transaction__retry-btn' : 'Layer__bank-transaction__submit-btn'}
              processing={isProcessing}
              action={!displayAsCategorized ? SubmitAction.SAVE : SubmitAction.UPDATE}
              withRetry
              error={isError ? 'Approval failed. Check connection and retry in few seconds.' : undefined}
            >
              {isError
                ? 'Retry'
                : (!displayAsCategorized
                  ? stringOverrides?.approveButtonText || 'Approve'
                  : stringOverrides?.updateButtonText || 'Update')}
            </SubmitButton>
          </HStack>
        </div>
      )}
      {!openExpandedRow && displayAsCategorized && (
        <BankTransactionsListItemCategory
          bankTransaction={bankTransaction}
        />
      )}
      {isError
        && (
          <HStack pis='md' pbe='md'>
            <ErrorText>
              Approval failed. Check connection and retry in few seconds.
            </ErrorText>
          </HStack>
        )}
    </li>
  )
}
