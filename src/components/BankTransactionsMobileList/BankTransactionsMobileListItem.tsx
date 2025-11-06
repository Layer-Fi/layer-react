import React, { useContext, useEffect, useRef, useState, useMemo, type ChangeEvent } from 'react'
import { useBankTransactionsContext } from '../../contexts/BankTransactionsContext'
import { useElementSize } from '../../hooks/useElementSize'
import FileIcon from '../../icons/File'
import { BankTransaction } from '../../types/bank_transactions'
import { CategorizationStatus } from '../../schemas/bankTransactions/bankTransaction'
import { hasMatch, hasReceipts, isCredit } from '../../utils/bankTransactions'
import { CloseButton } from '../Button'
import { Toggle, ToggleSize } from '../Toggle/Toggle'
import { BankTransactionMobileForms } from './BankTransactionsMobileForms'
import { TransactionToOpenContext } from './TransactionToOpenContext'
import classNames from 'classnames'
import { useEffectiveBookkeepingStatus } from '../../hooks/bookkeeping/useBookkeepingStatus'
import { isCategorizationEnabledForStatus } from '../../utils/bookkeeping/isCategorizationEnabled'
import { useDelayedVisibility } from '../../hooks/visibility/useDelayedVisibility'
import { Span } from '../ui/Typography/Text'
import { useBulkSelectionActions, useIdIsSelected } from '../../providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { VStack } from '../ui/Stack/Stack'
import { MoneySpan } from '../ui/Typography/MoneySpan'
import { DateTime } from '../DateTime'
import { HStack } from '../ui/Stack/Stack'
import { BankTransactionsMobileListItemCheckbox } from './BankTransactionsMobileListItemCheckbox'
import { BankTransactionsMobileListItemCategory } from './BankTransactionsMobileListItemCategory'
import './bankTransactionsMobileListItem.scss'

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
  const { select, deselect } = useBulkSelectionActions()
  const isSelected = useIdIsSelected()
  const isTransactionSelected = isSelected(bankTransaction.id)

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
      <div
        onClick={handleRowClick}
        role='button'
        style={{
          height: headingHeight,
        }}
      >
        <VStack
          ref={headingRowRef}
        >
          <HStack
            gap='md'
            justify='space-between'
            align='center'
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
                className='Layer__bank-transaction-mobile-list-item__heading__content__left'
                pi='md'
                pb='md'
              >
                <Span ellipsis>
                  {bankTransaction.counterparty_name ?? bankTransaction.description}
                </Span>
                <HStack gap='2xs' align='center'>
                  <Span size='sm' ellipsis>
                    {fullAccountName}
                  </Span>
                  {hasReceipts(bankTransaction) ? <FileIcon size={12} /> : null}
                </HStack>

                {/* TODO: CHECK HOW THIS LOOKS DO NOT LET JIM MERGE WITHOUT TESTING THIS */}
                {/* {!categorizationEnabled && !categorized
              ? <BankTransactionsProcessingInfo />
              : null} */}
              </VStack>
            </HStack>

            <VStack
              align='end'
              gap='3xs'
              pi='md'
              pb='md'
            >

              <Span size='md'>
                {isCredit(bankTransaction) ? '+' : ''}
                <MoneySpan
                  amount={bankTransaction.amount}
                />
              </Span>

              <DateTime
                value={bankTransaction.date}
                dateFormat={DATE_FORMAT}
                onlyDate
                slotProps={{
                  Date: { size: 'sm', variant: 'subtle' },
                }}
              />
            </VStack>
          </HStack>
          <BankTransactionsMobileListItemCategory
            bankTransaction={bankTransaction}
            className={`${className}__category`}
          />
        </VStack>
      </div>
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
