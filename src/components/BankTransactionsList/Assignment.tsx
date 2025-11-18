import { format as formatTime, parseISO } from 'date-fns'

import { type BankTransaction } from '@internal-types/bank_transactions'
import { CategorizationStatus } from '@schemas/bankTransactions/bankTransaction'
import { DATE_FORMAT } from '@config/general'
import { isTransferMatch } from '@utils/bankTransactions'
import Scissors from '@icons/Scissors'
import { Badge } from '@components/Badge/Badge'
import { extractDescriptionForSplit } from '@components/BankTransactionRow/BankTransactionRow'
import { MatchBadge } from '@components/BankTransactionRow/MatchBadge'
import { SplitTooltipDetails } from '@components/BankTransactionRow/SplitTooltipDetails'
import { Text } from '@components/Typography/Text'

export interface AssignmentProps {
  bankTransaction: BankTransaction
}

export const Assignment = ({ bankTransaction }: AssignmentProps) => {
  if (
    bankTransaction.match
    && bankTransaction.categorization_status === CategorizationStatus.MATCHED
  ) {
    return (
      <>
        <MatchBadge
          classNamePrefix='Layer__bank-transaction-list-item'
          bankTransaction={bankTransaction}
          dateFormat={DATE_FORMAT}
          text={isTransferMatch(bankTransaction) ? 'Transfer' : 'Matched'}
        />
        <Text className='Layer__bank-transaction-list-item__category-text__text'>
          {`${formatTime(
            parseISO(bankTransaction.match.bank_transaction.date),
            DATE_FORMAT,
          )}, ${
            bankTransaction.match.bank_transaction.description
            ?? bankTransaction.match?.details?.description
          }`}
        </Text>
      </>
    )
  }

  if (bankTransaction.categorization_status === CategorizationStatus.SPLIT) {
    return (
      <>
        <Badge
          icon={<Scissors size={11} />}
          tooltip={(
            <SplitTooltipDetails
              classNamePrefix='Layer__bank-transaction-list-item'
              category={bankTransaction.category}
            />
          )}
        >
          Split
        </Badge>
        <Text className='Layer__bank-transaction-list-item__category-text__text'>
          {extractDescriptionForSplit(bankTransaction.category)}
        </Text>
      </>
    )
  }

  return <Text>{bankTransaction?.category?.display_name}</Text>
}
