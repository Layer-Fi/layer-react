import React, { useContext, useEffect, useRef, useState } from 'react'
import { useBankTransactionsContext } from '../../contexts/BankTransactionsContext'
import { useElementSize } from '../../hooks/useElementSize'
import { centsToDollars as formatMoney } from '../../models/Money'
import { BankTransaction, CategorizationStatus } from '../../types'
import { hasMatch, isCredit } from '../../utils/bankTransactions'
import { extractDescriptionForSplit } from '../BankTransactionRow/BankTransactionRow'
import {
  BankTransactionsMode,
  categorizationEnabled,
} from '../BankTransactions/BankTransactions'
import { isCategorized } from '../BankTransactions/utils'
import { CloseButton } from '../Button'
import { Toggle } from '../Toggle'
import { ToggleSize } from '../Toggle/Toggle'
import { Text } from '../Typography'
import { BankTransactionMobileForms } from './BankTransactionMobileForms'
import { TransactionToOpenContext } from './TransactionToOpenContext'
import classNames from 'classnames'
import { parseISO, format as formatTime } from 'date-fns'

export interface BankTransactionMobileListItemProps {
  index: number
  bankTransaction: BankTransaction
  editable: boolean
  removeTransaction: (bt: BankTransaction) => void
  initialLoad?: boolean
  showTooltips: boolean
  mode: BankTransactionsMode
  isFirstItem?: boolean
}

export enum Purpose {
  business = 'business',
  personal = 'personal',
  more = 'more',
}

const DATE_FORMAT = 'LLL d'

const getAssignedValue = (bankTransaction: BankTransaction) => {
  if (bankTransaction.categorization_status === CategorizationStatus.SPLIT) {
    return extractDescriptionForSplit(bankTransaction.category)
  }

  if (bankTransaction.categorization_status === CategorizationStatus.MATCHED) {
    return bankTransaction.match?.details?.description
  }

  return bankTransaction.category?.display_name
}

