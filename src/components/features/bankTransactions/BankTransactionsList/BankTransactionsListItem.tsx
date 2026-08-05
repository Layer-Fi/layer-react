import { useCallback, useState } from 'react'
import classNames from 'classnames'
import { File } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/features/bankTransactions/bankTransaction'
import { type BankTransactionCategoryComboBoxOption } from '@internal-types/features/categorization/bankTransactionCategoryComboBoxOption'
import {
  hasReceipts,
  isCategorized,
  isMoneyIn,
} from '@utils/features/bankTransactions/shared'
import { useBulkSelectionActions, useIdIsSelected } from '@providers/common/BulkSelectionStore/BulkSelectionStoreProvider'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useBankTransactionsStringOverrides } from '@providers/features/bankTransactions/BankTransactionsStringOverridesContext/BankTransactionsStringOverridesContext'
import { useBankTransactionsCategorizationActions } from '@providers/features/categorization/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { useBankTransactionsIsCategorizationEnabledContext } from '@providers/features/categorization/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import { useDelayedRemoveBankTransaction } from '@hooks/features/bankTransactions/useDelayedRemoveBankTransaction'
import { useGetBankTransactionMatchOrCategoryWithDefault } from '@hooks/features/bankTransactions/useGetBankTransactionCategorizationWithDefault'
import { useIsEditableCustomBankTransaction } from '@hooks/features/bankTransactions/useIsEditableCustomBankTransaction'
import { useSaveBankTransactionRow } from '@hooks/features/bankTransactions/useSaveBankTransactionRow'
import { AnimatedPresenceElement } from '@components/utility/AnimatedPresenceElement/AnimatedPresenceElement'
import { SubmitAction } from '@ui/Button/SubmitButton'
import { Checkbox } from '@ui/Checkbox/Checkbox'
import { Chevron } from '@ui/Chevron/Chevron'
import { HStack } from '@ui/Stack/Stack'
import { ErrorText } from '@ui/Typography/ErrorText'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { BankTransactionCategoryComboBox } from '@features/bankTransactions/BankTransactionCategoryComboBox/BankTransactionCategoryComboBox'
import { BankTransactionsListItemCategory } from '@features/bankTransactions/BankTransactionsListItemCategory/BankTransactionsListItemCategory'
import { BankTransactionsProcessingInfo } from '@features/bankTransactions/BankTransactionsProcessingInfo/BankTransactionsProcessingInfo'
import { BankTransactionsSubmitButton } from '@features/bankTransactions/BankTransactionsSubmitButton/BankTransactionsSubmitButton'
import { EditCustomBankTransactionButton } from '@features/bankTransactions/EditCustomBankTransactionButton/EditCustomBankTransactionButton'
import { ExpandedBankTransactionRow } from '@features/bankTransactions/ExpandedBankTransactionRow/ExpandedBankTransactionRow'

import './bankTransactionsListItem.scss'

type BankTransactionsListItemProps = {
  bankTransaction: BankTransaction
}

export const BankTransactionsListItem = ({
  bankTransaction,
}: BankTransactionsListItemProps) => {
  const { t } = useTranslation()
  const { bankTransactionCTAs: stringOverrides } = useBankTransactionsStringOverrides()
  const { formatDate } = useIntlFormatter()
  const { saveBankTransactionRow, isProcessing, isError } = useSaveBankTransactionRow()
  const [openExpandedRow, setOpenExpandedRow] = useState(false)
  const [isExpandedRowValid, setIsExpandedRowValid] = useState(true)
  const toggleExpandedRow = () => {
    setOpenExpandedRow(!openExpandedRow)
  }

  const { isDesktop } = useSizeClass()

  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabledContext()
  const isEditable = useIsEditableCustomBankTransaction(bankTransaction)

  const categorized = isCategorized(bankTransaction)
  const { isBeingRemoved } = useDelayedRemoveBankTransaction({ bankTransaction })
  const displayAsCategorized = isBeingRemoved ? false : categorized

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
  )

  return (
    <AnimatedPresenceElement as='li' variant='fade' isPresent={!isBeingRemoved} motionKey={bankTransaction.id} className={rowClassName} onClick={toggleExpandedRow}>
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
        <HStack gap='sm' align='center' className='Layer__bank-transaction-list-item__body__name'>
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
          <HStack gap='4xs' align='center'>
            {isEditable && <EditCustomBankTransactionButton bankTransaction={bankTransaction} />}
            <Span withTooltip>{bankTransaction.description}</Span>
          </HStack>

        </HStack>
        <MoneySpan
          amount={bankTransaction.amount}
          displayPlusSign={isMoneyIn(bankTransaction)}
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
        <AnimatedPresenceElement variant='expand' isPresent={openExpandedRow} motionKey={`${bankTransaction.id}--expanded`}>
          <ExpandedBankTransactionRow
            bankTransaction={bankTransaction}
            asListItem
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
              errorMessage={t('bankTransactions:BankTransactionsList.BankTransactionsListItem.error.approval_failed_check_connection', 'Approval failed. Check connection and retry in a few seconds.')}
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
        <BankTransactionsListItemCategory bankTransaction={bankTransaction} categorized />
      )}
      {isError
        && (
          <HStack pis='md' pbe='md'>
            <ErrorText>
              {t('bankTransactions:BankTransactionsList.BankTransactionsListItem.error.approval_failed_check_connection', 'Approval failed. Check connection and retry in a few seconds.')}
            </ErrorText>
          </HStack>
        )}
    </AnimatedPresenceElement>
  )
}
