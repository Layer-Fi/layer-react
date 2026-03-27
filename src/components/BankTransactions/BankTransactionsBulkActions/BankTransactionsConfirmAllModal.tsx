import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { tPlural } from '@utils/i18n/plural'
import { useBulkMatchOrCategorize } from '@hooks/api/businesses/[business-id]/bank-transactions/bulk-match-or-categorize/useBulkMatchOrCategorize'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useBulkSelectionActions, useCountSelectedIds } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { BaseConfirmationModal } from '@blocks/BaseConfirmationModal/BaseConfirmationModal'

interface BankTransactionsConfirmAllModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  isMobileView?: boolean
}

export const BankTransactionsConfirmAllModal = ({ isOpen, onOpenChange, isMobileView = false }: BankTransactionsConfirmAllModalProps) => {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()
  const { count } = useCountSelectedIds()
  const { clearSelection } = useBulkSelectionActions()
  const { trigger, buildTransactionsPayload } = useBulkMatchOrCategorize()
  const payload = buildTransactionsPayload()

  const { actionableCount, skippedCount } = useMemo(() => {
    const actionable = Object.keys(payload.transactions).length
    return {
      actionableCount: actionable,
      skippedCount: count - actionable,
    }
  }, [payload, count])

  const handleConfirm = useCallback(async () => {
    await trigger(payload)
    clearSelection()
  }, [payload, trigger, clearSelection])

  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={t('bankTransactions:prompt.confirm_all_suggestions', 'Confirm all suggestions?')}
      content={(
        skippedCount === 0
          ? (
            <Span>
              {tPlural(t, 'bankTransactions:label.this_will_confirm_count_transactions', {
                count,
                displayCount: formatNumber(count),
                one: 'This will confirm {{displayCount}} transaction.',
                other: 'This will confirm {{displayCount}} transactions.',
              })}
            </Span>
          )
          : (
            <VStack gap='xs'>
              <Span>
                {tPlural(t, 'bankTransactions:label.actionable_count_transactions_will_be_confirmed', {
                  count,
                  displayCount: formatNumber(count),
                  displayActionableCount: formatNumber(actionableCount),
                  one: '{{displayActionableCount}} of {{displayCount}} transaction will be confirmed.',
                  other: '{{displayActionableCount}} of {{displayCount}} transactions will be confirmed.',
                })}
              </Span>
              <Span>
                {tPlural(t, 'bankTransactions:label.count_transactions_will_be_skipped', {
                  count: skippedCount,
                  displayCount: formatNumber(skippedCount),
                  one: '{{displayCount}} transaction will be skipped due to missing category.',
                  other: '{{displayCount}} transactions will be skipped due to missing category.',
                })}
              </Span>
            </VStack>
          )
      )}
      onConfirm={handleConfirm}
      confirmLabel={t('bankTransactions:action.confirm_all', 'Confirm all')}
      errorText={t('bankTransactions:error.confirm_transactions', 'Failed to confirm transactions')}
      closeOnConfirm
      confirmDisabled={actionableCount === 0}
      useDrawer={isMobileView}
    />
  )
}
