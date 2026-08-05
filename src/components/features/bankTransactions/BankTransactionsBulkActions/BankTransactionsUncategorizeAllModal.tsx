import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { tPlural } from '@utils/shared/i18n/plural'
import { useBulkSelectionActions, useCountSelectedIds, useSelectedIds } from '@providers/common/BulkSelectionStore/BulkSelectionStoreProvider'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useBankTransactionsCategorizationActions } from '@providers/features/categorization/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { useBulkUncategorizeBankTransactions } from '@hooks/features/bankTransactions/useBulkBankTransactionMutations'
import { Span } from '@ui/Typography/Text'
import { BaseConfirmationModal } from '@blocks/BaseConfirmationModal/BaseConfirmationModal'

interface BankTransactionsUncategorizeAllModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  isMobileView?: boolean
}

export const BankTransactionsUncategorizeAllModal = ({ isOpen, onOpenChange, isMobileView = false }: BankTransactionsUncategorizeAllModalProps) => {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()
  const { count } = useCountSelectedIds()
  const { selectedIds } = useSelectedIds()
  const { clearSelection } = useBulkSelectionActions()
  const { trigger } = useBulkUncategorizeBankTransactions()
  const { clearTransactionCategorizations } = useBankTransactionsCategorizationActions()

  const handleConfirm = useCallback(async () => {
    const transactionIds = Array.from(selectedIds)

    await trigger({ transactionIds })
    clearTransactionCategorizations(transactionIds)
    clearSelection()
  }, [selectedIds, trigger, clearSelection, clearTransactionCategorizations])

  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={t('bankTransactions:prompt.uncategorize_selected_transactions', 'Uncategorize all selected transactions?')}
      content={(
        <Span>
          {tPlural(t, 'bankTransactions:label.uncategorize_count_selected', {
            count,
            displayCount: formatNumber(count),
            one: 'This will uncategorize {{displayCount}} selected transaction.',
            other: 'This will uncategorize {{displayCount}} selected transactions.',
          })}
        </Span>
      )}
      onConfirm={handleConfirm}
      confirmLabel={t('bankTransactions:action.uncategorize_all', 'Uncategorize All')}
      errorText={t('bankTransactions:error.uncategorize_transactions', 'Failed to uncategorize transactions')}
      useDrawer={isMobileView}
    />
  )
}
