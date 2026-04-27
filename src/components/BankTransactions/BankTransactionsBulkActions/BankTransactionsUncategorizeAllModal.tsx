import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { tPlural } from '@utils/i18n/plural'
import { useBulkUncategorize } from '@hooks/api/businesses/[business-id]/bank-transactions/bulk-uncategorize/useBulkUncategorize'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useBankTransactionsCategorizationActions } from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
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
  const { formatNumber } = useIntlFormatter()
  const { count } = useCountSelectedIds()
  const { selectedIds } = useSelectedIds()
  const { clearSelection } = useBulkSelectionActions()
  const { trigger } = useBulkUncategorize()
  const { setTransactionCategorization } = useBankTransactionsCategorizationActions()

  const handleConfirm = useCallback(async () => {
    const transactionIds = Array.from(selectedIds)

    await trigger({ transactionIds })
    transactionIds.forEach((transactionId) => {
      setTransactionCategorization(transactionId, { category: null })
    })
    clearSelection()
  }, [selectedIds, trigger, clearSelection, setTransactionCategorization])

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
