import { ReactNode, useContext, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useBankTransactionsContext } from '../../contexts/BankTransactionsContext'
import { useElementSize } from '../../hooks/useElementSize'
import FileIcon from '../../icons/File'
import { centsToDollars as formatMoney } from '../../models/Money'
import { BankTransaction, CategorizationStatus } from '../../types'
import { hasMatch, hasReceipts, isCredit } from '../../utils/bankTransactions'
import { extractDescriptionForSplit } from '../BankTransactionRow/BankTransactionRow'

import { isCategorized } from '../BankTransactions/utils'
import { CloseButton } from '../Button'
import { Toggle } from '../Toggle'
import { ToggleSize } from '../Toggle/Toggle'
import { Text } from '../Typography'
import { BankTransactionMobileForms } from './BankTransactionMobileForms'
import { TransactionToOpenContext } from './TransactionToOpenContext'
import classNames from 'classnames'
import { parseISO, format as formatTime } from 'date-fns'
import { useEffectiveBookkeepingStatus } from '../../hooks/bookkeeping/useBookkeepingStatus'
import { isCategorizationEnabledForStatus } from '../../utils/bookkeeping/isCategorizationEnabled'
import { BankTransactionProcessingInfo } from '../BankTransactionList/BankTransactionProcessingInfo'
import { useDelayedVisibility } from '../../hooks/visibility/useDelayedVisibility'
import { LinkingMetadata, useInAppLinkContext } from '../../contexts/InAppLinkContext'
import { convertMatchDetailsToLinkingMetadata } from '../../schemas/matchSchemas'

export interface BankTransactionMobileListItemProps {
  index: number
  bankTransaction: BankTransaction
  editable: boolean
  removeTransaction: (bt: BankTransaction) => void
  initialLoad?: boolean
  isFirstItem?: boolean

  showDescriptions: boolean
  showReceiptUploads: boolean
  showTooltips: boolean
}

export enum Purpose {
  business = 'business',
  personal = 'personal',
  more = 'more',
}

const DATE_FORMAT = 'LLL d'

const getAssignedValue = (
  bankTransaction: BankTransaction,
  convertToInAppLink?: (details: LinkingMetadata) => ReactNode | undefined,
) => {
  if (bankTransaction.categorization_status === CategorizationStatus.SPLIT) {
    return extractDescriptionForSplit(bankTransaction.category)
  }

  if (bankTransaction.categorization_status === CategorizationStatus.MATCHED) {
    if (convertToInAppLink && bankTransaction.match?.details) {
      const inAppLink = convertToInAppLink(convertMatchDetailsToLinkingMetadata(bankTransaction.match.details))
      if (inAppLink) return inAppLink
    }
    return bankTransaction.match?.details?.description
  }

  return bankTransaction.category?.display_name
}

export const BankTransactionMobileListItem = ({
  index,
  bankTransaction,
  removeTransaction,
  editable,
  initialLoad,
  isFirstItem = false,

  showDescriptions,
  showReceiptUploads,
  showTooltips,
}: BankTransactionMobileListItemProps) => {
  const {
    transactionIdToOpen,
    setTransactionIdToOpen,
    clearTransactionIdToOpen,
  } = useContext(TransactionToOpenContext)

  const { shouldHideAfterCategorize } = useBankTransactionsContext()
  const { convertToInAppLink } = useInAppLinkContext()

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
      ? bankTransaction.category.type === 'ExclusionNested'
        ? Purpose.personal
        : bankTransaction.categorization_status === CategorizationStatus.SPLIT
          ? Purpose.more
          : Purpose.business
      : hasMatch(bankTransaction)
        ? Purpose.more
        : Purpose.business,
  )
  const [open, setOpen] = useState(isFirstItem)
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
      if (editable && shouldHideAfterCategorize()) {
        setRemoveAnim(true)
        openNext()
      }
      else {
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
    if (
      editable
      && bankTransaction.recently_categorized
      && shouldHideAfterCategorize()
    ) {
      setTimeout(() => {
        removeTransaction(bankTransaction)
      }, 300)
    }
  }, [bankTransaction.recently_categorized])

  const onChangePurpose = (event: ChangeEvent<HTMLInputElement>) =>
    setPurpose(event.target.value as Purpose)

  const bookkeepingStatus = useEffectiveBookkeepingStatus()
  const categorizationEnabled = isCategorizationEnabledForStatus(bookkeepingStatus)

  const categorized = isCategorized(bankTransaction)

  const { isVisible } = useDelayedVisibility({ delay: index * 20, initialVisibility: Boolean(initialLoad) })

  const className = 'Layer__bank-transaction-mobile-list-item'
  const openClassName = open ? `${className}--expanded` : ''
  const rowClassName = classNames(
    className,
    removeAnim ? 'Layer__bank-transaction-row--removing' : '',
    open ? openClassName : '',
    isVisible ? 'show' : '',
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
                ? getAssignedValue(bankTransaction, convertToInAppLink)
                : null}
              <span>{!categorized && bankTransaction.account_name}</span>
              {hasReceipts(bankTransaction) ? <FileIcon size={12} /> : null}
            </Text>
            {categorized && (
              <Text as='span' className={`${className}__categorized-name`}>
                {bankTransaction.account_name}
              </Text>
            )}
            {!categorizationEnabled && !categorized
              ? <BankTransactionProcessingInfo />
              : null}
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
      <div
        className={`${className}__expanded-row`}
        style={{ height: !open || removeAnim ? 0 : height }}
      >
        {open && (
          <div
            className={`${className}__expanded-row__content`}
            ref={formRowRef}
          >
            {categorizationEnabled
              ? (
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
              )
              : null}
            <BankTransactionMobileForms
              isOpen={open}
              purpose={purpose}
              bankTransaction={bankTransaction}

              showCategorization={categorizationEnabled}
              showDescriptions={showDescriptions}
              showReceiptUploads={showReceiptUploads}
              showTooltips={showTooltips}
            />
          </div>
        )}
      </div>
    </li>
  )
}
