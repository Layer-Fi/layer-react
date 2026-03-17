import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { useBankTransactionsTableCheckboxState } from '@hooks/features/bankTransactions/useBankTransactionsTableCheckboxState'
import { useBankTransactionsIsCategorizationEnabledContext } from '@contexts/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import { Checkbox } from '@ui/Checkbox/Checkbox'
import { HStack } from '@ui/Stack/Stack'
import { Switch } from '@ui/Switch/Switch'
import { Span } from '@ui/Typography/Text'

interface BankTransactionsMobileBulkActionsHeaderProps {
  bankTransactions?: BankTransaction[]
  bulkActionsEnabled: boolean
  onBulkActionsToggle: (enabled: boolean) => void
}

export const BankTransactionsMobileBulkActionsHeader = ({
  bankTransactions,
  bulkActionsEnabled,
  onBulkActionsToggle,
}: BankTransactionsMobileBulkActionsHeaderProps) => {
  const { t } = useTranslation()
  const { isAllSelected, isPartiallySelected, onHeaderCheckboxChange } = useBankTransactionsTableCheckboxState({ bankTransactions })
  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabledContext()

  if (!isCategorizationEnabled) {
    return null
  }

  return (
    <HStack
      gap='md'
      align='center'
      justify='space-between'
      pi='md'
      pb='xs'
    >
      <HStack
        align='center'
        gap='xs'
      >
        {bulkActionsEnabled && (
          <>
            <Checkbox
              size='md'
              isSelected={isAllSelected}
              isIndeterminate={isPartiallySelected}
              onChange={onHeaderCheckboxChange}
              aria-label={t('bankTransactions:label.select_all_transactions', 'Select all transactions on this page')}
            />
            <Span
              size='md'
            >
              {t('common:label.select_all', 'Select all')}
            </Span>
          </>
        )}
      </HStack>
      <HStack align='center' gap='xs'>
        <Span size='md' noWrap>
          {t('common:label.bulk_actions', 'Bulk Actions')}
        </Span>
        <Switch
          isSelected={bulkActionsEnabled}
          onChange={onBulkActionsToggle}
          aria-label={t('common:action.toggle_bulk_actions', 'Toggle bulk actions')}
        />
      </HStack>

    </HStack>
  )
}
