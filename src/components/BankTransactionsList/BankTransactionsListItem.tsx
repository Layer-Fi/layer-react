import { useCallback, useState } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { applyCategoryChange } from '@utils/bankTransactions/categorization'
import {
  hasReceipts,
  isCategorized,
  isCredit,
} from '@utils/bankTransactions/shared'
import { useCategorizationSubmit } from '@hooks/features/bankTransactions/useCategorizationSubmit'
import { useDelayedRemoveBankTransaction } from '@hooks/features/bankTransactions/useDelayedRemoveBankTransaction'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useDelayedVisibility } from '@hooks/utils/visibility/useDelayedVisibility'
import {
  useBankTransactionsCategorizationActions,
  useGetBankTransactionCategorization,
} from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { useBulkSelectionActions, useIdIsSelected } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { useBankTransactionsIsCategorizationEnabledContext } from '@contexts/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import ChevronDownFill from '@icons/ChevronDownFill'
import FileIcon from '@icons/File'
import { AnimatedPresenceElement } from '@ui/AnimatedPresenceElement/AnimatedPresenceElement'
import { Checkbox } from '@ui/Checkbox/Checkbox'
import { HStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { BankTransactionCategoryComboBox } from '@components/BankTransactionCategoryComboBox/BankTransactionCategoryComboBox'
import { type BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { BankTransactionErrorText } from '@components/BankTransactions/BankTransactionErrorText'
import {
  type BankTransactionCTAStringOverrides,
} from '@components/BankTransactions/BankTransactions'
import { BankTransactionsListItemCategory } from '@components/BankTransactions/BankTransactionsListItemCategory/BankTransactionsListItemCategory'
import { BankTransactionsProcessingInfo } from '@components/BankTransactionsList/BankTransactionsProcessingInfo'
import { SubmitAction, SubmitButton } from '@components/Button/SubmitButton'
import { ExpandedBankTransactionRow } from '@components/ExpandedBankTransactionRow/ExpandedBankTransactionRow'

type BankTransactionsListItemProps = {
  index: number
  bankTransaction: BankTransaction
  stringOverrides?: BankTransactionCTAStringOverrides

  showDescriptions: boolean
  showReceiptUploads: boolean
  showTooltips: boolean
}

export const BankTransactionsListItem = ({
  index,
  bankTransaction,
  stringOverrides,

  showDescriptions,
  showReceiptUploads,
  showTooltips,
}: BankTransactionsListItemProps) => {
  const { t } = useTranslation()
  const { formatDate } = useIntlFormatter()
  const [openExpandedRow, setOpenExpandedRow] = useState(false)
  const toggleExpandedRow = () => {
    setOpenExpandedRow(!openExpandedRow)
  }

  const { isDesktop } = useSizeClass()

  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabledContext()

  const categorized = isCategorized(bankTransaction)

  const { isBeingRemoved } = useDelayedRemoveBankTransaction({ bankTransaction })

  // Keep showing as uncategorized during removal animation to prevent UI flashing
  const displayAsCategorized = isBeingRemoved ? false : categorized

  const { isVisible } = useDelayedVisibility({ delay: index * 80 })

  const { select, deselect } = useBulkSelectionActions()
  const isSelected = useIdIsSelected()
  const isTransactionSelected = isSelected(bankTransaction.id)
  const { setTransactionCategorization } = useBankTransactionsCategorizationActions()
  const { selectedCategorization } = useGetBankTransactionCategorization(bankTransaction.id)

  const onSubmitSuccess = useCallback(() => {
    deselect(bankTransaction.id)
    setOpenExpandedRow(false)
  }, [bankTransaction.id, deselect])

  const {
    submit,
    errorMessage: submitErrorMessage,
    isProcessing,
    isError,
  } = useCategorizationSubmit({ bankTransaction, onSuccess: onSubmitSuccess })

  const save = async () => {
    await submit()
  }

  const selectedCategory = selectedCategorization?.category

  const preventRowExpansion = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const openClassName = openExpandedRow ? 'Layer__bank-transaction-list-item--expanded' : ''
  const rowClassName = classNames(
    'Layer__bank-transaction-list-item',
    openExpandedRow ? openClassName : '',
    isVisible ? 'show' : '',
  )

  return (
    <AnimatedPresenceElement as='li' variant='fade' isOpen={!isBeingRemoved} motionKey={bankTransaction.id} className={rowClassName} onClick={toggleExpandedRow}>
      <span className='Layer__bank-transaction-list-item__heading'>
        <div className='Layer__bank-transaction-list-item__heading__main'>
          <Span ellipsis size='sm'>
            {formatDate(bankTransaction.date)}
          </Span>

          <span className='Layer__bank-transaction-list-item__heading-separator' />

          {bankTransaction.account_institution?.name && (
            <Span ellipsis size='sm'>
              {`${bankTransaction.account_institution.name} — `}
            </Span>
          )}

          <Span ellipsis size='sm'>
            {bankTransaction.account_name}
            {bankTransaction.account_mask && ` ${bankTransaction.account_mask}`}
          </Span>

          {hasReceipts(bankTransaction) ? <FileIcon size={12} /> : null}

        </div>
        <div
          onClick={toggleExpandedRow}
          className={classNames(
            'Layer__bank-transaction-row__expand-button',
            !isDesktop && 'Layer__bank-transaction-row__expand-button--mobile',
          )}
        >
          <ChevronDownFill
            className={`Layer__chevron ${
              openExpandedRow ? 'Layer__chevron__up' : 'Layer__chevron__down'
            }`}
          />
        </div>
      </span>
      <HStack className='Layer__bank-transaction-list-item__body'>
        <HStack gap='sm' className='Layer__bank-transaction-list-item__body__name'>
          {isCategorizationEnabled && (
            <div className='Layer__bank-transaction-list-item__checkbox' onClick={preventRowExpansion}>
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
            </div>
          )}
          <Span withTooltip>
            {bankTransaction.counterparty_name ?? bankTransaction.description}
          </Span>
        </HStack>
        <MoneySpan
          amount={bankTransaction.amount}
          displayPlusSign={isCredit(bankTransaction)}
          size='md'
        />
      </HStack>
      {!isCategorizationEnabled && !displayAsCategorized
        && (
          <span className='Layer__bank-transaction-list-item__processing-info'>
            <BankTransactionsProcessingInfo />
          </span>
        )}
      <span className='Layer__bank-transaction-list-item__expanded-row' onClick={preventRowExpansion}>
        <AnimatedPresenceElement variant='expand' isOpen={openExpandedRow} motionKey={`${bankTransaction.id}--expanded`}>
          <ExpandedBankTransactionRow
            bankTransaction={bankTransaction}
            isOpen={openExpandedRow}
            categorized={displayAsCategorized}
            asListItem
            showDescriptions={showDescriptions}
            showReceiptUploads={showReceiptUploads}
            showTooltips={showTooltips}

            variant='list'
          />
        </AnimatedPresenceElement>
      </span>
      {isCategorizationEnabled && !displayAsCategorized && (
        <div onClick={preventRowExpansion}>
          <HStack pi='md' gap='md' pbe='md' justify='end'>
            {!openExpandedRow && (
              <BankTransactionCategoryComboBox
                bankTransaction={bankTransaction}
                selectedValue={selectedCategory ?? null}
                onSelectedValueChange={(nextCategory: BankTransactionCategoryComboBoxOption | null) => {
                  setTransactionCategorization(
                    bankTransaction.id,
                    applyCategoryChange(selectedCategorization, nextCategory),
                  )
                }}
                isDisabled={isProcessing}
              />
            )}
            <SubmitButton
              disabled={isProcessing}
              onClick={() => { void save() }}
              className={isError ? 'Layer__bank-transaction__retry-btn' : 'Layer__bank-transaction__submit-btn'}
              processing={isProcessing}
              action={!displayAsCategorized ? SubmitAction.SAVE : SubmitAction.UPDATE}
              withRetry
              error={isError ? t('bankTransactions:error.approval_failed_check_connection', 'Approval failed. Check connection and retry in a few seconds.') : undefined}
            >
              {isError
                ? t('common:action.retry_label', 'Retry')
                : (!displayAsCategorized
                  ? stringOverrides?.approveButtonText ?? t('common:action.approve_label', 'Approve')
                  : stringOverrides?.updateButtonText ?? t('common:action.update_label', 'Update'))}
            </SubmitButton>
          </HStack>
        </div>
      )}
      {!openExpandedRow && displayAsCategorized && (
        <BankTransactionsListItemCategory
          bankTransaction={bankTransaction}
        />
      )}
      <BankTransactionErrorText
        submitErrorMessage={submitErrorMessage}
        showApprovalError={isError}
      />
    </AnimatedPresenceElement>
  )
}
