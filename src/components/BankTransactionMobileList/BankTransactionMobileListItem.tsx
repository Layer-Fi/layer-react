import React, { useEffect, useRef, useState } from 'react'
import { useElementSize } from '../../hooks/useElementSize'
import Scissors from '../../icons/Scissors'
import { centsToDollars as formatMoney } from '../../models/Money'
import { BankTransaction, CategorizationStatus } from '../../types'
import { hasMatch, isCredit } from '../../utils/bankTransactions'
import { Badge } from '../Badge'
import { extractDescriptionForSplit } from '../BankTransactionRow/BankTransactionRow'
import { MatchBadge } from '../BankTransactionRow/MatchBadge'
import { SplitTooltipDetails } from '../BankTransactionRow/SplitTooltipDetails'
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
      {!editable &&
        bankTransaction.categorization_status && [
          CategorizationStatus.SPLIT,
          CategorizationStatus.MATCHED,
        ] && (
          <div className={classNames(`${className}__value`, !open && 'open')}>
            {!editable ? (
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
                        dateFormat={DATE_FORMAT}
                      />
                      <span className={`${className}__category-text__text`}>
                        {`${formatTime(
                          parseISO(bankTransaction.match.bank_transaction.date),
                          DATE_FORMAT,
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
          </div>
        )}
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
