import React, { useRef, useState } from 'react'
import { useBankTransactions } from '../../hooks/useBankTransactions'
import ChevronDown from '../../icons/ChevronDown'
import MinimizeTwo from '../../icons/MinimizeTwo'
import Scissors from '../../icons/Scissors'
import { centsToDollars as formatMoney } from '../../models/Money'
import {
  BankTransaction,
  CategorizationStatus,
  CategorizationType,
  Category,
  Direction,
} from '../../types'
import { BTMenu } from '../BTMenu'
import { Badge } from '../Badge'
import { SubmitButton } from '../Button'
import { CategoryMenu } from '../CategoryMenu'
import { ExpandedBankTransactionRow } from '../ExpandedBankTransactionRow'
import { SaveHandle } from '../ExpandedBankTransactionRow/ExpandedBankTransactionRow'
import { Text } from '../Typography'
import { TextUseTooltip } from '../Typography/Text'
import classNames from 'classnames'
import { parseISO, format as formatTime } from 'date-fns'

type Props = {
  dateFormat: string
  bankTransaction: BankTransaction
  isOpen: boolean
  toggleOpen: (id: string) => void
  editable: boolean
}

const isCredit = ({ direction }: Pick<BankTransaction, 'direction'>) =>
  direction === Direction.CREDIT

const extractDescForSplit = (category: Category) => {
  if (!category.entries) {
    return ''
  }

  return category.entries.map(c => c.category.display_name).join(', ')
}

export const BankTransactionRow = ({
  dateFormat,
  bankTransaction,
  isOpen,
  toggleOpen,
  editable,
}: Props) => {
  const expandedRowRef = useRef<SaveHandle>(null)
  const [removed, setRemoved] = useState(false)
  const { categorize: categorizeBankTransaction } = useBankTransactions()
  const [selectedCategory, setSelectedCategory] = useState(
    bankTransaction.categorization_flow?.type ===
      CategorizationType.ASK_FROM_SUGGESTIONS
      ? bankTransaction.categorization_flow.suggestions[0]
      : bankTransaction.suggested_matches?.length === 1
      ? // @TODO - refactor below
        {
          type: 'match',
          payload: {
            id: bankTransaction.suggested_matches[0].id,
            option_type: 'match',
            display_name:
              bankTransaction.suggested_matches[0].details.description,
            amount: bankTransaction.suggested_matches[0].details.amount,
          },
        }
      : undefined,
  )

  const save = () => {
    // Save using form from expanded row when row is open:
    if (isOpen && expandedRowRef?.current) {
      expandedRowRef?.current?.save()
      toggleOpen(bankTransaction.id)
      return
    }

    console.log(selectedCategory)

    categorizeBankTransaction(bankTransaction.id, {
      type: 'Category',
      category: {
        type: 'StableName',
        stable_name:
          selectedCategory?.stable_name || selectedCategory?.category || '',
      },
    })
  }

  if (removed) {
    return null
  }

  const className = 'Layer__bank-transaction-row'
  const openClassName = isOpen ? `${className}--expanded` : ''
  const rowClassName = classNames(
    className,
    bankTransaction.recently_categorized
      ? 'Layer__bank-transaction-row--removing'
      : '',
    isOpen ? openClassName : '',
  )

  // if (bankTransaction.categorization_status === CategorizationStatus.MATCHED) {
  //   console.log(bankTransaction, bankTransaction.match)
  // }
  if (bankTransaction.category && bankTransaction.category?.entries) {
    console.log(bankTransaction.category)
  }

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
              {bankTransaction.counterparty_name}
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
            `${className}__actions-cell--${isOpen ? 'open' : 'close'}`,
          )}
        >
          <span
            className={`${className}__actions-container Layer__table-cell-content`}
          >
            {editable && !isOpen ? (
              <>
                {/* <CategoryMenu
                  bankTransaction={bankTransaction}
                  name={`category-${bankTransaction.id}`}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  disabled={bankTransaction.processing}
                /> */}
                <BTMenu
                  bankTransaction={bankTransaction}
                  name={`category-${bankTransaction.id}`}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  disabled={bankTransaction.processing}
                />
              </>
            ) : null}
            {!editable && !isOpen ? (
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
                      {extractDescForSplit(bankTransaction.category)}
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
            {editable || isOpen ? (
              <SubmitButton
                onClick={() => {
                  if (!bankTransaction.processing) {
                    save()
                  }
                }}
                className='Layer__bank-transaction__submit-btn'
                processing={bankTransaction.processing}
                error={bankTransaction.error}
                active={isOpen}
              >
                {editable ? 'Approve' : 'Update'}
              </SubmitButton>
            ) : null}
            <div
              onClick={() => toggleOpen(bankTransaction.id)}
              className='Layer__bank-transaction-row__expand-button'
            >
              <ChevronDown
                className={`Layer__chevron ${
                  isOpen ? 'Layer__chevron__up' : 'Layer__chevron__down'
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
            close={() => toggleOpen(bankTransaction.id)}
            isOpen={isOpen}
          />
        </td>
      </tr>
    </>
  )
}

export const MatchBadge = ({
  bankTransaction,
  classNamePrefix,
  dateFormat,
  text = 'Match',
}: {
  bankTransaction: BankTransaction
  classNamePrefix: string
  dateFormat: string
  text?: string
}) => {
  if (
    bankTransaction.categorization_status === CategorizationStatus.MATCHED &&
    bankTransaction.match
  ) {
    const { date, amount, description, direction } =
      bankTransaction.match.bank_transaction

    return (
      <Badge
        icon={<MinimizeTwo size={11} />}
        tooltip={
          <span className={`${classNamePrefix}__match-tooltip`}>
            <div className={`${classNamePrefix}__match-tooltip__date`}>
              {formatTime(parseISO(date), dateFormat)}
            </div>
            <div className={`${classNamePrefix}__match-tooltip__description`}>
              {description}
            </div>
            <div className={`${classNamePrefix}__match-tooltip__amount`}>
              ${formatMoney(amount)}
            </div>
          </span>
        }
      >
        {text}
      </Badge>
    )
  }

  return
}

const SplitTooltipDetails = ({
  classNamePrefix,
  category,
}: {
  classNamePrefix: string
  category: Category
}) => {
  if (!category.entries) {
    return
  }

  return (
    <span className={`${classNamePrefix}__split-tooltip`}>
      <ul>
        {category.entries.map((entry, idx) => (
          <li key={idx}>
            <span className={`${classNamePrefix}__split-tooltip__label`}>
              {entry.category.display_name}
            </span>
            <span className={`${classNamePrefix}__split-tooltip__value`}>
              ${formatMoney(entry.amount)}
            </span>
          </li>
        ))}
      </ul>
    </span>
  )
}
