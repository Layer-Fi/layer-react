import { TextSize, Text } from '@components/Typography/Text'
import { RetryButton } from '@components/Button/RetryButton'
import { IconButton } from '@components/Button/IconButton'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import AlertCircle from '@icons/AlertCircle'
import ChevronDownFill from '@icons/ChevronDownFill'
import FileIcon from '@icons/File'
import { BankTransaction } from '@internal-types/bank_transactions'
import {
  isCredit,
} from '@utils/bankTransactions'
import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import {
  BankTransactionCTAStringOverrides,
} from '@components/BankTransactions/BankTransactions'
import { isCategorized } from '@components/BankTransactions/utils'
import { SubmitAction, SubmitButton } from '@components/Button/SubmitButton'
import { ExpandedBankTransactionRow } from '@components/ExpandedBankTransactionRow/ExpandedBankTransactionRow'
import { SaveHandle } from '@components/ExpandedBankTransactionRow/ExpandedBankTransactionRow'
import { IconBox } from '@components/IconBox/IconBox'
import classNames from 'classnames'
import { parseISO, format as formatTime } from 'date-fns'
import { useEffectiveBookkeepingStatus } from '@hooks/bookkeeping/useBookkeepingStatus'
import { isCategorizationEnabledForStatus } from '@utils/bookkeeping/isCategorizationEnabled'
import { BankTransactionsProcessingInfo } from '@components/BankTransactionsList/BankTransactionsProcessingInfo'
import { VStack } from '@ui/Stack/Stack'
import { useDelayedVisibility } from '@hooks/visibility/useDelayedVisibility'
import { Span } from '@ui/Typography/Text'
import { Checkbox } from '@ui/Checkbox/Checkbox'
import { useBulkSelectionActions, useIdIsSelected } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { BankTransactionCategoryComboBox } from '@components/BankTransactionCategoryComboBox/BankTransactionCategoryComboBox'
import { type BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { isSplitCategorizationEncoded, type CategorizationEncoded } from '@schemas/categorization'
import { useBankTransactionsCategoryActions, useGetBankTransactionCategory } from '@providers/BankTransactionsCategoryStore/BankTransactionsCategoryStoreProvider'
import { useSaveBankTransactionRow } from '@hooks/useBankTransactions/useSaveBankTransactionRow'
import { HStack } from '@ui/Stack/Stack'
import { BankTransactionsCategorizedSelectedValue } from '@components/BankTransactionsSelectedValue/BankTransactionsCategorizedSelectedValue'
import { MoneySpan } from '@components/ui/Typography/MoneySpan'
import './bankTransactionRow.scss'
import { AnimatedPresenceDiv } from '@components/ui/AnimatedPresenceDiv/AnimatedPresenceDiv'

type Props = {
  index: number
  editable: boolean
  dateFormat: string
  bankTransaction: BankTransaction
  removeTransaction: (bt: BankTransaction) => void
  containerWidth?: number
  initialLoad?: boolean
  showDescriptions: boolean
  showReceiptUploads: boolean
  showReceiptUploadColumn: boolean
  showTooltips: boolean
  stringOverrides?: BankTransactionCTAStringOverrides
}

export type LastSubmittedForm = 'simple' | 'match' | 'split' | undefined

export const extractDescriptionForSplit = (category: CategorizationEncoded | null) => {
  if (!category || !isSplitCategorizationEncoded(category)) {
    return ''
  }

  return category.entries.map(c => c.category.display_name).join(', ')
}

let clickTimer = Date.now()

export const BankTransactionRow = ({
  index,
  editable,
  dateFormat,
  bankTransaction,
  removeTransaction,
  containerWidth,
  initialLoad,
  showDescriptions,
  showReceiptUploads,
  showReceiptUploadColumn,
  showTooltips,
  stringOverrides,
}: Props) => {
  const expandedRowRef = useRef<SaveHandle>(null)
  const [showRetry, setShowRetry] = useState(false)
  const { shouldHideAfterCategorize } = useBankTransactionsContext()
  const [open, setOpen] = useState(false)
  const toggleOpen = () => {
    setShowRetry(false)
    setOpen(!open)
  }

  const bookkeepingStatus = useEffectiveBookkeepingStatus()
  const categorizationEnabled = isCategorizationEnabledForStatus(bookkeepingStatus)

  const categorized = isCategorized(bankTransaction)

  const { isVisible } = useDelayedVisibility({ delay: index * 20, initialVisibility: Boolean(initialLoad) })

  const { select, deselect } = useBulkSelectionActions()
  const isSelected = useIdIsSelected()
  const isTransactionSelected = isSelected(bankTransaction.id)
  const { setTransactionCategory } = useBankTransactionsCategoryActions()
  const { selectedCategory } = useGetBankTransactionCategory(bankTransaction.id)
  const { saveBankTransactionRow } = useSaveBankTransactionRow()

  useEffect(() => {
    if (bankTransaction.error) {
      setShowRetry(true)
    }
  }, [bankTransaction.error])

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

  const save = async () => {
    // Save using form from expanded row when row is open:
    if (open && expandedRowRef?.current) {
      expandedRowRef?.current?.save()
      return
    }

    await saveBankTransactionRow(selectedCategory, bankTransaction)

    // Remove from bulk selection store
    deselect(bankTransaction.id)
    setOpen(false)
  }

  const openRow = {
    onMouseDown: () => {
      clickTimer = Date.now()
    },
    onMouseUp: () => {
      if (Date.now() - clickTimer < 100) {
        setShowRetry(false)
        toggleOpen()
      }
    },
  }

  const className = 'Layer__bank-transaction-row'
  const openClassName = open ? `${className}--expanded` : ''
  const rowClassName = classNames(
    className,
    bankTransaction.recently_categorized
    && editable
    && shouldHideAfterCategorize()
      ? 'Layer__bank-transaction-row--removing'
      : '',
    open ? openClassName : '',
    initialLoad ? 'initial-load' : '',
    isVisible ? 'show' : '',
  )

  const showReceiptDataProperties = useMemo(
    () => toDataProperties({ 'show-receipt-upload-column': showReceiptUploadColumn }),
    [showReceiptUploadColumn],
  )

  const colSpan = categorizationEnabled ? 7 : 6

  return (
    <>
      <tr className={rowClassName}>
        {categorizationEnabled && (
          <td className='Layer__table-cell Layer__bank-transactions__checkbox-col'>
            <span className='Layer__table-cell-content'>
              <Checkbox
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
            </span>
          </td>
        )}
        <td
          className='Layer__table-cell Layer__bank-transaction-table__date-col'
          {...openRow}
        >
          <span className='Layer__table-cell-content'>
            <Span>
              {formatTime(parseISO(bankTransaction.date), dateFormat)}
            </Span>
          </span>
        </td>
        <td
          className='Layer__table-cell Layer__bank-transactions__tx-col'
          {...openRow}
        >
          <span className='Layer__table-cell-content'>
            <Span withTooltip>
              {bankTransaction.counterparty_name ?? bankTransaction.description}
            </Span>
          </span>
        </td>
        <td
          className='Layer__table-cell Layer__bank-transactions__account-col'
          {...openRow}
        >
          <span className='Layer__table-cell-content'>
            <VStack align='start'>
              <Span ellipsis>
                {bankTransaction.account_name}
                {bankTransaction.account_mask && ` ${bankTransaction.account_mask}`}
              </Span>
              {bankTransaction.account_institution?.name && (
                <Span ellipsis variant='subtle' size='sm'>
                  {bankTransaction.account_institution.name}
                </Span>
              )}
            </VStack>
          </span>
        </td>
        <td
          className={`Layer__table-cell Layer__table-cell__amount-col Layer__bank-transactions__amount-col Layer__table-cell--amount ${className}__table-cell--amount-${
            isCredit(bankTransaction) ? 'credit' : 'debit'
          }`}
          {...openRow}
          {...showReceiptDataProperties}
        >
          <VStack align='end'>
            <MoneySpan
              amount={bankTransaction.amount}
              displayPlusSign={isCredit(bankTransaction)}
              className='Layer__table-cell-content'
            />
          </VStack>
        </td>
        <td
          className='Layer__table-cell Layer__bank-transactions__documents-col'
          {...showReceiptDataProperties}
        >
          {showReceiptUploads && bankTransaction.document_ids?.length > 0 && (
            <span className='Layer__table-cell-content'>
              <IconBox>
                <FileIcon size={12} />
              </IconBox>
            </span>
          )}
        </td>
        <td
          className={classNames(
            'Layer__table-cell',
            'Layer__table-cell__category-col',
            `${className}__actions-cell`,
            `${className}__actions-cell--${open ? 'open' : 'close'}`,
          )}
        >
          {open
            ? (
              <HStack pie='md' gap='md' justify='end' className='Layer__bank-transaction-row__category-open'>
                { bankTransaction.error
                  && (
                    <Text
                      as='span'
                      size={TextSize.md}
                      className='Layer__unsaved-info'
                    >
                      <span>Unsaved</span>
                      <AlertCircle size={12} />
                    </Text>
                  )}
                {categorizationEnabled
                  && (
                    <SubmitButton
                      onClick={() => {
                        if (!bankTransaction.processing) {
                          void save()
                        }
                      }}
                      className='Layer__bank-transaction__submit-btn'
                      processing={bankTransaction.processing}
                      active={open}
                      action={categorized ? SubmitAction.SAVE : SubmitAction.UPDATE}
                    >
                      {categorized
                        ? stringOverrides?.updateButtonText || 'Update'
                        : stringOverrides?.approveButtonText || 'Confirm'}
                    </SubmitButton>
                  )}
                {!categorizationEnabled && !categorized && (
                  <VStack pis='lg' fluid>
                    <BankTransactionsProcessingInfo />
                  </VStack>
                )}
                <IconButton
                  onClick={toggleOpen}
                  className='Layer__bank-transaction-row__expand-button'
                  active={open}
                  icon={(
                    <ChevronDownFill
                      className={`Layer__chevron ${
                        open ? 'Layer__chevron__up' : 'Layer__chevron__down'
                      }`}
                    />
                  )}
                />
              </HStack>
            )
            : (
              <HStack pi='md' gap='md' className='Layer__bank-transaction-row__category-hstack'>
                <AnimatedPresenceDiv
                  variant='fade'
                  isOpen={categorizationEnabled && !categorized}
                  className='Layer__BankTransactionRow__CategoryComboBoxMotionContent'
                  slotProps={{ AnimatePresence: { mode: 'wait' } }}
                  key='category-combobox'
                >
                  <BankTransactionCategoryComboBox
                    bankTransaction={bankTransaction}
                    selectedValue={selectedCategory ?? null}
                    onSelectedValueChange={(selectedCategory: BankTransactionCategoryComboBoxOption | null) => {
                      setTransactionCategory(bankTransaction.id, selectedCategory)
                      setShowRetry(false)
                    }}
                    isLoading={bankTransaction.processing}
                  />
                </AnimatedPresenceDiv>
                {categorized
                  && (
                    <BankTransactionsCategorizedSelectedValue
                      bankTransaction={bankTransaction}
                      className='Layer__bank-transaction-row__category'
                    />
                  )}
                {categorizationEnabled && !categorized && showRetry
                  && (
                    <RetryButton
                      onClick={() => {
                        if (!bankTransaction.processing) {
                          void save()
                        }
                      }}
                      className='Layer__bank-transaction__retry-btn'
                      processing={bankTransaction.processing}
                      error='Approval failed. Check connection and retry in few seconds.'
                    >
                      Retry
                    </RetryButton>
                  )}
                {!categorized && categorizationEnabled && !showRetry
                  && (
                    <SubmitButton
                      onClick={() => {
                        if (!bankTransaction.processing) {
                          void save()
                        }
                      }}
                      className='Layer__bank-transaction__submit-btn'
                      processing={bankTransaction.processing}
                      active={open}
                      action={categorized ? SubmitAction.SAVE : SubmitAction.UPDATE}
                    >
                      {categorized
                        ? stringOverrides?.updateButtonText || 'Update'
                        : stringOverrides?.approveButtonText || 'Confirm'}
                    </SubmitButton>
                  )}
                {!categorizationEnabled && !categorized && (
                  <VStack pis='xs' fluid>
                    <BankTransactionsProcessingInfo />
                  </VStack>
                )}
                <IconButton
                  onClick={toggleOpen}
                  className='Layer__bank-transaction-row__expand-button'
                  active={open}
                  icon={(
                    <ChevronDownFill
                      className={`Layer__chevron ${
                        open ? 'Layer__chevron__up' : 'Layer__chevron__down'
                      }`}
                    />
                  )}
                />
              </HStack>
            )}
        </td>
      </tr>
      <tr>
        <td colSpan={colSpan} className='Layer__bank-transaction-row__expanded-td'>
          <AnimatedPresenceDiv variant='expand' isOpen={open} key={`expanded-${bankTransaction.id}`}>
            <ExpandedBankTransactionRow
              ref={expandedRowRef}
              bankTransaction={bankTransaction}
              categorized={categorized}
              isOpen={open}
              close={() => setOpen(false)}
              containerWidth={containerWidth}
              showDescriptions={showDescriptions}
              showReceiptUploads={showReceiptUploads}
              showTooltips={showTooltips}
            />
          </AnimatedPresenceDiv>
        </td>
      </tr>
    </>
  )
}
