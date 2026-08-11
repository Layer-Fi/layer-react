import { type PropsWithChildren } from 'react'
import type { Row } from '@tanstack/react-table'
import classNames from 'classnames'
import { CircleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/features/bankTransactions/bankTransaction'
import { type BankTransactionCategoryComboBoxOption } from '@internal-types/features/categorization/bankTransactionCategoryComboBoxOption'
import { isCategorized } from '@utils/features/bankTransactions/shared'
import { BANK_TRANSACTIONS_LEGACY_CLASS_NAMES } from '@utils/shared/styles/legacy-styling/legacy-styling-bank-transactions'
import { useBulkSelectionActions, useCountSelectedIds } from '@providers/common/BulkSelectionStore/BulkSelectionStoreProvider'
import { useBankTransactionsStringOverrides } from '@providers/features/bankTransactions/BankTransactionsStringOverridesContext/BankTransactionsStringOverridesContext'
import { useBankTransactionsCategorizationActions } from '@providers/features/categorization/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { useBankTransactionsIsCategorizationEnabledContext } from '@providers/features/categorization/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import { useDelayedRemoveBankTransaction } from '@hooks/features/bankTransactions/useDelayedRemoveBankTransaction'
import { useGetBankTransactionMatchOrCategoryWithDefault } from '@hooks/features/bankTransactions/useGetBankTransactionCategorizationWithDefault'
import { useSaveBankTransactionRow } from '@hooks/features/bankTransactions/useSaveBankTransactionRow'
import { Button } from '@ui/Button/Button'
import { SubmitAction } from '@ui/Button/SubmitButton'
import { Chevron } from '@ui/Chevron/Chevron'
import { HStack, type StackProps } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { BankTransactionCategoryComboBox } from '@features/bankTransactions/BankTransactionCategoryComboBox/BankTransactionCategoryComboBox'
import { BankTransactionsProcessingInfo } from '@features/bankTransactions/BankTransactionsProcessingInfo/BankTransactionsProcessingInfo'
import { BankTransactionsCategorizedSelectedValue } from '@features/bankTransactions/BankTransactionsSelectedValue/BankTransactionsCategorizedSelectedValue'
import { BankTransactionsSubmitButton } from '@features/bankTransactions/BankTransactionsSubmitButton/BankTransactionsSubmitButton'

type BankTransactionCategoryCellProps = {
  row: Row<BankTransaction>
  isExpandedRowValid: boolean
}

type BankTransactionCategoryCellContainerProps = PropsWithChildren<{
  className?: string
}> & Partial<StackProps>

enum BankTransactionCategoryCellCase {
  Categorized = 'Categorized',
  Categorization = 'Categorization',
  ExpandedCategorization = 'ExpandedCategorization',
  Processing = 'Processing',
}

type GetBankTransactionCategoryCellCaseParams = {
  isOpen: boolean
  isCategorizationEnabled: boolean
  displayAsCategorized: boolean
}

const BankTransactionCategoryCellContainer = ({
  children,
  className,
  ...restProps
}: BankTransactionCategoryCellContainerProps) => (
  <HStack
    gap='md'
    align='center'
    justify='end'
    fluid
    {...restProps}
    className={classNames(className, BANK_TRANSACTIONS_LEGACY_CLASS_NAMES.categoryCellContainer)}
  >
    {children}
  </HStack>
)

const getBankTransactionCategoryCellCase = ({
  isOpen,
  isCategorizationEnabled,
  displayAsCategorized,
}: GetBankTransactionCategoryCellCaseParams) => {
  if (isCategorizationEnabled) {
    if (isOpen) return BankTransactionCategoryCellCase.ExpandedCategorization
    if (!displayAsCategorized) return BankTransactionCategoryCellCase.Categorization
    return BankTransactionCategoryCellCase.Categorized
  }
  if (!displayAsCategorized) return BankTransactionCategoryCellCase.Processing
  return BankTransactionCategoryCellCase.Categorized
}

export const BankTransactionCategoryCell = ({
  row,
  isExpandedRowValid,
}: BankTransactionCategoryCellProps) => {
  const { t } = useTranslation()
  const { bankTransactionCTAs: stringOverrides } = useBankTransactionsStringOverrides()
  const bankTransaction = row.original
  const isOpen = row.getIsExpanded()
  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabledContext()
  const categorized = Boolean(isCategorized(bankTransaction))

  const { deselect } = useBulkSelectionActions()
  const { count: bulkSelectionCount } = useCountSelectedIds()
  const isBulkSelectionActive = bulkSelectionCount > 0
  const { setTransactionCategorization } = useBankTransactionsCategorizationActions()
  const selectedOption = useGetBankTransactionMatchOrCategoryWithDefault(bankTransaction)
  const { saveBankTransactionRow, isProcessing, isError } = useSaveBankTransactionRow()

  const { isBeingRemoved } = useDelayedRemoveBankTransaction({
    bankTransaction,
    onRemove: () => row.toggleExpanded(false),
  })
  const displayAsCategorized = isBeingRemoved ? false : categorized

  const save = async () => {
    if (isOpen && !isExpandedRowValid) return
    if (!selectedOption) return

    await saveBankTransactionRow(selectedOption, bankTransaction, {
      onSuccess: () => {
        deselect(bankTransaction.id)
        row.toggleExpanded(false)
      },
    })
  }

  const submitButton = (
    <BankTransactionsSubmitButton
      onPress={() => {
        if (!isProcessing) {
          void save()
        }
      }}
      isPending={isProcessing}
      isDisabled={selectedOption === null || isBulkSelectionActive || isBeingRemoved}
      action={displayAsCategorized ? SubmitAction.SAVE : SubmitAction.UPDATE}
      isActive={isOpen}
      isError={isError}
      errorMessage={t('bankTransactions:BankTransactionsTable.BankTransactionCategoryCell.error.approval_failed_check_connection', 'Approval failed. Check connection and retry in a few seconds.')}
    >
      {isError
        ? t('common:action.retry_label', 'Retry')
        : displayAsCategorized
          ? stringOverrides?.updateButtonText ?? t('common:action.update_label', 'Update')
          : stringOverrides?.approveButtonText ?? t('common:action.confirm_label', 'Confirm')}
    </BankTransactionsSubmitButton>
  )

  const expandButton = (
    <Button
      variant='ghost'
      icon
      onPress={() => row.toggleExpanded()}
      aria-label={t('bankTransactions:BankTransactionsTable.BankTransactionCategoryCell.action.toggle_details', 'Toggle details')}
    >
      <Chevron open={isOpen} />
    </Button>
  )

  const cellCase = getBankTransactionCategoryCellCase({
    isOpen,
    isCategorizationEnabled,
    displayAsCategorized,
  })

  switch (cellCase) {
    case BankTransactionCategoryCellCase.ExpandedCategorization:
      return (
        <BankTransactionCategoryCellContainer>
          {isError && (
            <Span status='error'>
              {t('common:state.unsaved', 'Unsaved')}
              <CircleAlert size={12} />
            </Span>
          )}
          {submitButton}
          {expandButton}
        </BankTransactionCategoryCellContainer>
      )
    case BankTransactionCategoryCellCase.Categorized:
      return (
        <BankTransactionCategoryCellContainer
          justify='space-between'
          className='Layer__BankTransactionRow__CategoryCellContent'
        >
          <BankTransactionsCategorizedSelectedValue
            bankTransaction={bankTransaction}
            className='Layer__BankTransactionRow__Category'
          />
          {expandButton}
        </BankTransactionCategoryCellContainer>
      )
    case BankTransactionCategoryCellCase.Categorization:
      return (
        <BankTransactionCategoryCellContainer justify='space-between'>
          <BankTransactionCategoryComboBox
            bankTransaction={bankTransaction}
            selectedValue={selectedOption}
            onSelectedValueChange={(selectedCategory: BankTransactionCategoryComboBoxOption | null) => {
              setTransactionCategorization(bankTransaction.id, selectedCategory)
            }}
            isDisabled={isProcessing || isBeingRemoved}
          />
          {submitButton}
          {expandButton}
        </BankTransactionCategoryCellContainer>
      )
    case BankTransactionCategoryCellCase.Processing:
      return (
        <BankTransactionCategoryCellContainer justify='space-between'>
          <BankTransactionsProcessingInfo />
          {expandButton}
        </BankTransactionCategoryCellContainer>
      )
  }
}
