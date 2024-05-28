import React, { useEffect, useRef, useState } from 'react'
import { useBankTransactions } from '../../hooks/useBankTransactions'
import ChevronDownFill from '../../icons/ChevronDownFill'
import { centsToDollars as formatMoney } from '../../models/Money'
import { BankTransaction, Direction } from '../../types'
import { getDefaultSelectedCategory } from '../BankTransactionRow/BankTransactionRow'
import { RetryButton, SubmitButton } from '../Button'
import { SubmitAction } from '../Button/SubmitButton'
import { CategorySelect } from '../CategorySelect'
import { ExpandedBankTransactionRow } from '../ExpandedBankTransactionRow'
import { SaveHandle } from '../ExpandedBankTransactionRow/ExpandedBankTransactionRow'
import { ErrorText, Text } from '../Typography'
import { TextUseTooltip } from '../Typography/Text'
// import { Assignment } from './Assignment' // @TODO fix by making it more reusablbe
import classNames from 'classnames'
import { parseISO, format as formatTime } from 'date-fns'

export interface BankTransactionMobileListItemProps {
  index: number
  bankTransaction: BankTransaction
  editable: boolean
  removeTransaction: (id: string) => void
  containerWidth?: number
}

const DATE_FORMAT = 'LLL d'

// @TODO move this and other to utils
const isCredit = ({ direction }: Pick<BankTransaction, 'direction'>) =>
  direction === Direction.CREDIT

export const BankTransactionMobileListItem = ({
  index = 0,
  bankTransaction,
  editable,
  containerWidth,
}: BankTransactionMobileListItemProps) => {
  const expandedRowRef = useRef<SaveHandle>(null)
  const [showRetry, setShowRetry] = useState(false)
  const [removed, setRemoved] = useState(false)
  const { categorize: categorizeBankTransaction, match: matchBankTransaction } =
    useBankTransactions()
  const [selectedCategory, setSelectedCategory] = useState(
    getDefaultSelectedCategory(bankTransaction),
  )

  const [open, setOpen] = useState(false)
  const toggleOpen = () => {
    setShowRetry(false)
    setOpen(!open)
  }

  const [showComponent, setShowComponent] = useState(false)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowComponent(true)
    }, index * 80)

    return () => clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    if (bankTransaction.error) {
      setShowRetry(true)
    }
  }, [bankTransaction.error])

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
      category: {
        type: 'StableName',
        stable_name: selectedCategory?.payload.stable_name || '',
      },
    })
  }

  if (removed) {
    return null
  }

  const className = 'Layer__bank-transaction-mobile-list-item'
  const openClassName = open ? `${className}--expanded` : ''
  const rowClassName = classNames(
    className,
    bankTransaction.recently_categorized
      ? 'Layer__bank-transaction-row--removing'
      : '',
    open ? openClassName : '',
    showComponent ? 'show' : '',
  )

  return (
    <li className={rowClassName}>
      <span
        className={`${className}__heading`}
        onClick={toggleOpen}
        role='button'
      >
        <div className={`${className}__heading__main`}>
          <Text as='span' className={`${className}__heading__tx-name`}>
            {bankTransaction.counterparty_name ?? bankTransaction.description}
          </Text>
          <Text as='span' className={`${className}__heading__account-name`}>
            {bankTransaction.account_name ?? ''}
          </Text>
        </div>
        <div className={`${className}__heading__amount`}>
          <span
            className={`${className}__amount-${
              isCredit(bankTransaction) ? 'credit' : 'debit'
            }`}
          >
            {isCredit(bankTransaction) ? '+$' : ' $'}
            {formatMoney(bankTransaction.amount)}
          </span>
          <span className={`${className}__heading__date`}>
            {formatTime(parseISO(bankTransaction.date), DATE_FORMAT)}
          </span>
        </div>
      </span>
      <div className={`${className}__expanded-row`}>
        <div style={{ height: 400 }}>Form</div>
      </div>
    </li>
  )

  // return (
  //   <li className={rowClassName}>
  //     <span className={`${className}__heading`}>
  //       <div className={`${className}__heading__main`}>
  //         <span className={`${className}__heading-date`}>
  //           {formatTime(parseISO(bankTransaction.date), dateFormat)}
  //         </span>
  //         <span className={`${className}__heading-separator`} />
  //         <span className={`${className}__heading-account-name`}>
  //           {bankTransaction.account_name ?? ''}
  //         </span>
  //       </div>
  //       <div

  //         className='Layer__bank-transaction-row__expand-button'
  //       >
  //         <ChevronDownFill
  //           className={`Layer__chevron ${
  //             open ? 'Layer__chevron__up' : 'Layer__chevron__down'
  //           }`}
  //         />
  //       </div>
  //     </span>
  //     <span className={`${className}__body`}>
  //       <span className={`${className}__body__name`}>
  //         <Text as='span' withTooltip={TextUseTooltip.whenTruncated}>
  //           {bankTransaction.counterparty_name ?? bankTransaction.description}
  //         </Text>
  //       </span>
  //       <span
  //         className={`${className}__amount-${
  //           isCredit(bankTransaction) ? 'credit' : 'debit'
  //         }`}
  //       >
  //         {isCredit(bankTransaction) ? '+$' : ' $'}
  //         {formatMoney(bankTransaction.amount)}
  //       </span>
  //     </span>
  //     <span className={`${className}__expanded-row`}>
  //       <ExpandedBankTransactionRow
  //         ref={expandedRowRef}
  //         bankTransaction={bankTransaction}
  //         isOpen={open}
  //         close={() => setOpen(false)}
  //         editable={editable}
  //         asListItem={true}
  //         submitBtnText={editable ? 'Approve' : 'Update'}
  //         containerWidth={containerWidth}
  //       />
  //     </span>
  //     <span className={`${className}__base-row`}>
  //       {editable ? (
  //         <CategorySelect
  //           bankTransaction={bankTransaction}
  //           name={`category-${bankTransaction.id}`}
  //           value={selectedCategory}
  //           onChange={category => {
  //             setShowRetry(false)
  //             setSelectedCategory(category)
  //           }}
  //           disabled={bankTransaction.processing}
  //         />
  //       ) : null}
  //       {/* {!editable ? <Assignment bankTransaction={bankTransaction} /> : null} */}
  //       {editable && !showRetry ? (
  //         <SubmitButton
  //           onClick={() => {
  //             if (!bankTransaction.processing) {
  //               save()
  //             }
  //           }}
  //           className='Layer__bank-transaction__submit-btn'
  //           processing={bankTransaction.processing}
  //           action={editable ? SubmitAction.SAVE : SubmitAction.UPDATE}
  //         >
  //           {editable ? 'Approve' : 'Update'}
  //         </SubmitButton>
  //       ) : null}
  //       {editable && showRetry ? (
  //         <RetryButton
  //           onClick={() => {
  //             if (!bankTransaction.processing) {
  //               save()
  //             }
  //           }}
  //           className='Layer__bank-transaction__retry-btn'
  //           processing={bankTransaction.processing}
  //           error={
  //             'Approval failed. Check connection and retry in few seconds.'
  //           }
  //         >
  //           Retry
  //         </RetryButton>
  //       ) : null}
  //     </span>
  //     {bankTransaction.error && showRetry ? (
  //       <ErrorText>
  //         Approval failed. Check connection and retry in few seconds.
  //       </ErrorText>
  //     ) : null}
  //   </li>
  // )
}
