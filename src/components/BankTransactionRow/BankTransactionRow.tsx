import React, { useRef, useState } from 'react'
import { useBankTransactions } from '../../hooks/useBankTransactions'
import ChevronDown from '../../icons/ChevronDown'
import { centsToDollars as formatMoney } from '../../models/Money'
import { BankTransaction, CategorizationType, Direction } from '../../types'
import { hasSuggestions } from '../../types/categories'
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
    hasSuggestions(bankTransaction.categorization_flow)
      ? bankTransaction.categorization_flow.suggestions[0]
      : undefined,
  )

  const save = () => {
    // Save using form from expanded row when row is open:
    if (isOpen && expandedRowRef?.current) {
      expandedRowRef?.current?.save()
      toggleOpen(bankTransaction.id)
      return
    }

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
            `${className}__actions-cell--${isOpen ? 'open' : 'close'}`,
          )}
        >
          <span
            className={`${className}__actions-container Layer__table-cell-content`}
          >
            {editable && !isOpen ? (
              <CategoryMenu
                bankTransaction={bankTransaction}
                name={`category-${bankTransaction.id}`}
                value={selectedCategory}
                onChange={setSelectedCategory}
                disabled={bankTransaction.processing}
              />
            ) : null}
            {!editable && !isOpen ? (
              <Text as='span' className={`${className}__category-text`}>
                {bankTransaction?.category?.display_name}
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
                {editable ? 'Approve' : 'Save'}
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
