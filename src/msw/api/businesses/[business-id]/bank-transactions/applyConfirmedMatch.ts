import { type BankTransaction } from '@internal-types/bankTransactions'
import { CategorizationStatus } from '@schemas/bankTransactions/bankTransaction'
import { type Match, MatchType } from '@schemas/bankTransactions/match'

import { toMatchDetailsId } from '@fixtures/bankTransactions/derive'
import { bankAccounts } from '@fixtures/generated/bankAccounts.gen'

const MATCH_TYPE_BY_DETAILS_TYPE: Record<
  NonNullable<BankTransaction['match']>['details']['type'],
  MatchType
> = {
  Transfer_Match: MatchType.TRANSFER,
  Payout_Match: MatchType.PAYOUT,
  Vendor_Payout_Match: MatchType.VENDOR_PAYOUT,
  Bill_Match: MatchType.BILL_PAYMENT,
  Invoice_Match: MatchType.INVOICE_PAYMENT,
  Refund_Payment_Match: MatchType.REFUND_PAYMENT,
  Vendor_Refund_Payment_Match: MatchType.VENDOR_REFUND_PAYMENT,
  Journal_Entry_Match: MatchType.MANUAL_JOURNAL_ENTRY,
  Payroll_Match: MatchType.PAYROLL_PAYMENT,
}

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

  return {
    transaction: {
      ...transaction,
      categorizationStatus: CategorizationStatus.MATCHED,
      category: null,
      categorizationFlow: null,
      match,
      suggestedMatches: [],
    },
    match,
  }
}
