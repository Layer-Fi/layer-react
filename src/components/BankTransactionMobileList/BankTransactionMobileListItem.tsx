import React, { useEffect, useState } from 'react'
import { useElementSize } from '../../hooks/useElementSize'
import { centsToDollars as formatMoney } from '../../models/Money'
import { BankTransaction, CategorizationStatus } from '../../types'
import { hasMatch, isCredit } from '../../utils/bankTransactions'
import { extractDescriptionForSplit } from '../BankTransactionRow/BankTransactionRow'
import { CloseButton } from '../Button'
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
  initialLoad?: boolean
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
  editable,
  initialLoad,
}: BankTransactionMobileListItemProps) => {
  const formRowRef = useElementSize<HTMLDivElement>((_a, _b, { height }) =>
    setHeight(height),
  )

  const [purpose, setPurpose] = useState<Purpose>(
    bankTransaction.category
      ? bankTransaction.categorization_status === CategorizationStatus.SPLIT
        ? Purpose.more
        : Purpose.business
      : hasMatch(bankTransaction)
      ? Purpose.more
      : Purpose.business,
  )
  const [open, setOpen] = useState(false)
  const [showComponent, setShowComponent] = useState(false)
  const [height, setHeight] = useState(0)

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
      }, index * 10)

      return () => clearTimeout(timeoutId)
    } else {
      setShowComponent(true)
    }
  }, [])

  const onChangePurpose = (event: React.ChangeEvent<HTMLInputElement>) =>
    setPurpose(event.target.value as Purpose)

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
            {!editable && bankTransaction.categorization_status
              ? getAssignedValue(bankTransaction)
              : null}
            {editable && bankTransaction.account_name}
          </Text>
          {!editable && open && (
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
                size={ToggleSize.xsmall}
                options={[
                  {
                    value: 'business',
                    label: 'Business',
                    style: { minWidth: 84 },
                  },
                  {
                    value: 'personal',
                    label: 'Personal',
                    style: { minWidth: 84 },
                  },
                  {
                    value: 'more',
                    label: 'More',
                    style: { minWidth: 84 },
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
