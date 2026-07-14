import { type PropsWithChildren } from 'react'
import type { Row } from '@tanstack/react-table'
import { CircleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { isCategorized } from '@utils/bankTransactions/shared'
import { useDelayedRemoveBankTransaction } from '@hooks/features/bankTransactions/useDelayedRemoveBankTransaction'
import { useGetBankTransactionMatchOrCategoryWithDefault } from '@hooks/features/bankTransactions/useGetBankTransactionCategorizationWithDefault'
import { useSaveBankTransactionRow } from '@hooks/features/bankTransactions/useSaveBankTransactionRow'
import { useBankTransactionsCategorizationActions } from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { useBulkSelectionActions, useCountSelectedIds } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { useBankTransactionsIsCategorizationEnabledContext } from '@contexts/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import { useBankTransactionsStringOverrides } from '@contexts/BankTransactionsStringOverridesContext/BankTransactionsStringOverridesContext'
import { Button } from '@ui/Button/Button'
import { SubmitAction } from '@ui/Button/SubmitButton'
import { HStack, type StackProps } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { BankTransactionCategoryComboBox } from '@components/BankTransactionCategoryComboBox/BankTransactionCategoryComboBox'
import { type BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { BankTransactionsSubmitButton } from '@components/BankTransactions/BankTransactionsSubmitButton'
import { BankTransactionsProcessingInfo } from '@components/BankTransactionsList/BankTransactionsProcessingInfo'
import { BankTransactionsCategorizedSelectedValue } from '@components/BankTransactionsSelectedValue/BankTransactionsCategorizedSelectedValue'
import { Chevron } from '@components/Chevron/Chevron'

type BankTransactionCategoryCellProps = {
  row: Row<BankTransaction>
  isExpandedRowValid: boolean
  isExiting: boolean
  onExitComplete: (id: string) => void
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
  <HStack gap='md' align='center' justify='end' fluid {...restProps} className={className}>
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
  isExiting,
  onExitComplete,
}: BankTransactionCategoryCellProps) => {
  const { t } = useTranslation()
  const { bankTransactionCTAs: stringOverrides } = useBankTransactionsStringOverrides()
  const bankTransaction = row.original
  const isOpen = row.getIsExpanded()
  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabledContext()

  const { deselect } = useBulkSelectionActions()
  const { count: bulkSelectionCount } = useCountSelectedIds()
  const isBulkSelectionActive = bulkSelectionCount > 0
  const { setTransactionCategorization } = useBankTransactionsCategorizationActions()
  const selectedOption = useGetBankTransactionMatchOrCategoryWithDefault(bankTransaction)
  const { saveBankTransactionRow, isProcessing, isError } = useSaveBankTransactionRow()

  useDelayedRemoveBankTransaction({
    id: bankTransaction.id,
    isExiting,
    onExitComplete,
    onRemove: () => row.toggleExpanded(false),
  })

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
      isDisabled={selectedOption === null || isBulkSelectionActive || isExiting}
      action={isCategorized(bankTransaction) ? SubmitAction.SAVE : SubmitAction.UPDATE}
      isActive={isOpen}
      isError={isError}
      errorMessage={t('bankTransactions:error.approval_failed_check_connection', 'Approval failed. Check connection and retry in a few seconds.')}
    >
      {isError
        ? t('common:action.retry_label', 'Retry')
        : isCategorized(bankTransaction)
          ? stringOverrides?.updateButtonText ?? t('common:action.update_label', 'Update')
          : stringOverrides?.approveButtonText ?? t('common:action.confirm_label', 'Confirm')}
    </BankTransactionsSubmitButton>
  )

  const expandButton = (
    <Button
      variant='ghost'
      icon
      onPress={() => row.toggleExpanded()}
      aria-label={t('bankTransactions:action.toggle_details', 'Toggle details')}
    >
      <Chevron open={isOpen} />
    </Button>
  )

  const cellCase = getBankTransactionCategoryCellCase({
    isOpen,
    isCategorizationEnabled,
    displayAsCategorized: isCategorized(bankTransaction),
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
            isDisabled={isProcessing || isExiting}
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
