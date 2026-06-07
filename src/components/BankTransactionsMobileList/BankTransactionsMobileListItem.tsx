import { type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import classNames from 'classnames'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { CategorizationStatus } from '@schemas/bankTransactions/bankTransaction'
import { convertMatchDetailsToLinkingMetadata, decodeMatchDetails } from '@schemas/bankTransactions/match'
import { hasReceipts, isCategorized, isCredit } from '@utils/bankTransactions/shared'
import { useDelayedRemoveBankTransaction } from '@hooks/features/bankTransactions/useDelayedRemoveBankTransaction'
import { useGetBankTransactionCategorizationWithDefault } from '@hooks/features/bankTransactions/useGetBankTransactionCategorizationWithDefault'
import { useDelayedVisibility } from '@hooks/utils/visibility/useDelayedVisibility'
import {
  type BankTransactionCategorization,
  BankTransactionSelectionVariant,
} from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { useBulkSelectionActions, useIdIsSelected } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { useBankTransactionsIsCategorizationEnabledContext } from '@contexts/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import { type LinkingMetadata, useInAppLinkContext } from '@contexts/InAppLinkContext'
import FileIcon from '@icons/File'
import { AnimatedPresenceElement } from '@ui/AnimatedPresenceElement/AnimatedPresenceElement'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { isSplitAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { BankTransactionsAmountDate } from '@components/BankTransactions/BankTransactionsAmountDate'
import { BankTransactionsListItemCategory } from '@components/BankTransactions/BankTransactionsListItemCategory/BankTransactionsListItemCategory'
import { BankTransactionsProcessingInfo } from '@components/BankTransactionsList/BankTransactionsProcessingInfo'
import { BankTransactionsMobileListItemCheckbox } from '@components/BankTransactionsMobileList/BankTransactionsMobileListItemCheckbox'
import { BankTransactionsMobileListItemExpandedRow } from '@components/BankTransactionsMobileList/BankTransactionsMobileListItemExpandedRow'
import { TransactionToOpenContext } from '@components/BankTransactionsMobileList/TransactionToOpenContext'

import './bankTransactionsMobileListItem.scss'

export interface BankTransactionsMobileListItemProps {
  index: number
  bankTransaction: BankTransaction
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
    bankTransaction.categorizationStatus === CategorizationStatus.MATCHED
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
  initialLoad,
  isFirstItem = false,
  bulkActionsEnabled = false,
  showDescriptions,
  showReceiptUploads,
  showTooltips,
}: BankTransactionsMobileListItemProps) => {
  const { shouldHideAfterCategorize } = useBankTransactionsContext()
  const { setTransactionIdToOpen, transactionIdToOpen, clearTransactionIdToOpen } = useContext(TransactionToOpenContext)

  const selectedCategorization = useGetBankTransactionCategorizationWithDefault(bankTransaction)
  const [purpose, setPurpose] = useState(() => getPurposeFromStore(selectedCategorization))

  const categorized = isCategorized(bankTransaction)
  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabledContext()

  const { select, deselect } = useBulkSelectionActions()
  const isSelected = useIdIsSelected()
  const isTransactionSelected = isSelected(bankTransaction.id)

  const { renderInAppLink } = useInAppLinkContext()

  const itemRef = useRef<HTMLLIElement>(null)

  const openNext = useCallback(() => {
    if (itemRef.current?.nextSibling) {
      const txId = (itemRef.current.nextSibling as HTMLLIElement).getAttribute('data-item')
      if (txId) {
        setTransactionIdToOpen(txId)
      }
    }
  }, [setTransactionIdToOpen])

  const { isBeingRemoved } = useDelayedRemoveBankTransaction({ bankTransaction, onRemove: openNext })

  // Keep showing as uncategorized during removal animation to prevent UI flashing
  const displayAsCategorized = isBeingRemoved ? false : categorized

  const [open, setOpen] = useState(isFirstItem)

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

  // Open item when transaction set open by the context (e.g., when the last item is categorized)
  useEffect(() => {
    if (transactionIdToOpen === bankTransaction.id) {
      setOpen(true)
      clearTransactionIdToOpen()
    }
  }, [bankTransaction.id, transactionIdToOpen, clearTransactionIdToOpen])

  // Close item when transaction is re-categorized/re-matched
  useEffect(() => {
    if (bankTransaction.recentlyCategorized && !shouldHideAfterCategorize) {
      close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    bankTransaction.recentlyCategorized,
    bankTransaction.match,
    bankTransaction.category,
  ])

  // Close all rows when bulk actions enabled, open first item when bulk actions becomes disabled
  useEffect(() => {
    if (bulkActionsEnabled) {
      close()
    }
    else if (isFirstItem) {
      setOpen(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bulkActionsEnabled])

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
    <AnimatedPresenceElement as='li' variant='fade' isOpen={!isBeingRemoved} motionKey={bankTransaction.id} ref={itemRef} className={rowClassName} data-item={bankTransaction.id}>
      <VStack>
        <div onClick={handleRowClick} role='button'>
          <HStack gap='sm' justify='space-between' pie='md'>
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
                  {bankTransaction.counterpartyName ?? bankTransaction.description}
                </Span>
                {inAppLink && (
                  <Span className='Layer__BankTransactionsMobileListItem__CategorizedValue'>
                    {inAppLink}
                  </Span>
                )}
                <HStack gap='2xs' align='center'>
                  <Span size='sm' ellipsis>
                    <Span ellipsis size='sm'>
                      {bankTransaction.accountInstitution?.name && `${bankTransaction.accountInstitution.name} — `}
                      {bankTransaction.accountName}
                      {bankTransaction.accountMask && ` ${bankTransaction.accountMask}`}
                    </Span>
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
        <AnimatedPresenceElement variant='expand' isOpen={open} motionKey={`${bankTransaction.id}--expanded`}>
          <BankTransactionsMobileListItemExpandedRow
            bankTransaction={bankTransaction}
            isOpen={open}
            purpose={purpose}
            setPurpose={setPurpose}
            showCategorization={isCategorizationEnabled}
            showDescriptions={showDescriptions}
            showReceiptUploads={showReceiptUploads}
            showTooltips={showTooltips}
          />
        </AnimatedPresenceElement>
      </VStack>
    </AnimatedPresenceElement>
  )
}

const getPurposeFromStore = (selectedCategorization: BankTransactionCategorization): Purpose => {
  if (selectedCategorization.variant === BankTransactionSelectionVariant.MATCH) {
    return Purpose.more
  }

  const category = selectedCategorization.category
  if (category === null) {
    return Purpose.business
  }

  if (isSplitAsOption(category)) {
    return category.isSingleSplit ? Purpose.business : Purpose.more
  }

  return Purpose.business
}
