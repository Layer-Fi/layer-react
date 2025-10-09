import { DATE_FORMAT } from '../../config/general'
import Scissors from '../../icons/Scissors'
import { BankTransaction } from '../../types'
import { CategorizationStatus } from '../../schemas/bankTransactions/bankTransaction'
import { isTransferMatch } from '../../utils/bankTransactions'
import { Badge } from '../Badge'
import { extractDescriptionForSplit } from '../BankTransactionRow/BankTransactionRow'
import { MatchBadge } from '../BankTransactionRow/MatchBadge'
import { SplitTooltipDetails } from '../BankTransactionRow/SplitTooltipDetails'
import { Text } from '../Typography'
import { parseISO, format as formatTime } from 'date-fns'

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
