import { parseISO, format as formatTime } from 'date-fns'
import Scissors from '@icons/Scissors'
import { BankTransaction } from '@internal-types/bank_transactions'
import { CategorizationStatus } from '@schemas/bankTransactions/bankTransaction'
import { isTransferMatch } from '@utils/bankTransactions'
import { Badge } from '@components/Badge'
import { Span } from '@ui/Typography/Text'
import { extractDescriptionForSplit } from '@components/BankTransactionRow/BankTransactionRow'
import { DATE_FORMAT } from '@config/general'
import { HStack } from '@ui/Stack/Stack'
import { BadgeSize } from '@components/Badge/Badge'
import MinimizeTwo from '@icons/MinimizeTwo'

type BankTransactionsCategorizedSelectedValueProps = {
  bankTransaction: BankTransaction
  className?: string
}

export const BankTransactionsCategorizedSelectedValue = ({
  bankTransaction,
  className,
}: BankTransactionsCategorizedSelectedValueProps) => {
  if (bankTransaction.categorization_status === CategorizationStatus.MATCHED && bankTransaction.match) {
    return (
      <HStack gap='xs' align='center' className={className}>
        <Badge size={BadgeSize.SMALL} icon={<MinimizeTwo size={11} />}>
          {isTransferMatch(bankTransaction) ? 'Transfer' : 'Match'}
        </Badge>
        <Span ellipsis size='sm'>
          {`${formatTime(
            parseISO(bankTransaction.match.bank_transaction.date),
            DATE_FORMAT,
          )}, ${bankTransaction.match?.details?.description}`}
        </Span>
      </HStack>
    )
  }

  if (bankTransaction.categorization_status === CategorizationStatus.SPLIT) {
    return (
      <HStack gap='xs' align='center' className={className}>
        <Badge size={BadgeSize.SMALL} icon={<Scissors size={11} />}>
          Split
        </Badge>
        <Span ellipsis size='sm'>
          {extractDescriptionForSplit(bankTransaction.category)}
        </Span>
      </HStack>
    )
  }

  return <Span ellipsis size='sm' className={className}>{bankTransaction.category?.display_name}</Span>
}
