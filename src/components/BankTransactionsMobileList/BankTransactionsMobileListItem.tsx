import React, { ReactNode, useContext, useEffect, useRef, useState, useMemo, type ChangeEvent } from 'react'
import { useBankTransactionsContext } from '../../contexts/BankTransactionsContext'
import { useElementSize } from '../../hooks/useElementSize'
import FileIcon from '../../icons/File'
import { centsToDollars as formatMoney } from '../../models/Money'
import { BankTransaction } from '../../types/bank_transactions'
import { CategorizationStatus } from '../../schemas/bankTransactions/bankTransaction'
import { hasMatch, hasReceipts, isCredit } from '../../utils/bankTransactions'
import { extractDescriptionForSplit } from '../BankTransactionRow/BankTransactionRow'
import { isCategorized } from '../BankTransactions/utils'
import { CloseButton } from '../Button'
import { Toggle, ToggleSize } from '../Toggle/Toggle'
import { Text } from '../Typography'
import { BankTransactionMobileForms } from './BankTransactionsMobileForms'
import { TransactionToOpenContext } from './TransactionToOpenContext'
import classNames from 'classnames'
import { parseISO, format as formatTime } from 'date-fns'
import { useEffectiveBookkeepingStatus } from '../../hooks/bookkeeping/useBookkeepingStatus'
import { isCategorizationEnabledForStatus } from '../../utils/bookkeeping/isCategorizationEnabled'
import { BankTransactionsProcessingInfo } from '../BankTransactionsList/BankTransactionsProcessingInfo'
import { useDelayedVisibility } from '../../hooks/visibility/useDelayedVisibility'
import { LinkingMetadata, useInAppLinkContext } from '../../contexts/InAppLinkContext'
import { convertMatchDetailsToLinkingMetadata, decodeMatchDetails } from '../../schemas/bankTransactions/match'
import { Span } from '../ui/Typography/Text'
import { Checkbox } from '../ui/Checkbox/Checkbox'
import { useBulkSelectionActions, useIdIsSelected } from '../../providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { VStack } from '../ui/Stack/Stack'
import { useBankTransactionsCategoryActions, useGetBankTransactionCategory } from '../../providers/BankTransactionsCategoryStore/BankTransactionsCategoryStoreProvider'

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

const DATE_FORMAT = 'LLL d'

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
  const { renderInAppLink } = useInAppLinkContext()

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
    if (!removeAnim && bankTransaction.recently_categorized) {
      if (editable && shouldHideAfterCategorize()) {
        setRemoveAnim(true)
        openNext()
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
    if (open) {
      setHeight(0)
    }
    setOpen(!open)
  }

  const close = () => {
    setOpen(false)
    setHeight(0)
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

  const onChangePurpose = (event: ChangeEvent<HTMLInputElement>) =>
    setPurpose(event.target.value as Purpose)

  const bookkeepingStatus = useEffectiveBookkeepingStatus()
  const categorizationEnabled = isCategorizationEnabledForStatus(bookkeepingStatus)

  const categorized = isCategorized(bankTransaction)

  const { select, deselect } = useBulkSelectionActions()
  const isSelected = useIdIsSelected()
  const isTransactionSelected = isSelected(bankTransaction.id)

  const { setTransactionCategory } = useBankTransactionsCategoryActions()
  const { selectedCategory } = useGetBankTransactionCategory(bankTransaction.id)

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
        onClick={handleRowClick}
        role='button'
        style={{ height: headingHeight }}
      >
        <div className={`${className}__heading__content`} ref={headingRowRef}>
          {categorizationEnabled && bulkActionsEnabled && (
            <VStack align='center' pie='xs' ref={checkboxContainerRef}>
              <Checkbox
                size='md'
                isSelected={isTransactionSelected}
                onChange={(selected) => {
                  if (selected) {
                    select(bankTransaction.id)
                  }
                  else {
                    deselect(bankTransaction.id)
                  }
                }}
              />
            </VStack>
          )}
          <div className={`${className}__heading__main`}>
            <Text as='span' className={`${className}__heading__tx-name`}>
              {bankTransaction.counterparty_name ?? bankTransaction.description}
            </Text>
            <Text as='span' className={`${className}__heading__account-name`}>
              {categorized && bankTransaction.categorization_status
                ? getAssignedValue(bankTransaction, renderInAppLink)
                : null}
              {!categorized && fullAccountName}
              {hasReceipts(bankTransaction) ? <FileIcon size={12} /> : null}
            </Text>
            {categorized && fullAccountName}
            {!categorizationEnabled && !categorized
              ? <BankTransactionsProcessingInfo />
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

              selectedCategory={selectedCategory}
              onCategoryChange={(category) => setTransactionCategory(bankTransaction.id, category)}

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
