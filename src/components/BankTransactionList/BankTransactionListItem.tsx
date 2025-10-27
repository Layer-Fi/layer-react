import { useEffect, useRef, useState } from 'react'
import { useBankTransactionsContext } from '../../contexts/BankTransactionsContext'
import ChevronDownFill from '../../icons/ChevronDownFill'
import FileIcon from '../../icons/File'
import { BankTransaction } from '../../types/bank_transactions'
import {
  hasReceipts,
  isCredit,
} from '../../utils/bankTransactions'
import {
  BankTransactionCTAStringOverrides,
} from '../BankTransactions/BankTransactions'
import { isCategorized } from '../BankTransactions/utils'
import { RetryButton, SubmitButton } from '../Button'
import { SubmitAction } from '../Button/SubmitButton'
import { ExpandedBankTransactionRow } from '../ExpandedBankTransactionRow'
import { SaveHandle } from '../ExpandedBankTransactionRow/ExpandedBankTransactionRow'
import { ErrorText } from '../Typography'
import { Assignment } from './Assignment'
import classNames from 'classnames'
import { parseISO, format as formatTime } from 'date-fns'
import { useEffectiveBookkeepingStatus } from '../../hooks/bookkeeping/useBookkeepingStatus'
import { isCategorizationEnabledForStatus } from '../../utils/bookkeeping/isCategorizationEnabled'
import { BankTransactionProcessingInfo } from './BankTransactionProcessingInfo'
import { useDelayedVisibility } from '../../hooks/visibility/useDelayedVisibility'
import { Span } from '../ui/Typography/Text'
import { MoneySpan } from '../ui/Typography/MoneySpan'
import { useSizeClass } from '../../hooks/useWindowSize'
import { getDefaultSelectedCategoryForBankTransaction } from '../BankTransactionCategoryComboBox/utils'
import { isPlaceholderAsOption, isSplitAsOption, isSuggestedMatchAsOption, type BankTransactionCategoryComboBoxOption } from '../../components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { BankTransactionCategoryComboBox } from '../BankTransactionCategoryComboBox/BankTransactionCategoryComboBox'
import { SpanWithTooltip } from '../ui/Typography/TextWithTooltip'

type Props = {
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

export const BankTransactionListItem = ({
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
}: Props) => {
  const expandedRowRef = useRef<SaveHandle>(null)
  const [showRetry, setShowRetry] = useState(false)
  const {
    categorize: categorizeBankTransaction,
    match: matchBankTransaction,
    shouldHideAfterCategorize,
  } = useBankTransactionsContext()
  const [selectedCategory, setSelectedCategory] = useState(
    getDefaultSelectedCategoryForBankTransaction(bankTransaction),
  )

  const [open, setOpen] = useState(false)
  const toggleOpen = () => {
    setShowRetry(false)
    setOpen(!open)
  }

  const bookkeepingStatus = useEffectiveBookkeepingStatus()
  const categorizationEnabled = isCategorizationEnabledForStatus(bookkeepingStatus)
  const { isDesktop } = useSizeClass()

  const { isVisible } = useDelayedVisibility({ delay: index * 80 })

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
    if (open && expandedRowRef?.current) {
      expandedRowRef?.current?.save()
      return
    }

    if (!selectedCategory || isPlaceholderAsOption(selectedCategory)) {
      return
    }

    if (isSuggestedMatchAsOption(selectedCategory)) {
      await matchBankTransaction(bankTransaction.id, selectedCategory.original.id)
      return
    }

    if (isSplitAsOption(selectedCategory)) {
      // TODO: implement split categorization
      return
    }

    if (selectedCategory.classificationEncoded === null) return

    await categorizeBankTransaction(bankTransaction.id, {
      type: 'Category',
      category: selectedCategory.classificationEncoded,
    })
  }

  const categorized = isCategorized(bankTransaction)

  const className = 'Layer__bank-transaction-list-item'
  const openClassName = open ? `${className}--expanded` : ''
  const rowClassName = classNames(
    className,
    bankTransaction.recently_categorized
    && editable
    && shouldHideAfterCategorize()
      ? 'Layer__bank-transaction-row--removing'
      : '',
    open ? openClassName : '',
    isVisible ? 'show' : '',
  )

  return (
    <li className={rowClassName}>
      <span className={`${className}__heading`}>
        <div className={`${className}__heading__main`}>
          <span>
            {formatTime(parseISO(bankTransaction.date), dateFormat)}
          </span>

          <span className={`${className}__heading-separator`} />

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
          onClick={toggleOpen}
          className={classNames(
            'Layer__bank-transaction-row__expand-button',
            !isDesktop && 'Layer__bank-transaction-row__expand-button--mobile',
          )}
        >
          <ChevronDownFill
            className={`Layer__chevron ${
              open ? 'Layer__chevron__up' : 'Layer__chevron__down'
            }`}
          />
        </div>
      </span>
      <span className={`${className}__body`}>
        <span className={`${className}__body__name`}>
          <SpanWithTooltip>
            {bankTransaction.counterparty_name ?? bankTransaction.description}
          </SpanWithTooltip>
        </span>
        <span
          className={`${className}__amount-${
            isCredit(bankTransaction) ? 'credit' : 'debit'
          }`}
        >
          <MoneySpan amount={bankTransaction.amount} displayPlusSign={isCredit(bankTransaction)} />
        </span>
      </span>
      {!categorizationEnabled && !categorized
        ? (
          <span className={`${className}__processing-info`}>
            <BankTransactionProcessingInfo />
          </span>
        )
        : null}
      <span className={`${className}__expanded-row`}>
        <ExpandedBankTransactionRow
          ref={expandedRowRef}
          bankTransaction={bankTransaction}
          isOpen={open}
          close={() => setOpen(false)}
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
        />
      </span>
      <span className={`${className}__base-row`}>
        {categorizationEnabled && !categorized
          ? (
            <BankTransactionCategoryComboBox
              bankTransaction={bankTransaction}
              selectedValue={selectedCategory}
              onSelectedValueChange={(selectedCategory: BankTransactionCategoryComboBoxOption | null) => {
                setSelectedCategory(selectedCategory)
                setShowRetry(false)
              }}
              isLoading={bankTransaction.processing}
            />
          )
          : null}
        {categorized ? <Assignment bankTransaction={bankTransaction} /> : null}
        {categorizationEnabled && !categorized && !showRetry
          ? (
            <SubmitButton
              onClick={() => {
                if (!bankTransaction.processing) {
                  void save()
                }
              }}
              className='Layer__bank-transaction__submit-btn'
              processing={bankTransaction.processing}
              action={!categorized ? SubmitAction.SAVE : SubmitAction.UPDATE}
            >
              {!categorized
                ? stringOverrides?.approveButtonText || 'Approve'
                : stringOverrides?.updateButtonText || 'Update'}
            </SubmitButton>
          )
          : null}
        {categorizationEnabled && !categorized && showRetry
          ? (
            <RetryButton
              onClick={() => {
                if (!bankTransaction.processing) {
                  void save()
                }
              }}
              className='Layer__bank-transaction__retry-btn'
              processing={bankTransaction.processing}
              error='Approval failed. Check connection and retry in few seconds.'
            >
              Retry
            </RetryButton>
          )
          : null}
      </span>
      {bankTransaction.error && showRetry
        ? (
          <ErrorText>
            Approval failed. Check connection and retry in few seconds.
          </ErrorText>
        )
        : null}
    </li>
  )
}
