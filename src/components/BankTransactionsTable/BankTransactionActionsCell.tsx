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
import { Button } from '@ui/Button/Button'
import { SubmitAction } from '@ui/Button/SubmitButton'
import { HStack, type StackProps } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { BankTransactionCategoryComboBox } from '@components/BankTransactionCategoryComboBox/BankTransactionCategoryComboBox'
import { type BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import {
  type BankTransactionCTAStringOverrides,
} from '@components/BankTransactions/BankTransactions'
import { BankTransactionsSubmitButton } from '@components/BankTransactions/BankTransactionsSubmitButton'
import { BankTransactionsProcessingInfo } from '@components/BankTransactionsList/BankTransactionsProcessingInfo'
import { BankTransactionsCategorizedSelectedValue } from '@components/BankTransactionsSelectedValue/BankTransactionsCategorizedSelectedValue'
import { Chevron } from '@components/Chevron/Chevron'

type BankTransactionActionsCellProps = {
  row: Row<BankTransaction>
  isExpandedRowValid: boolean
  stringOverrides?: BankTransactionCTAStringOverrides
}

type BankTransactionActionsCellContainerProps = PropsWithChildren<{
  className?: string
}> & Partial<StackProps>

enum BankTransactionActionsCellCase {
  Categorized = 'Categorized',
  Categorization = 'Categorization',
  ExpandedCategorization = 'ExpandedCategorization',
  Processing = 'Processing',
}

type GetBankTransactionActionsCellCaseParams = {
  isOpen: boolean
  isCategorizationEnabled: boolean
  displayAsCategorized: boolean
}

const BankTransactionActionsCellContainer = ({
  children,
  className,
  ...restProps
}: BankTransactionActionsCellContainerProps) => (
  <HStack gap='md' align='center' justify='end' fluid {...restProps} className={className}>
    {children}
  </HStack>
)

const getBankTransactionActionsCellCase = ({
  isOpen,
  isCategorizationEnabled,
  displayAsCategorized,
}: GetBankTransactionActionsCellCaseParams) => {
  if (isCategorizationEnabled) {
    if (isOpen) return BankTransactionActionsCellCase.ExpandedCategorization
    if (!displayAsCategorized) return BankTransactionActionsCellCase.Categorization
    return BankTransactionActionsCellCase.Categorized
  }
  if (!displayAsCategorized) return BankTransactionActionsCellCase.Processing
  return BankTransactionActionsCellCase.Categorized
}

export const BankTransactionActionsCell = ({
  row,
  isExpandedRowValid,
  stringOverrides,
}: BankTransactionActionsCellProps) => {
  const { t } = useTranslation()
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
      isDisabled={selectedOption === null || isBulkSelectionActive}
      action={displayAsCategorized ? SubmitAction.SAVE : SubmitAction.UPDATE}
      isActive={isOpen}
      isError={isError}
      errorMessage={t('bankTransactions:error.approval_failed_check_connection', 'Approval failed. Check connection and retry in a few seconds.')}
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
      aria-label={t('bankTransactions:action.toggle_details', 'Toggle details')}
    >
      <Chevron open={isOpen} />
    </Button>
  )

  const cellCase = getBankTransactionActionsCellCase({
    isOpen,
    isCategorizationEnabled,
    displayAsCategorized,
  })

  switch (cellCase) {
    case BankTransactionActionsCellCase.ExpandedCategorization:
      return (
        <BankTransactionActionsCellContainer>
          {isError && (
            <Span status='error'>
              {t('common:state.unsaved', 'Unsaved')}
              <CircleAlert size={12} />
            </Span>
          )}
          {submitButton}
          {expandButton}
        </BankTransactionActionsCellContainer>
      )
    case BankTransactionActionsCellCase.Categorized:
      return (
        <BankTransactionActionsCellContainer
          justify='space-between'
          className='Layer__BankTransactionRow__CategoryCellContent'
        >
          <BankTransactionsCategorizedSelectedValue
            bankTransaction={bankTransaction}
            className='Layer__BankTransactionRow__Category'
          />
          {expandButton}
        </BankTransactionActionsCellContainer>
      )
    case BankTransactionActionsCellCase.Categorization:
      return (
        <BankTransactionActionsCellContainer justify='space-between'>
          <BankTransactionCategoryComboBox
            bankTransaction={bankTransaction}
            selectedValue={selectedOption}
            onSelectedValueChange={(selectedCategory: BankTransactionCategoryComboBoxOption | null) => {
              setTransactionCategorization(bankTransaction.id, selectedCategory)
            }}
            isDisabled={isProcessing}
          />
          {submitButton}
          {expandButton}
        </BankTransactionActionsCellContainer>
      )
    case BankTransactionActionsCellCase.Processing:
      return (
        <BankTransactionActionsCellContainer justify='space-between'>
          <BankTransactionsProcessingInfo />
          {expandButton}
        </BankTransactionActionsCellContainer>
      )
  }
}
