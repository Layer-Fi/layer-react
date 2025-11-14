import { ErrorText } from '@components/Typography/ErrorText'
import { RetryButton } from '@components/Button/RetryButton'
import { useEffect, useRef, useState } from 'react'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import ChevronDownFill from '@icons/ChevronDownFill'
import FileIcon from '@icons/File'
import { BankTransaction } from '@internal-types/bank_transactions'
import {
  hasReceipts,
  isCredit,
} from '@utils/bankTransactions'
import {
  BankTransactionCTAStringOverrides,
} from '@components/BankTransactions/BankTransactions'
import { isCategorized } from '@components/BankTransactions/utils'
import { SubmitAction, SubmitButton } from '@components/Button/SubmitButton'
import { ExpandedBankTransactionRow } from '@components/ExpandedBankTransactionRow/ExpandedBankTransactionRow'
import { SaveHandle } from '@components/ExpandedBankTransactionRow/ExpandedBankTransactionRow'
import classNames from 'classnames'
import { parseISO, format as formatTime } from 'date-fns'
import { useEffectiveBookkeepingStatus } from '@hooks/bookkeeping/useBookkeepingStatus'
import { isCategorizationEnabledForStatus } from '@utils/bookkeeping/isCategorizationEnabled'
import { BankTransactionsProcessingInfo } from '@components/BankTransactionsList/BankTransactionsProcessingInfo'
import { useDelayedVisibility } from '@hooks/visibility/useDelayedVisibility'
import { Span } from '@ui/Typography/Text'
import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { type BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { BankTransactionCategoryComboBox } from '@components/BankTransactionCategoryComboBox/BankTransactionCategoryComboBox'
import { Checkbox } from '@ui/Checkbox/Checkbox'
import { useBulkSelectionActions, useIdIsSelected } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { useBankTransactionsCategoryActions, useGetBankTransactionCategory } from '@providers/BankTransactionsCategoryStore/BankTransactionsCategoryStoreProvider'
import { HStack } from '@ui/Stack/Stack'
import { useSaveBankTransactionRow } from '@hooks/useBankTransactions/useSaveBankTransactionRow'
import { MoneySpan } from '@components/ui/Typography/MoneySpan'
import { BankTransactionsListItemCategory } from '@components/BankTransactions/BankTransactionsListItemCategory/BankTransactionsListItemCategory'
import { MotionContent } from '@components/ui/MotionContent/MotionContent'

type BankTransactionsListItemProps = {
  index: number
  dateFormat: string
  bankTransaction: BankTransaction
  editable: boolean
  removeTransaction: (bt: BankTransaction) => void
  containerWidth?: number
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
  containerWidth,
  removeTransaction,
  stringOverrides,

  showDescriptions,
  showReceiptUploads,
  showTooltips,
}: BankTransactionsListItemProps) => {
  const expandedRowRef = useRef<SaveHandle>(null)
  const [showRetry, setShowRetry] = useState(false)
  const { shouldHideAfterCategorize } = useBankTransactionsContext()
  const { saveBankTransactionRow } = useSaveBankTransactionRow()
  const [openExpandedRow, setOpenExpandedRow] = useState(false)
  const toggleExpandedRow = () => {
    setShowRetry(false)
    setOpenExpandedRow(!openExpandedRow)
  }

  const { isDesktop } = useSizeClass()

  const bookkeepingStatus = useEffectiveBookkeepingStatus()
  const categorizationEnabled = isCategorizationEnabledForStatus(bookkeepingStatus)

  const categorized = isCategorized(bankTransaction)

  const { isVisible } = useDelayedVisibility({ delay: index * 80 })

  const { select, deselect } = useBulkSelectionActions()
  const isSelected = useIdIsSelected()
  const isTransactionSelected = isSelected(bankTransaction.id)
  const { setTransactionCategory } = useBankTransactionsCategoryActions()
  const { selectedCategory } = useGetBankTransactionCategory(bankTransaction.id)

  useEffect(() => {
    if (bankTransaction.error) {
      setShowRetry(true)
    }
  }, [bankTransaction.error])

  useEffect(() => {
    if (
      editable
      && bankTransaction.recently_categorized
      && shouldHideAfterCategorize()
    ) {
      setTimeout(() => {
        removeTransaction(bankTransaction)
      }, 300)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankTransaction.recently_categorized])

  const save = async () => {
    // Save using form from expanded row when row is open:
    if (openExpandedRow && expandedRowRef?.current) {
      expandedRowRef?.current?.save()
      return
    }

    await saveBankTransactionRow(selectedCategory, bankTransaction)

    // Remove from bulk selection store
    deselect(bankTransaction.id)
    setOpenExpandedRow(false)
  }

  const handleSave = () => {
    void save()
  }

  const openClassName = openExpandedRow ? 'Layer__bank-transaction-list-item--expanded' : ''
  const rowClassName = classNames(
    'Layer__bank-transaction-list-item',
    bankTransaction.recently_categorized
    && editable
    && shouldHideAfterCategorize()
      ? 'Layer__bank-transaction-row--removing'
      : '',
    openExpandedRow ? openClassName : '',
    isVisible ? 'show' : '',
  )

  return (
    <li className={rowClassName}>
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
            <div className='Layer__bank-transaction-list-item__checkbox'>
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
      {!categorizationEnabled && !categorized
        && (
          <span className='Layer__bank-transaction-list-item__processing-info'>
            <BankTransactionsProcessingInfo />
          </span>
        )}
      <span className='Layer__bank-transaction-list-item__expanded-row'>
        <MotionContent variant='expand' isOpen={openExpandedRow} key={`expanded-${bankTransaction.id}`}>
          <ExpandedBankTransactionRow
            ref={expandedRowRef}
            bankTransaction={bankTransaction}
            isOpen={openExpandedRow}
            close={() => setOpenExpandedRow(false)}
            categorized={categorized}
            asListItem={true}
            submitBtnText={
              categorized
                ? stringOverrides?.updateButtonText || 'Update'
                : stringOverrides?.approveButtonText || 'Approve'
            }
            containerWidth={containerWidth}

            showDescriptions={showDescriptions}
            showReceiptUploads={showReceiptUploads}
            showTooltips={showTooltips}

            showLeftPadding={false}
          />
        </MotionContent>
      </span>
      {!openExpandedRow && categorizationEnabled && !categorized && (
        <HStack pi='md' gap='md' pb='md'>
          <BankTransactionCategoryComboBox
            bankTransaction={bankTransaction}
            selectedValue={selectedCategory ?? null}
            onSelectedValueChange={(selectedCategory: BankTransactionCategoryComboBoxOption | null) => {
              setTransactionCategory(bankTransaction.id, selectedCategory)
              setShowRetry(false)
            }}
            isLoading={bankTransaction.processing}
          />
          {!showRetry
            && (
              <SubmitButton
                disabled={bankTransaction.processing}
                onClick={handleSave}
                className='Layer__bank-transaction__submit-btn'
                processing={bankTransaction.processing}
                action={!categorized ? SubmitAction.SAVE : SubmitAction.UPDATE}
              >
                {!categorized
                  ? stringOverrides?.approveButtonText || 'Approve'
                  : stringOverrides?.updateButtonText || 'Update'}
              </SubmitButton>
            )}
          {showRetry
            && (
              <RetryButton
                onClick={handleSave}
                className='Layer__bank-transaction__retry-btn'
                processing={bankTransaction.processing}
                error='Approval failed. Check connection and retry in few seconds.'
              >
                Retry
              </RetryButton>
            )}
        </HStack>
      )}
      {!openExpandedRow && categorizationEnabled && categorized && (
        <BankTransactionsListItemCategory
          bankTransaction={bankTransaction}
        />
      )}
      {bankTransaction.error && showRetry
        && (
          <ErrorText>
            Approval failed. Check connection and retry in few seconds.
          </ErrorText>
        )}
    </li>
  )
}