export const BankTransactionMobileListItem = ({
  index = 0,
  bankTransaction,
  removeTransaction,
  editable,
  mode,
  initialLoad,
  showTooltips,
  isFirstItem = false,
}: BankTransactionMobileListItemProps) => {
  const {
    transactionIdToOpen,
    setTransactionIdToOpen,
    clearTransactionIdToOpen,
  } = useContext(TransactionToOpenContext)
  const { shouldHideAfterCategorize } = useBankTransactionsContext()
  const formRowRef = useElementSize<HTMLDivElement>((_a, _b, { height }) =>
    setHeight(height),
  )
  const headingRowRef = useElementSize<HTMLDivElement>((_a, _b, { height }) => {
    setHeadingHeight(height)
  })
  const itemRef = useRef<HTMLLIElement>(null)

  const [removeAnim, setRemoveAnim] = useState(false)
  const [purpose, setPurpose] = useState<Purpose>(
    bankTransaction.category
      ? bankTransaction.category.type === 'Exclusion'
        ? Purpose.personal
        : bankTransaction.categorization_status === CategorizationStatus.SPLIT
        ? Purpose.more
        : Purpose.business
      : hasMatch(bankTransaction)
      ? Purpose.more
      : Purpose.business,
  )
  const [open, setOpen] = useState(isFirstItem)
  const [showComponent, setShowComponent] = useState(!initialLoad)
  const [height, setHeight] = useState(0)
  const [headingHeight, setHeadingHeight] = useState(63)

  const openNext = () => {
    if (editable && itemRef.current && itemRef.current.nextSibling) {
      const txId = (itemRef.current.nextSibling as HTMLLIElement).getAttribute(
        'data-item',
      )

      if (txId) {
        setTransactionIdToOpen(txId)
      }
    }
  }

  useEffect(() => {
    if (transactionIdToOpen && transactionIdToOpen === bankTransaction.id) {
      setOpen(true)
      clearTransactionIdToOpen()
    }
  }, [transactionIdToOpen])

  useEffect(() => {
    if (!removeAnim && bankTransaction.recently_categorized) {
      if (editable && shouldHideAfterCategorize(bankTransaction)) {
        setRemoveAnim(true)
        openNext()
      } else {
        close()
      }
    }
  }, [
    bankTransaction.recently_categorized,
    bankTransaction.category,
    bankTransaction.match,
  ])

  const toggleOpen = () => {
    if (open) {
      setHeight(0)
    }
    setOpen(!open)
  }

  const close = () => {
    setOpen(false)
    setHeight(0)
  }

  useEffect(() => {
    if (initialLoad) {
      const timeoutId = setTimeout(() => {
        setShowComponent(true)
      }, index * 20)

      return () => clearTimeout(timeoutId)
    } else {
      setShowComponent(true)
    }
  }, [])

  useEffect(() => {
    if (
      editable &&
      bankTransaction.recently_categorized &&
      shouldHideAfterCategorize(bankTransaction)
    ) {
      setTimeout(() => {
        removeTransaction(bankTransaction)
      }, 300)
    }
  }, [bankTransaction.recently_categorized])

  const onChangePurpose = (event: React.ChangeEvent<HTMLInputElement>) =>
    setPurpose(event.target.value as Purpose)

  const categorized = isCategorized(bankTransaction)

  const className = 'Layer__bank-transaction-mobile-list-item'
  const openClassName = open ? `${className}--expanded` : ''
  const rowClassName = classNames(
    className,
    removeAnim ? 'Layer__bank-transaction-row--removing' : '',
    open ? openClassName : '',
    showComponent ? 'show' : '',
  )

  return (
    <li ref={itemRef} className={rowClassName} data-item={bankTransaction.id}>
      <span
        className={`${className}__heading`}
        onClick={toggleOpen}
        role='button'
        style={{ height: headingHeight }}
      >
        <div className={`${className}__heading__content`} ref={headingRowRef}>
          <div className={`${className}__heading__main`}>
            <Text as='span' className={`${className}__heading__tx-name`}>
              {bankTransaction.counterparty_name ?? bankTransaction.description}
            </Text>
            <Text as='span' className={`${className}__heading__account-name`}>
              {categorized && bankTransaction.categorization_status
                ? getAssignedValue(bankTransaction)
                : null}
              {!categorized && bankTransaction.account_name}
            </Text>
            {categorized && open && (
              <Text as='span' className={`${className}__categorized-name`}>
                {bankTransaction.account_name}
              </Text>
            )}
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
        </div>
      </span>
      {categorizationEnabled(mode) ? (
        <div
          className={`${className}__expanded-row`}
          style={{ height: !open || removeAnim ? 0 : height }}
        >
          {open && (
            <div
              className={`${className}__expanded-row__content`}
              ref={formRowRef}
            >
              <div className={`${className}__toggle-row`}>
                <Toggle
                  name={`purpose-${bankTransaction.id}`}
                  size={ToggleSize.xsmall}
                  options={[
                    {
                      value: 'business',
                      label: 'Business',
                      style: { minWidth: 84 },
                      disabled: !categorizationEnabled(mode),
                    },
                    {
                      value: 'personal',
                      label: 'Personal',
                      style: { minWidth: 84 },
                      disabled: !categorizationEnabled(mode),
                    },
                    {
                      value: 'more',
                      label: 'More',
                      style: { minWidth: 84 },
                      disabled: !categorizationEnabled(mode),
                    },
                  ]}
                  selected={purpose}
                  onChange={onChangePurpose}
                />
                <CloseButton onClick={() => close()} />
              </div>
              <BankTransactionMobileForms
                purpose={purpose}
                bankTransaction={bankTransaction}
                showTooltips={showTooltips}
              />
            </div>
          )}
        </div>
      ) : (
        <></>
      )}
    </li>
  )
}
