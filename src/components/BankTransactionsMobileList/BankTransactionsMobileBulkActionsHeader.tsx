import { BankTransaction } from '@internal-types/bank_transactions'
import { Checkbox } from '@ui/Checkbox/Checkbox'
import { Span } from '@ui/Typography/Text'
import { HStack } from '@ui/Stack/Stack'
import { useBankTransactionsTableCheckboxState } from '@hooks/useBankTransactions/useBankTransactionsTableCheckboxState'
import { useEffectiveBookkeepingStatus } from '@hooks/bookkeeping/useBookkeepingStatus'
import { isCategorizationEnabledForStatus } from '@utils/bookkeeping/isCategorizationEnabled'
import { Switch } from '@ui/Switch/Switch'
import './bankTransactionsMobileBulkActionsHeader.scss'

const CLASS_NAME = 'Layer__BankTransactionsMobileBulkActionsHeader'

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
  const { isAllSelected, isPartiallySelected, onHeaderCheckboxChange } = useBankTransactionsTableCheckboxState({ bankTransactions })
  const bookkeepingStatus = useEffectiveBookkeepingStatus()
  const categorizationEnabled = isCategorizationEnabledForStatus(bookkeepingStatus)

  if (!categorizationEnabled) {
    return null
  }

  return (
    <HStack
      gap='md'
      pi='lg'
      pbs='md'
      justify='space-between'
      align='center'
    >
      <HStack
        align='center'
        pi='xs'
        className={`${CLASS_NAME}__checkbox-container`}
      >
        {bulkActionsEnabled && (
          <>
            <Checkbox
              size='md'
              isSelected={isAllSelected}
              isIndeterminate={isPartiallySelected}
              onChange={onHeaderCheckboxChange}
              aria-label='Select all transactions on this page'
            />
            <Span
              size='md'
            >
              Select all
            </Span>
          </>
        )}
      </HStack>
      <Switch
        isSelected={bulkActionsEnabled}
        onChange={onBulkActionsToggle}
        aria-label='Toggle bulk actions'
      >
        <Span size='md' noWrap>
          Bulk Actions
        </Span>
      </Switch>
    </HStack>
  )
}
