import { type ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react'
import classNames from 'classnames'

import { type BankTransaction } from '@internal-types/bank_transactions'
import { CategorizationStatus } from '@schemas/bankTransactions/bankTransaction'
import { convertMatchDetailsToLinkingMetadata, decodeMatchDetails } from '@schemas/bankTransactions/match'
import { hasReceipts, isCredit } from '@utils/bankTransactions'
import { useDelayedVisibility } from '@hooks/visibility/useDelayedVisibility'
import { useBulkSelectionActions, useIdIsSelected } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { useBankTransactionsIsCategorizationEnabledContext } from '@contexts/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import { type LinkingMetadata, useInAppLinkContext } from '@contexts/InAppLinkContext'
import FileIcon from '@icons/File'
import { AnimatedPresenceDiv } from '@ui/AnimatedPresenceDiv/AnimatedPresenceDiv'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { BankTransactionsAmountDate } from '@components/BankTransactions/BankTransactionsAmountDate'
import { BankTransactionsListItemCategory } from '@components/BankTransactions/BankTransactionsListItemCategory/BankTransactionsListItemCategory'
import { isCategorized } from '@components/BankTransactions/utils'
import { BankTransactionsProcessingInfo } from '@components/BankTransactionsList/BankTransactionsProcessingInfo'
import { BankTransactionsMobileListItemCheckbox } from '@components/BankTransactionsMobileList/BankTransactionsMobileListItemCheckbox'
import { BankTransactionsMobileListItemExpandedRow } from '@components/BankTransactionsMobileList/BankTransactionsMobileListItemExpandedRow'
import { TransactionToOpenContext } from '@components/BankTransactionsMobileList/TransactionToOpenContext'

import './bankTransactionsMobileListItem.scss'

export interface BankTransactionsMobileListItemProps {
  index: number
  bankTransaction: BankTransaction
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

const getInAppLink = (
  bankTransaction: BankTransaction,
  renderInAppLink?: (details: LinkingMetadata) => ReactNode,
) => {
  if (
    bankTransaction.categorization_status === CategorizationStatus.MATCHED
    && renderInAppLink
    && bankTransaction.match?.details
  ) {
    const matchDetails = decodeMatchDetails(bankTransaction.match.details)
    if (matchDetails) {
      return renderInAppLink(convertMatchDetailsToLinkingMetadata(matchDetails))
    }
  }
  return null
}

export const BankTransactionsMobileListItem = ({
  index,
  bankTransaction,
  removeTransaction,
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

  // Keep showing as uncategorized during removal animation to prevent UI flashing
  const displayAsCategorized = bankTransaction.recently_categorized && shouldHideAfterCategorize
    ? false
    : categorized

  const [open, setOpen] = useState(isFirstItem)

  const openNext = () => {
    if (itemRef.current && itemRef.current.nextSibling) {
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
      if (shouldHideAfterCategorize) {
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
      bankTransaction.recently_categorized
      && shouldHideAfterCategorize
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

  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabledContext()
  const { select, deselect } = useBulkSelectionActions()
  const isSelected = useIdIsSelected()
  const isTransactionSelected = isSelected(bankTransaction.id)
  const { renderInAppLink } = useInAppLinkContext()

  const inAppLink = useMemo(() => {
    if (!displayAsCategorized) {
      return null
    }
    return getInAppLink(bankTransaction, renderInAppLink)
  }, [displayAsCategorized, bankTransaction, renderInAppLink])

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
            gap='sm'
            justify='space-between'
            pie='md'
          >
            <HStack align='center' overflow='hidden'>
              <BankTransactionsMobileListItemCheckbox
                bulkActionsEnabled={bulkActionsEnabled}
                bankTransaction={bankTransaction}
                checkboxContainerRef={checkboxContainerRef}
              />

              <VStack
                align='start'
                gap='3xs'
                className='Layer__BankTransactionsMobileListItem__HeadingContentLeft'
                pi='md'
                pb='sm'
              >
                <Span ellipsis>
                  {bankTransaction.counterparty_name ?? bankTransaction.description}
                </Span>
                {inAppLink && (
                  <Span className='Layer__BankTransactionsMobileListItem__CategorizedValue'>
                    {inAppLink}
                  </Span>
                )}
                <HStack gap='2xs' align='center'>
                  <Span size='sm' ellipsis>
                    {fullAccountName}
                  </Span>
                  {hasReceipts(bankTransaction) ? <FileIcon size={12} /> : null}
                </HStack>
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
          {!open && (
            !isCategorizationEnabled && !displayAsCategorized
              ? (
                <BankTransactionsProcessingInfo showAsBadge />
              )
              : (
                <BankTransactionsListItemCategory
                  bankTransaction={bankTransaction}
                  mobile
                />
              )
          )}
        </div>
        <AnimatedPresenceDiv variant='expand' isOpen={open} key={`expanded-${bankTransaction.id}`}>
          <BankTransactionsMobileListItemExpandedRow
            bankTransaction={bankTransaction}
            isOpen={open}
            showCategorization={isCategorizationEnabled}
            showDescriptions={showDescriptions}
            showReceiptUploads={showReceiptUploads}
            showTooltips={showTooltips}
          />
        </AnimatedPresenceDiv>

      </VStack>

    </li>
  )
}
