import { useContext, useEffect, useRef, useState, useMemo, type ReactNode } from 'react'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import FileIcon from '@icons/File'
import { BankTransaction } from '@internal-types/bank_transactions'
import { CategorizationStatus } from '@schemas/bankTransactions/bankTransaction'
import { hasReceipts, isCredit } from '@utils/bankTransactions'
import { TransactionToOpenContext } from '@components/BankTransactionsMobileList/TransactionToOpenContext'
import classNames from 'classnames'
import { useEffectiveBookkeepingStatus } from '@hooks/bookkeeping/useBookkeepingStatus'
import { isCategorizationEnabledForStatus } from '@utils/bookkeeping/isCategorizationEnabled'
import { useDelayedVisibility } from '@hooks/visibility/useDelayedVisibility'
import { Span } from '@ui/Typography/Text'
import { useBulkSelectionActions, useIdIsSelected } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { VStack, HStack } from '@ui/Stack/Stack'
import { BankTransactionsMobileListItemCheckbox } from '@components/BankTransactionsMobileList/BankTransactionsMobileListItemCheckbox'
import { BankTransactionsMobileListItemCategory } from '@components/BankTransactionsMobileList/BankTransactionsMobileListItemCategory'
import { isCategorized } from '@components/BankTransactions/utils'
import { BankTransactionsProcessingInfo } from '@components/BankTransactionsList/BankTransactionsProcessingInfo'
import { useInAppLinkContext, type LinkingMetadata } from '@contexts/InAppLinkContext'
import { decodeMatchDetails, convertMatchDetailsToLinkingMetadata } from '@schemas/bankTransactions/match'
import { extractDescriptionForSplit } from '@components/BankTransactionRow/BankTransactionRow'
import { BankTransactionsMobileListItemExpandedRow } from '@components/BankTransactionsMobileList/BankTransactionsMobileListItemExpandedRow'
import './bankTransactionsMobileListItem.scss'
import { BankTransactionsAmountDate } from '@components/BankTransactions/BankTransactionsAmountDate'

export interface BankTransactionsMobileListItemProps {
  index: number
  bankTransaction: BankTransaction
  editable: boolean
  removeTransaction: (bt: BankTransaction) => void
  initialLoad?: boolean
  isFirstItem?: boolean
  bulkActionsEnabled?: boolean

  showDescriptions: boolean
  showReceiptUploads: boolean
  showTooltips: boolean
}

export enum Purpose {
  business = 'business',
  personal = 'personal',
  more = 'more',
}

const getAssignedValue = (
  bankTransaction: BankTransaction,
  renderInAppLink?: (details: LinkingMetadata) => ReactNode,
) => {
  if (bankTransaction.categorization_status === CategorizationStatus.SPLIT) {
    return extractDescriptionForSplit(bankTransaction.category)
  }

  if (bankTransaction.categorization_status === CategorizationStatus.MATCHED) {
    if (renderInAppLink && bankTransaction.match?.details) {
      const matchDetails = bankTransaction.match.details ? decodeMatchDetails(bankTransaction.match.details) : undefined
      const inAppLink = matchDetails ? renderInAppLink(convertMatchDetailsToLinkingMetadata(matchDetails)) : undefined
      if (inAppLink) return inAppLink
    }
    return bankTransaction.match?.details?.description
  }

  return bankTransaction.category?.display_name
}

