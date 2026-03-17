import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { tPlural } from '@utils/i18n/plural'
import { useBulkUncategorize } from '@hooks/api/businesses/[business-id]/bank-transactions/bulk-uncategorize/useBulkUncategorize'
import { useBankTransactionsCategoryActions } from '@providers/BankTransactionsCategoryStore/BankTransactionsCategoryStoreProvider'
import { useBulkSelectionActions, useCountSelectedIds, useSelectedIds } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { Span } from '@ui/Typography/Text'
import { BaseConfirmationModal } from '@blocks/BaseConfirmationModal/BaseConfirmationModal'

interface BankTransactionsUncategorizeAllModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  isMobileView?: boolean
}

export const BankTransactionsUncategorizeAllModal = ({ isOpen, onOpenChange, isMobileView = false }: BankTransactionsUncategorizeAllModalProps) => {
  const { t } = useTranslation()
  const { count } = useCountSelectedIds()
  const { selectedIds } = useSelectedIds()
  const { clearSelection } = useBulkSelectionActions()
  const { trigger } = useBulkUncategorize()
  const { clearMultipleTransactionCategories } = useBankTransactionsCategoryActions()

  const handleConfirm = useCallback(async () => {
    const transactionIds = Array.from(selectedIds)

    await trigger({ transactionIds })
    clearMultipleTransactionCategories(transactionIds)
    clearSelection()
  }, [selectedIds, trigger, clearSelection, clearMultipleTransactionCategories])

  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={t('bankTransactions:prompt.uncategorize_selected_transactions', 'Uncategorize all selected transactions?')}
      content={(
        <Span>
          {tPlural(t, 'bankTransactions:label.uncategorize_count_selected', {
            count,
            one: 'This will uncategorize {{count}} selected transaction.',
            other: 'This will uncategorize {{count}} selected transactions.',
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
