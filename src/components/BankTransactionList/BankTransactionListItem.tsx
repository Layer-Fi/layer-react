import { useEffect, useRef, useState } from 'react'
import { useBankTransactionsContext } from '../../contexts/BankTransactionsContext'
import ChevronDownFill from '../../icons/ChevronDownFill'
import FileIcon from '../../icons/File'
import { centsToDollars as formatMoney } from '../../models/Money'
import { BankTransaction } from '../../types'
import {
  getCategorizePayload,
  hasReceipts,
  isCredit,
} from '../../utils/bankTransactions'
import { getDefaultSelectedCategory } from '../BankTransactionRow/BankTransactionRow'
import {
  BankTransactionCTAStringOverrides,
} from '../BankTransactions/BankTransactions'
import { isCategorized } from '../BankTransactions/utils'
import { RetryButton, SubmitButton } from '../Button'
import { SubmitAction } from '../Button/SubmitButton'
import { CategorySelect } from '../CategorySelect'
import { ExpandedBankTransactionRow } from '../ExpandedBankTransactionRow'
import { SaveHandle } from '../ExpandedBankTransactionRow/ExpandedBankTransactionRow'
import { ErrorText, Text } from '../Typography'
import { TextUseTooltip } from '../Typography/Text'
import { Assignment } from './Assignment'
import classNames from 'classnames'
import { parseISO, format as formatTime } from 'date-fns'
import { useEffectiveBookkeepingStatus } from '../../hooks/bookkeeping/useBookkeepingStatus'
import { isCategorizationEnabledForStatus } from '../../utils/bookkeeping/isCategorizationEnabled'
import { BankTransactionProcessingInfo } from './BankTransactionProcessingInfo'
import { useDelayedVisibility } from '../../hooks/visibility/useDelayedVisibility'

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
    getDefaultSelectedCategory(bankTransaction),
  )

  const [open, setOpen] = useState(false)
  const toggleOpen = () => {
    setShowRetry(false)
    setOpen(!open)
  }

  const bookkeepingStatus = useEffectiveBookkeepingStatus()
  const categorizationEnabled = isCategorizationEnabledForStatus(bookkeepingStatus)

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
  }, [bankTransaction.recently_categorized])

  const save = () => {
    // Save using form from expanded row when row is open:
    if (open && expandedRowRef?.current) {
      expandedRowRef?.current?.save()
      return
    }

    if (!selectedCategory) {
      return
    }

    if (selectedCategory.type === 'match') {
      matchBankTransaction(bankTransaction.id, selectedCategory.payload.id)
      return
    }

    categorizeBankTransaction(bankTransaction.id, {
      type: 'Category',
      category: getCategorizePayload(selectedCategory),
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
          <span className={`${className}__heading-date`}>
            {formatTime(parseISO(bankTransaction.date), dateFormat)}
          </span>
          <span className={`${className}__heading-separator`} />
          <span className={`${className}__heading-account-name`}>
            {bankTransaction.account_name ?? ''}
          </span>
          {hasReceipts(bankTransaction) ? <FileIcon size={12} /> : null}
        </div>
        <div
          onClick={toggleOpen}
          className='Layer__bank-transaction-row__expand-button'
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
          <Text as='span' withTooltip={TextUseTooltip.whenTruncated}>
            {bankTransaction.counterparty_name ?? bankTransaction.description}
          </Text>
        </span>
        <span
          className={`${className}__amount-${
            isCredit(bankTransaction) ? 'credit' : 'debit'
          }`}
        >
          {isCredit(bankTransaction) ? '+$' : ' $'}
          {formatMoney(bankTransaction.amount)}
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
            <CategorySelect
              bankTransaction={bankTransaction}
              name={`category-${bankTransaction.id}`}
              value={selectedCategory}
              onChange={(category) => {
                setShowRetry(false)
                setSelectedCategory(category)
              }}
              disabled={bankTransaction.processing}
              showTooltips={showTooltips}
            />
          )
          : null}
        {categorized ? <Assignment bankTransaction={bankTransaction} /> : null}
        {categorizationEnabled && !categorized && !showRetry
          ? (
            <SubmitButton
              onClick={() => {
                if (!bankTransaction.processing) {
                  save()
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
                  save()
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