export const BankTransactionsMobileListItem = ({
  index,
  bankTransaction,
  removeTransaction,
  editable,
  initialLoad,
  isFirstItem = false,
  bulkActionsEnabled = false,
  showDescriptions,
  showReceiptUploads,
  showTooltips,
}: BankTransactionsMobileListItemProps) => {
  const {
    transactionIdToOpen,
    setTransactionIdToOpen,
    clearTransactionIdToOpen,
  } = useContext(TransactionToOpenContext)

  const { shouldHideAfterCategorize } = useBankTransactionsContext()
  const categorized = isCategorized(bankTransaction)

  const itemRef = useRef<HTMLLIElement>(null)

  const [open, setOpen] = useState(isFirstItem)

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

  const fullAccountName = useMemo(() => {
    return (
      <Span ellipsis size='sm'>
        {bankTransaction.account_institution?.name && `${bankTransaction.account_institution.name} — `}
        {bankTransaction.account_name}
        {bankTransaction.account_mask && ` ${bankTransaction.account_mask}`}
      </Span>
    )
  }, [
    bankTransaction.account_institution?.name,
    bankTransaction.account_name,
    bankTransaction.account_mask,
  ])

  useEffect(() => {
    if (transactionIdToOpen && transactionIdToOpen === bankTransaction.id) {
      setOpen(true)
      clearTransactionIdToOpen()
    }
  }, [bankTransaction.id, clearTransactionIdToOpen, transactionIdToOpen])

  useEffect(() => {
    if (bankTransaction.recently_categorized) {
      if (editable && shouldHideAfterCategorize()) {
        setTimeout(() => {
          removeTransaction(bankTransaction)
          openNext()
        }, 300)
      }
      else {
        close()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    bankTransaction.recently_categorized,
    bankTransaction.category,
    bankTransaction.match,
  ])

  const toggleOpen = () => {
    setOpen(!open)
  }

  const close = () => {
    setOpen(false)
  }

  const checkboxContainerRef = useRef<HTMLDivElement>(null)

  const handleRowClick = (event: React.MouseEvent) => {
    // Check if click is already on checkbox
    if (checkboxContainerRef.current?.contains(event.target as Node)) {
      return
    }

    // Toggle selection if bulk actions enabled
    if (bulkActionsEnabled) {
      if (isTransactionSelected) {
        deselect(bankTransaction.id)
      }
      else {
        select(bankTransaction.id)
      }
      return
    }

    // Else, expand row
    toggleOpen()
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankTransaction.recently_categorized])

  useEffect(() => {
    if (bulkActionsEnabled) {
      close()
    }
  }, [bulkActionsEnabled])

  const bookkeepingStatus = useEffectiveBookkeepingStatus()
  const categorizationEnabled = isCategorizationEnabledForStatus(bookkeepingStatus)
  const { select, deselect } = useBulkSelectionActions()
  const isSelected = useIdIsSelected()
  const isTransactionSelected = isSelected(bankTransaction.id)
  const { renderInAppLink } = useInAppLinkContext()

  const { isVisible } = useDelayedVisibility({ delay: index * 20, initialVisibility: Boolean(initialLoad) })

  const className = 'Layer__bank-transaction-mobile-list-item'
  const openClassName = open ? `${className}--expanded` : ''
  const rowClassName = classNames(
    className,
    open ? openClassName : '',
    isVisible ? 'show' : '',
  )

  return (
    <li ref={itemRef} className={rowClassName} data-item={bankTransaction.id}>

      <VStack>
        <div
          onClick={handleRowClick}
          role='button'
        >
          <HStack
            gap='md'
            justify='space-between'
            align='center'
            pie='md'
          >
            <HStack align='center'>
              <BankTransactionsMobileListItemCheckbox
                bulkActionsEnabled={bulkActionsEnabled}
                bankTransaction={bankTransaction}
                checkboxContainerRef={checkboxContainerRef}
              />

              <VStack
                align='start'
                gap='3xs'
                className='Layer__bankTransactionsMobileListItem__headingContentLeft'
                pi='md'
                pb='sm'
              >
                <Span ellipsis>
                  {bankTransaction.counterparty_name ?? bankTransaction.description}
                </Span>
                <Span className='Layer__bankTransactionsMobileListItem__categorizedValue'>
                  {categorized && bankTransaction.categorization_status
                    ? getAssignedValue(bankTransaction, renderInAppLink)
                    : null}
                </Span>
                <HStack gap='2xs' align='center'>
                  <Span size='sm' ellipsis>
                    {fullAccountName}
                  </Span>
                  {hasReceipts(bankTransaction) ? <FileIcon size={12} /> : null}
                </HStack>

                {!categorizationEnabled && !categorized
                  ? (
                    <BankTransactionsProcessingInfo />
                  )
                  : null}
              </VStack>
            </HStack>

            <BankTransactionsAmountDate
              amount={bankTransaction.amount}
              date={bankTransaction.date}
              slotProps={{
                MoneySpan: {
                  size: 'md',
                  displayPlusSign: isCredit(bankTransaction),
                },
              }}
            />
          </HStack>
          {!open
            && (
              <BankTransactionsMobileListItemCategory
                bankTransaction={bankTransaction}
              />
            )}
        </div>
        { open
          && (
            <BankTransactionsMobileListItemExpandedRow
              bankTransaction={bankTransaction}
              showCategorization={categorizationEnabled}
              showDescriptions={showDescriptions}
              showReceiptUploads={showReceiptUploads}
              showTooltips={showTooltips}
            />
          )}

      </VStack>

    </li>
  )
}
