import React, { useEffect, useRef, useState } from 'react'
import { useBankTransactionsContext } from '../../contexts/BankTransactionsContext'
import AlertCircle from '../../icons/AlertCircle'
import ChevronDownFill from '../../icons/ChevronDownFill'
import Scissors from '../../icons/Scissors'
import { centsToDollars as formatMoney } from '../../models/Money'
import { BankTransaction, CategorizationStatus, Category } from '../../types'
import { hasSuggestions } from '../../types/categories'
import { getCategorizePayload, isCredit } from '../../utils/bankTransactions'
import { Badge } from '../Badge'
import {
  BankTransactionCTAStringOverrides,
  BankTransactionsMode,
  categorizationEnabled,
} from '../BankTransactions/BankTransactions'
import { isCategorized } from '../BankTransactions/utils'
import { SubmitButton, IconButton, RetryButton } from '../Button'
import { SubmitAction } from '../Button/SubmitButton'
import { CategorySelect } from '../CategorySelect'
import {
  mapCategoryToOption,
  mapSuggestedMatchToOption,
} from '../CategorySelect/CategorySelect'
import { ExpandedBankTransactionRow } from '../ExpandedBankTransactionRow'
import { SaveHandle } from '../ExpandedBankTransactionRow/ExpandedBankTransactionRow'
import { Text } from '../Typography'
import { TextSize, TextUseTooltip } from '../Typography/Text'
import { MatchBadge } from './MatchBadge'
import { SplitTooltipDetails } from './SplitTooltipDetails'
import classNames from 'classnames'
import { parseISO, format as formatTime } from 'date-fns'

type Props = {
  index: number
  editable: boolean
  dateFormat: string
  bankTransaction: BankTransaction
  removeTransaction: (bt: BankTransaction) => void
  containerWidth?: number
  initialLoad?: boolean
  showDescriptions: boolean
  showReceiptUploads: boolean
  mode: BankTransactionsMode
  stringOverrides?: BankTransactionCTAStringOverrides
}

export type LastSubmittedForm = 'simple' | 'match' | 'split' | undefined

export const extractDescriptionForSplit = (category: Category) => {
  if (!category.entries) {
    return ''
  }

  return category.entries.map(c => c.category.display_name).join(', ')
}

export const getDefaultSelectedCategory = (
  bankTransaction: BankTransaction,
) => {
  if (bankTransaction.suggested_matches?.[0]) {
    return mapSuggestedMatchToOption(bankTransaction.suggested_matches?.[0])
  }
  if (hasSuggestions(bankTransaction.categorization_flow)) {
    return mapCategoryToOption(
      bankTransaction.categorization_flow.suggestions[0],
    )
  }
  return undefined
}

let clickTimer = Date.now()

