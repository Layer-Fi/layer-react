import React, { useRef, useState } from 'react'
import { useBankTransactions } from '../../hooks/useBankTransactions'
import ChevronDown from '../../icons/ChevronDown'
import Scissors from '../../icons/Scissors'
import { centsToDollars as formatMoney } from '../../models/Money'
import {
  BankTransaction,
  CategorizationStatus,
  Category,
  Direction,
} from '../../types'
import { hasSuggestions } from '../../types/categories'
import { Badge } from '../Badge'
import { SubmitButton } from '../Button'
import { CategorySelect } from '../CategorySelect'
import {
  mapCategoryToOption,
  mapSuggestedMatchToOption,
} from '../CategorySelect/CategorySelect'
import { ExpandedBankTransactionRow } from '../ExpandedBankTransactionRow'
import { SaveHandle } from '../ExpandedBankTransactionRow/ExpandedBankTransactionRow'
import { Text } from '../Typography'
import { TextUseTooltip } from '../Typography/Text'
import { MatchBadge } from './MatchBadge'
import { SplitTooltipDetails } from './SplitTooltipDetails'
import classNames from 'classnames'
import { parseISO, format as formatTime } from 'date-fns'

type Props = {
  dateFormat: string
  bankTransaction: BankTransaction
  editable: boolean
}

const isCredit = ({ direction }: Pick<BankTransaction, 'direction'>) =>
  direction === Direction.CREDIT

export const extractDescriptionForSplit = (category: Category) => {
  if (!category.entries) {
    return ''
  }

  return category.entries.map(c => c.category.display_name).join(', ')
}

export const getDefaultSelectedCategory = (
  bankTransaction: BankTransaction,
) => {
  return hasSuggestions(bankTransaction.categorization_flow)
    ? mapCategoryToOption(bankTransaction.categorization_flow.suggestions[0])
    : bankTransaction.suggested_matches?.length === 1
    ? mapSuggestedMatchToOption(bankTransaction.suggested_matches[0])
    : undefined
}

export const BankTransactionRow = ({
  dateFormat,
  bankTransaction,
  editable,
}: Props) => {
  const expandedRowRef = useRef<SaveHandle>(null)
  const [removed, setRemoved] = useState(false)
  const { categorize: categorizeBankTransaction, match: matchBankTransaction } =
    useBankTransactions()
  const [selectedCategory, setSelectedCategory] = useState(
    getDefaultSelectedCategory(bankTransaction),
  )
  const [open, setOpen] = useState(false)
  const toggleOpen = () => setOpen(!open)

  const save = () => {
    // Save using form from expanded row when row is open:
    if (open && expandedRowRef?.current) {
      expandedRowRef?.current?.save()
      setOpen(false)
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
      category: {
        type: 'StableName',
        stable_name: selectedCategory?.payload.stable_name || '',
      },
    })
  }

  if (removed) {
    return null
  }

  const className = 'Layer__bank-transaction-row'
  const openClassName = open ? `${className}--expanded` : ''
  const rowClassName = classNames(
    className,
    bankTransaction.recently_categorized
      ? 'Layer__bank-transaction-row--removing'
      : '',
    open ? openClassName : '',
  )

  return (
    <>
      <tr
        className={rowClassName}
        onTransitionEnd={({ propertyName }) => {
          if (propertyName === 'top') {
            setRemoved(true)
          }
        }}
      >
        <td className='Layer__table-cell'>
          <span className='Layer__table-cell-content'>
            {formatTime(parseISO(bankTransaction.date), dateFormat)}
          </span>
        </td>
        <td className='Layer__table-cell Layer__bank-transactions__tx-col'>
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
        <td className='Layer__table-cell Layer__bank-transactions__account-col'>
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
          className={`Layer__table-cell Layer__table-cell__amount-col Layer__table-cell--amount ${className}__table-cell--amount-${
            isCredit(bankTransaction) ? 'credit' : 'debit'
          }`}
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
            {editable && !open ? (
              <CategorySelect
                bankTransaction={bankTransaction}
                name={`category-${bankTransaction.id}`}
                value={selectedCategory}
                onChange={setSelectedCategory}
                disabled={bankTransaction.processing}
              />
            ) : null}
            {!editable && !open ? (
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
                        )}, ${
                          bankTransaction.match.bank_transaction.description
                        }`}
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
            {editable || open ? (
              <SubmitButton
                onClick={() => {
                  if (!bankTransaction.processing) {
                    save()
                  }
                }}
                className='Layer__bank-transaction__submit-btn'
                processing={bankTransaction.processing}
                error={bankTransaction.error}
                active={open}
              >
                {editable ? 'Approve' : 'Update'}
              </SubmitButton>
            ) : null}
            <div
              onClick={toggleOpen}
              className='Layer__bank-transaction-row__expand-button'
            >
              <ChevronDown
                className={`Layer__chevron ${
                  open ? 'Layer__chevron__up' : 'Layer__chevron__down'
                }`}
              />
            </div>
          </span>
        </td>
      </tr>
      <tr>
        <td colSpan={5}>
          <ExpandedBankTransactionRow
            ref={expandedRowRef}
            bankTransaction={bankTransaction}
            close={toggleOpen}
            isOpen={open}
          />
        </td>
      </tr>
    </>
  )
}
