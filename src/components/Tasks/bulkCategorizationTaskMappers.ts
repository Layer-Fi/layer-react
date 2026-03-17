import type { RawAutomatedTask } from '@internal-types/tasks'
import type { BulkCategorizationTransaction } from '@components/Tasks/BulkCategorizationTaskListItem'

function formatAutomatedTaskTransactionDate(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function formatAutomatedTaskTransactionAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Math.abs(amount))
}

export function mapAutomatedTaskToBulkCategorizationTransactions(task: RawAutomatedTask): ReadonlyArray<BulkCategorizationTransaction> {
  return task.suggestion.transactions_that_will_be_affected.map(transaction => ({
    id: transaction.id,
    merchantName: transaction.counterparty_name ?? task.suggestion.counterparty.name,
    date: formatAutomatedTaskTransactionDate(transaction.date),
    amount: formatAutomatedTaskTransactionAmount(transaction.amount),
  }))
}

export function getBulkCategorizationTaskDescription(task: RawAutomatedTask): string {
  const totalTransactions = task.suggestion.transactions_that_will_be_affected.length
  const counterpartyName = task.suggestion.counterparty.name

  return `We see ${totalTransactions} transactions at ${counterpartyName}. Can you tell us more about what these were for?`
}
