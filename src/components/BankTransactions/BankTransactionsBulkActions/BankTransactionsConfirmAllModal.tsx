import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { tPlural } from '@utils/i18n/plural'
import { useBulkMatchOrCategorize } from '@hooks/api/businesses/[business-id]/bank-transactions/bulk-match-or-categorize/useBulkMatchOrCategorize'
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
      title={t('bankTransactions.confirmAllSuggestions', 'Confirm all suggestions?')}
      content={(
        skippedCount === 0
          ? (
            <Span>
              {tPlural(t, 'bankTransactions.thisWillConfirmCountTransactions', {
                count,
                one: 'This will confirm {{count}} transaction.',
                other: 'This will confirm {{count}} transactions.',
              })}
            </Span>
          )
          : (
            <VStack gap='xs'>
              <Span>
                {tPlural(t, 'bankTransactions.actionableCountOfCountTransactionsWillBeConfirmed', {
                  count,
                  actionableCount,
                  one: '{{actionableCount}} of {{count}} transaction will be confirmed.',
                  other: '{{actionableCount}} of {{count}} transactions will be confirmed.',
                })}
              </Span>
              <Span>
                {tPlural(t, 'bankTransactions.countTransactionsWillBeSkippedDueToMissingCategory', {
                  count: skippedCount,
                  one: '{{count}} transaction will be skipped due to missing category.',
                  other: '{{count}} transactions will be skipped due to missing category.',
                })}
              </Span>
            </VStack>
          )
      )}
      onConfirm={handleConfirm}
      confirmLabel={t('bankTransactions.confirmAll', 'Confirm all')}
      errorText={t('bankTransactions.failedToConfirmTransactions', 'Failed to confirm transactions')}
      closeOnConfirm
      confirmDisabled={actionableCount === 0}
      useDrawer={isMobileView}
    />
  )
}
