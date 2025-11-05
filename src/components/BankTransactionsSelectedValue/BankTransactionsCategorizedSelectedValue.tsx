import { parseISO, format as formatTime } from 'date-fns'
import Scissors from '../../icons/Scissors'
import { BankTransaction } from '../../types/bank_transactions'
import { CategorizationStatus } from '../../schemas/bankTransactions/bankTransaction'
import { isTransferMatch } from '../../utils/bankTransactions'
import { Badge } from '../Badge'
import { Span } from '../ui/Typography/Text'
import { MatchBadge } from '../BankTransactionRow/MatchBadge'
import { SplitTooltipDetails } from '../BankTransactionRow/SplitTooltipDetails'
import { extractDescriptionForSplit } from '../BankTransactionRow/BankTransactionRow'
import { DATE_FORMAT } from '../../config/general'

type BankTransactionsCategorizedSelectedValueProps = {
  bankTransaction: BankTransaction
  className?: string
}

export const BankTransactionsCategorizedSelectedValue = ({
  bankTransaction,
  className,
}: BankTransactionsCategorizedSelectedValueProps) => {
  return (
    <Span align='center' ellipsis size='sm' className={className}>
      {bankTransaction.categorization_status === CategorizationStatus.SPLIT && (
        <>
          <Badge
            icon={<Scissors size={11} />}
            tooltip={(
              <SplitTooltipDetails
                classNamePrefix='Layer__bank-transaction-row'
                category={bankTransaction.category}
              />
            )}
          >
            Split
          </Badge>
          <Span ellipsis>
            {extractDescriptionForSplit(bankTransaction.category)}
          </Span>
        </>
      )}
      {bankTransaction?.categorization_status === CategorizationStatus.MATCHED
        && bankTransaction?.match && (
        <>
          <MatchBadge
            classNamePrefix='Layer__bank-transaction-row'
            bankTransaction={bankTransaction}
            dateFormat={DATE_FORMAT}
            text={isTransferMatch(bankTransaction) ? 'Transfer' : 'Match'}
          />
          <Span ellipsis>
            {`${formatTime(
              parseISO(bankTransaction.match.bank_transaction.date),
              DATE_FORMAT,
            )}, ${bankTransaction.match?.details?.description}`}
          </Span>
        </>
      )}
      {bankTransaction?.categorization_status !== CategorizationStatus.MATCHED
        && bankTransaction?.categorization_status !== CategorizationStatus.SPLIT && (
        <Span ellipsis>
          {bankTransaction?.category?.display_name}
        </Span>
      )}
    </Span>
  )
}
