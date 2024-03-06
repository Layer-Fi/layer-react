import React, { useRef, useState } from 'react'
import { useBankTransactions } from '../../hooks/useBankTransactions'
import ChevronDown from '../../icons/ChevronDown'
import { centsToDollars as formatMoney } from '../../models/Money'
import { BankTransaction, Direction } from '../../types'
import { getDefaultSelectedCategory } from '../BankTransactionRow/BankTransactionRow'
import { SubmitButton } from '../Button'
import { CategorySelect } from '../CategorySelect'
import { ExpandedBankTransactionRow } from '../ExpandedBankTransactionRow'
import { SaveHandle } from '../ExpandedBankTransactionRow/ExpandedBankTransactionRow'
import { Text } from '../Typography'
import { TextUseTooltip } from '../Typography/Text'
import { Assignment } from './Assignment'
import classNames from 'classnames'
import { parseISO, format as formatTime } from 'date-fns'

type Props = {
  dateFormat: string
  bankTransaction: BankTransaction
  editable: boolean
}

const isCredit = ({ direction }: Pick<BankTransaction, 'direction'>) =>
  direction === Direction.CREDIT

export const BankTransactionListItem = ({
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

  const className = 'Layer__bank-transaction-list-item'
  const openClassName = open ? `${className}--expanded` : ''
  const rowClassName = classNames(
    className,
    bankTransaction.recently_categorized
      ? 'Layer__bank-transaction-row--removing'
      : '',
    open ? openClassName : '',
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
        </div>
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
      <span className={`${className}__expanded-row`}>
        <ExpandedBankTransactionRow
          ref={expandedRowRef}
          bankTransaction={bankTransaction}
          isOpen={open}
          asListItem={true}
          submitBtnText={editable ? 'Approve' : 'Save'}
        />
      </span>
      <span className={`${className}__base-row`}>
        {editable ? (
          <CategorySelect
            bankTransaction={bankTransaction}
            name={`category-${bankTransaction.id}`}
            value={selectedCategory}
            onChange={setSelectedCategory}
            disabled={bankTransaction.processing}
          />
        ) : null}
        {!editable ? <Assignment bankTransaction={bankTransaction} /> : null}
        {editable && (
          <SubmitButton
            onClick={() => {
              if (!bankTransaction.processing) {
                save()
              }
            }}
            className='Layer__bank-transaction__submit-btn'
            processing={bankTransaction.processing}
            error={bankTransaction.error}
            iconOnly={true}
          />
        )}
      </span>
    </li>
  )
}
