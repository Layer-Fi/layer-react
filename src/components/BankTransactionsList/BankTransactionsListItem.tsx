import { useCallback, useState } from 'react'
import classNames from 'classnames'
import { File } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import {
  hasReceipts,
  isCategorized,
  isCredit,
} from '@utils/bankTransactions/shared'
import { useDelayedRemoveBankTransaction } from '@hooks/features/bankTransactions/useDelayedRemoveBankTransaction'
import { useGetBankTransactionMatchOrCategoryWithDefault } from '@hooks/features/bankTransactions/useGetBankTransactionCategorizationWithDefault'
import { useSaveBankTransactionRow } from '@hooks/features/bankTransactions/useSaveBankTransactionRow'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useDelayedVisibility } from '@hooks/utils/visibility/useDelayedVisibility'
import { useBankTransactionsCategorizationActions } from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { useBulkSelectionActions, useIdIsSelected } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { useBankTransactionsIsCategorizationEnabledContext } from '@contexts/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import { AnimatedPresenceElement } from '@ui/AnimatedPresenceElement/AnimatedPresenceElement'
import { SubmitAction } from '@ui/Button/SubmitButton'
import { Checkbox } from '@ui/Checkbox/Checkbox'
import { HStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { BankTransactionCategoryComboBox } from '@components/BankTransactionCategoryComboBox/BankTransactionCategoryComboBox'
import { type BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import {
  type BankTransactionCTAStringOverrides,
} from '@components/BankTransactions/BankTransactions'
import { BankTransactionsListItemCategory } from '@components/BankTransactions/BankTransactionsListItemCategory/BankTransactionsListItemCategory'
import { BankTransactionsSubmitButton } from '@components/BankTransactions/BankTransactionsSubmitButton'
import { BankTransactionsProcessingInfo } from '@components/BankTransactionsList/BankTransactionsProcessingInfo'
import { Chevron } from '@components/Chevron/Chevron'
import { ExpandedBankTransactionRow } from '@components/ExpandedBankTransactionRow/ExpandedBankTransactionRow'
import { ErrorText } from '@components/Typography/ErrorText'

import './bankTransactionsListItem.scss'

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
  const { saveBankTransactionRow, isProcessing, isError } = useSaveBankTransactionRow()
  const [openExpandedRow, setOpenExpandedRow] = useState(false)
  const [isExpandedRowValid, setIsExpandedRowValid] = useState(true)
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
  const selectedOption = useGetBankTransactionMatchOrCategoryWithDefault(bankTransaction)

  const onBankTransactionSaveSuccess = useCallback(() => {
    deselect(bankTransaction.id)
    setOpenExpandedRow(false)
  }, [bankTransaction.id, deselect, setOpenExpandedRow])

  const save = useCallback(async () => {
    if (openExpandedRow && !isExpandedRowValid) return
    if (!selectedOption) return

    await saveBankTransactionRow(selectedOption, bankTransaction, {
      onSuccess: onBankTransactionSaveSuccess,
    })
  }, [openExpandedRow, isExpandedRowValid, selectedOption, saveBankTransactionRow, bankTransaction, onBankTransactionSaveSuccess])

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

          {bankTransaction.accountInstitution?.name && (
            <Span ellipsis size='sm'>
              {`${bankTransaction.accountInstitution.name} — `}
            </Span>
          )}

          <Span ellipsis size='sm'>
            {bankTransaction.accountName}
            {bankTransaction.accountMask && ` ${bankTransaction.accountMask}`}
          </Span>

          {hasReceipts(bankTransaction) ? <File size={12} /> : null}

        </div>
        <div
          onClick={toggleExpandedRow}
          className={classNames(
            'Layer__bank-transaction-row__expand-button',
            !isDesktop && 'Layer__bank-transaction-row__expand-button--mobile',
          )}
        >
          <Chevron open={openExpandedRow} />
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
            {bankTransaction.counterpartyName ?? bankTransaction.description}
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
            onValidityChange={setIsExpandedRowValid}
          />
        </AnimatedPresenceElement>
      </span>
      {isCategorizationEnabled && !displayAsCategorized && (
        <div onClick={preventRowExpansion}>
          <HStack pi='md' gap='md' pbe='md' justify='end'>
            {!openExpandedRow && (
              <BankTransactionCategoryComboBox
                bankTransaction={bankTransaction}
                selectedValue={selectedOption}
                onSelectedValueChange={(selectedCategory: BankTransactionCategoryComboBoxOption | null) => {
                  setTransactionCategorization(bankTransaction.id, selectedCategory)
                }}
                isDisabled={isProcessing}
              />
            )}
            <BankTransactionsSubmitButton
              isDisabled={isProcessing}
              onPress={() => { void save() }}
              isPending={isProcessing}
              action={!displayAsCategorized ? SubmitAction.SAVE : SubmitAction.UPDATE}
              isError={isError}
              errorMessage={t('bankTransactions:error.approval_failed_check_connection', 'Approval failed. Check connection and retry in a few seconds.')}
            >
              {isError
                ? t('common:action.retry_label', 'Retry')
                : (!displayAsCategorized
                  ? stringOverrides?.approveButtonText ?? t('common:action.approve_label', 'Approve')
                  : stringOverrides?.updateButtonText ?? t('common:action.update_label', 'Update'))}
            </BankTransactionsSubmitButton>
          </HStack>
        </div>
      )}
      {!openExpandedRow && displayAsCategorized && (
        <BankTransactionsListItemCategory
          bankTransaction={bankTransaction}
        />
      )}
      {isError
        && (
          <HStack pis='md' pbe='md'>
            <ErrorText>
              {t('bankTransactions:error.approval_failed_check_connection', 'Approval failed. Check connection and retry in a few seconds.')}
            </ErrorText>
          </HStack>
        )}
    </AnimatedPresenceElement>
  )
}
