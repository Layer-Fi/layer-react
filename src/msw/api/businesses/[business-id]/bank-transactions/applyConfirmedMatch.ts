import { type BankTransaction } from '@internal-types/bankTransactions'
import { CategorizationStatus } from '@schemas/bankTransactions/bankTransaction'
import { type Match } from '@schemas/bankTransactions/match'

import { MATCH_TYPE_BY_DETAILS_TYPE, toMatchDetailsId } from '@fixtures/bankTransactions/derive'
import { bankAccounts } from '@fixtures/generated/bankAccounts.gen'

export const applyConfirmedMatch = (
  transaction: BankTransaction,
  suggestedMatchId: string,
): { transaction: BankTransaction, match: Match } => {
  const suggestedMatch = transaction.suggestedMatches.find(match => match.id === suggestedMatchId)

  const fromAccountName = transaction.accountName ?? bankAccounts[0].accountName

  const details = suggestedMatch?.details ?? transaction.match?.details ?? {
    type: 'Transfer_Match',
    id: toMatchDetailsId(transaction.id),
    amount: transaction.amount,
    date: transaction.date,
    description: transaction.description ?? 'Transfer',
    adjustment: null,
    fromAccountName,
    toAccountName: bankAccounts.find(account => account.accountName !== fromAccountName)?.accountName
      ?? fromAccountName,
  }

  const match: Match = {
    id: `match-${transaction.id}`,
    matchType: MATCH_TYPE_BY_DETAILS_TYPE[details.type],
    bankTransaction: {
      id: transaction.id,
      date: transaction.date,
      direction: transaction.direction,
      amount: transaction.amount,
      counterpartyName: transaction.counterpartyName,
      description: transaction.description,
    },
    details,
  }

  // The match table renders suggestedMatches; clearing them would blank it.
  const suggestedMatches = suggestedMatch
    ? transaction.suggestedMatches
    : [...transaction.suggestedMatches, { id: suggestedMatchId, details }]

  return {
    transaction: {
      ...transaction,
      categorizationStatus: CategorizationStatus.MATCHED,
      category: null,
      categorizationFlow: null,
      match,
      suggestedMatches,
    },
    match,
  }
}