export const BankTransactionRow = ({
  index = 0,
  editable,
  dateFormat,
  bankTransaction,
  mode,
  removeTransaction,
  containerWidth,
  initialLoad,
  showDescriptions,
  showReceiptUploads,
  stringOverrides,
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

  const openRow = {
    onMouseDown: () => {
      clickTimer = Date.now()
    },
    onMouseUp: () => {
      if (Date.now() - clickTimer < 100 && !open) {
        setShowRetry(false)
        setOpen(true)
      }
    },
  }

  const [showComponent, setShowComponent] = useState(false)

  useEffect(() => {
    if (initialLoad) {
      const timeoutId = setTimeout(() => {
        setShowComponent(true)
      }, index * 10)

      return () => clearTimeout(timeoutId)
    } else {
      setShowComponent(true)
    }
  }, [])

  useEffect(() => {
    if (bankTransaction.error) {
      setShowRetry(true)
    }
  }, [bankTransaction.error])

  useEffect(() => {
    if (editable && bankTransaction.recently_categorized && shouldHideAfterCategorize(bankTransaction)) {
      setTimeout(() => {
        removeTransaction(bankTransaction)
      }, 300)
    }
  }, [bankTransaction.recently_categorized])

  const save = async () => {
    // Save using form from expanded row when row is open:
    if (open && expandedRowRef?.current) {
      expandedRowRef?.current?.save()
      return
    }

    if (!selectedCategory) {
      return
    }

    if (selectedCategory.type === 'match') {
      await matchBankTransaction(
        bankTransaction.id,
        selectedCategory.payload.id,
      )
      setOpen(false)
      return
    }

    await categorizeBankTransaction(bankTransaction.id, {
      type: 'Category',
      category: getCategorizePayload(selectedCategory),
    })
    setOpen(false)
  }

  const categorized = isCategorized(bankTransaction)

  const className = 'Layer__bank-transaction-row'
  const openClassName = open ? `${className}--expanded` : ''
  const rowClassName = classNames(
    className,
    bankTransaction.recently_categorized && editable && shouldHideAfterCategorize(bankTransaction)
      ? 'Layer__bank-transaction-row--removing'
      : '',
    open ? openClassName : '',
    initialLoad ? 'initial-load' : '',
    showComponent ? 'show' : '',
  )

  return (
    <>
      <tr className={rowClassName}>
        <td
          className='Layer__table-cell  Layer__bank-transaction-table__date-col'
          {...openRow}
        >
          <span className='Layer__table-cell-content'>
            {formatTime(parseISO(bankTransaction.date), dateFormat)}
          </span>
        </td>
        <td
          className='Layer__table-cell Layer__bank-transactions__tx-col'
          {...openRow}
        >
          <span className='Layer__table-cell-content'>
            <Text
              as='span'
              className='Layer__bank-transactions__tx-text'
              withTooltip={TextUseTooltip.whenTruncated}
              tooltipOptions={{
                contentClassName: 'Layer__bank-transactions__tx-tooltip',
              }}
            >
              {bankTransaction.counterparty_name ?? bankTransaction.description}
            </Text>
          </span>
        </td>
        <td
          className='Layer__table-cell Layer__bank-transactions__account-col'
          {...openRow}
        >
          <span className='Layer__table-cell-content'>
            <Text
              as='span'
              className='Layer__bank-transactions__account-text'
              withTooltip={TextUseTooltip.whenTruncated}
            >
              {bankTransaction.account_name ?? ''}
            </Text>
          </span>
        </td>
        <td
          className={`Layer__table-cell Layer__table-cell__amount-col Layer__bank-transactions__amount-col Layer__table-cell--amount ${className}__table-cell--amount-${
            isCredit(bankTransaction) ? 'credit' : 'debit'
          }`}
          {...openRow}
        >
          <span className='Layer__table-cell-content'>
            {isCredit(bankTransaction) ? '+$' : ' $'}
            {formatMoney(bankTransaction.amount)}
          </span>
        </td>
        <td
          className={classNames(
            'Layer__table-cell',
            'Layer__table-cell__category-col',
            `${className}__actions-cell`,
            `${className}__actions-cell--${open ? 'open' : 'close'}`,
          )}
        >
          <span
            className={`${className}__actions-container Layer__table-cell-content`}
          >
            {!categorized && !open ? (
              <CategorySelect
                bankTransaction={bankTransaction}
                name={`category-${bankTransaction.id}`}
                value={selectedCategory}
                onChange={category => {
                  setSelectedCategory(category)
                  setShowRetry(false)
                }}
                disabled={bankTransaction.processing}
              />
            ) : null}
            {categorized && !open ? (
              <Text as='span' className={`${className}__category-text`}>
                {bankTransaction.categorization_status ===
                  CategorizationStatus.SPLIT && (
                  <>
                    <Badge
                      icon={<Scissors size={11} />}
                      tooltip={
                        <SplitTooltipDetails
                          classNamePrefix={className}
                          category={bankTransaction.category}
                        />
                      }
                    >
                      Split
                    </Badge>
                    <span className={`${className}__category-text__text`}>
                      {extractDescriptionForSplit(bankTransaction.category)}
                    </span>
                  </>
                )}
                {bankTransaction?.categorization_status ===
                  CategorizationStatus.MATCHED &&
                  bankTransaction?.match && (
                    <>
                      <MatchBadge
                        classNamePrefix={className}
                        bankTransaction={bankTransaction}
                        dateFormat={dateFormat}
                      />
                      <span className={`${className}__category-text__text`}>
                        {`${formatTime(
                          parseISO(bankTransaction.match.bank_transaction.date),
                          dateFormat,
                        )}, ${bankTransaction.match?.details?.description}`}
                      </span>
                    </>
                  )}
                {bankTransaction?.categorization_status !==
                  CategorizationStatus.MATCHED &&
                  bankTransaction?.categorization_status !==
                    CategorizationStatus.SPLIT && (
                    <span className={`${className}__category-text__text`}>
                      {bankTransaction?.category?.display_name}
                    </span>
                  )}
              </Text>
            ) : null}
            {!categorized && !open && showRetry ? (
              <RetryButton
                onClick={() => {
                  if (!bankTransaction.processing) {
                    save()
                  }
                }}
                className='Layer__bank-transaction__retry-btn'
                processing={bankTransaction.processing}
                error={
                  'Approval failed. Check connection and retry in few seconds.'
                }
              >
                Retry
              </RetryButton>
            ) : null}
            {open && bankTransaction.error ? (
              <Text
                as='span'
                size={TextSize.md}
                className='Layer__unsaved-info'
              >
                <span>Unsaved</span>
                <AlertCircle size={12} />
              </Text>
            ) : null}
            {(!categorized && (open || (!open && !showRetry))) ||
            (categorizationEnabled(mode) && categorized && open) ? (
              <SubmitButton
                onClick={() => {
                  if (!bankTransaction.processing) {
                    save()
                  }
                }}
                className='Layer__bank-transaction__submit-btn'
                processing={bankTransaction.processing}
                active={open}
                action={categorized ? SubmitAction.SAVE : SubmitAction.UPDATE}
              >
                {categorized
                  ? stringOverrides?.updateButtonText || 'Update'
                  : stringOverrides?.approveButtonText || 'Approve'}
              </SubmitButton>
            ) : null}
            <IconButton
              onClick={toggleOpen}
              className='Layer__bank-transaction-row__expand-button'
              active={open}
              icon={
                <ChevronDownFill
                  className={`Layer__chevron ${
                    open ? 'Layer__chevron__up' : 'Layer__chevron__down'
                  }`}
                />
              }
            />
          </span>
        </td>
      </tr>
      <tr>
        <td colSpan={5} className='Layer__bank-transaction-row__expanded-td'>
          <ExpandedBankTransactionRow
            ref={expandedRowRef}
            bankTransaction={bankTransaction}
            categorized={categorized}
            isOpen={open}
            mode={mode}
            close={() => setOpen(false)}
            containerWidth={containerWidth}
            showDescriptions={showDescriptions}
            showReceiptUploads={showReceiptUploads}
          />
        </td>
      </tr>
    </>
  )
}
