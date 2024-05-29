import React, { useEffect, useRef, useState } from 'react'
import { useBankTransactions } from '../../hooks/useBankTransactions'
import { useElementSize } from '../../hooks/useElementSize'
import { centsToDollars as formatMoney } from '../../models/Money'
import { BankTransaction } from '../../types'
import { hasMatch, isCredit } from '../../utils/bankTransactions'
import { getDefaultSelectedCategory } from '../BankTransactionRow/BankTransactionRow'
import { CloseButton } from '../Button'
import { SaveHandle } from '../ExpandedBankTransactionRow/ExpandedBankTransactionRow'
import { Toggle } from '../Toggle'
import { ToggleSize } from '../Toggle/Toggle'
import { Text } from '../Typography'
import { BankTransactionMobileForms } from './BankTransactionMobileForms'
import classNames from 'classnames'
import { parseISO, format as formatTime } from 'date-fns'

export interface BankTransactionMobileListItemProps {
  index: number
  bankTransaction: BankTransaction
  editable: boolean
  removeTransaction: (id: string) => void
  containerWidth?: number
  initialLoad?: boolean
}

export enum Purpose {
  business = 'business',
  personal = 'personal',
  more = 'more',
}

const DATE_FORMAT = 'LLL d'

export const BankTransactionMobileListItem = ({
  index = 0,
  bankTransaction,
  editable,
  containerWidth,
  initialLoad,
}: BankTransactionMobileListItemProps) => {
  const expandedRowRef = useRef<SaveHandle>(null)
  const [showRetry, setShowRetry] = useState(false)
  const [removed, setRemoved] = useState(false)
  const { categorize: categorizeBankTransaction, match: matchBankTransaction } =
    useBankTransactions()
  const [selectedCategory, setSelectedCategory] = useState(
    getDefaultSelectedCategory(bankTransaction),
  )
  const [purpose, setPurpose] = useState<Purpose>(
    bankTransaction.category
      ? Purpose.business
      : hasMatch(bankTransaction)
      ? Purpose.more
      : Purpose.business,
  )

  const [open, setOpen] = useState(false)
  const toggleOpen = () => {
    setShowRetry(false)
    if (open) {
      setHeight(0)
    }
    setOpen(!open)
  }

  const close = () => {
    setOpen(false)
    setHeight(0)
  }

  const [showComponent, setShowComponent] = useState(false)
  const [height, setHeight] = useState(0)

  const formRowRef = useElementSize<HTMLDivElement>((_a, _b, { height }) =>
    setHeight(height),
  )

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

  const onChangePurpose = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPurpose(event.target.value as Purpose)
    // @TODO - use later
    // setSplitFormError(undefined)
    // setMatchFormError(undefined)
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
      <div className={`${className}__expanded-row`} style={{ height }}>
        {open && (
          <div
            className={`${className}__expanded-row__content`}
            ref={formRowRef}
          >
            <div className={`${className}__toggle-row`}>
              <Toggle
                name={`purpose-${bankTransaction.id}`}
                size={ToggleSize.small}
                options={[
                  {
                    value: 'business',
                    label: 'Business',
                  },
                  {
                    value: 'personal',
                    label: 'Personal',
                  },
                  {
                    value: 'more',
                    label: 'More',
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
            />
          </div>
        )}
      </div>
    </li>
  )
}
