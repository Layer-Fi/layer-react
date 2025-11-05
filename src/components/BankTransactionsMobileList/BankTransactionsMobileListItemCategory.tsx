import { BankTransaction } from '../../types/bank_transactions'
import { CategorizationStatus } from '../../schemas/bankTransactions/bankTransaction'
import { isTransferMatch } from '../../utils/bankTransactions'
import { isCategorized } from '../BankTransactions/utils'
import { Span } from '../ui/Typography/Text'
import { Badge, BadgeSize } from '../Badge/Badge'
import { MatchBadge } from '../BankTransactionRow/MatchBadge'
import { extractDescriptionForSplit } from '../BankTransactionRow/BankTransactionRow'
import { parseISO, format as formatTime } from 'date-fns'
import { useGetBankTransactionCategory } from '../../providers/BankTransactionsCategoryStore/BankTransactionsCategoryStoreProvider'
import Scissors from '../../icons/Scissors'

const DATE_FORMAT = 'LLL d'
const CLASS_NAME = 'Layer__bank-transaction-mobile-list-item'

export interface BankTransactionsMobileListItemCategoryProps {
  bankTransaction: BankTransaction
}

export const BankTransactionsMobileListItemCategory = ({
  bankTransaction,
}: BankTransactionsMobileListItemCategoryProps) => {
  const categorized = isCategorized(bankTransaction)
  const { selectedCategory } = useGetBankTransactionCategory(bankTransaction.id)

  if (categorized) {
    return (
      <>
        {bankTransaction.categorization_status === CategorizationStatus.SPLIT && (
          <>
            <Badge
              size={BadgeSize.SMALL}
              icon={<Scissors size={11} />}
            >
              Split
            </Badge>
            <Span size='sm' ellipsis>
              {extractDescriptionForSplit(bankTransaction.category)}
            </Span>
          </>
        )}
        {bankTransaction.categorization_status === CategorizationStatus.MATCHED
          && bankTransaction.match && (
          <>
            <MatchBadge
              classNamePrefix={CLASS_NAME}
              bankTransaction={bankTransaction}
              dateFormat={DATE_FORMAT}
              text={isTransferMatch(bankTransaction) ? 'Transfer' : 'Match'}
            />
            <Span size='sm' ellipsis>
              {`${formatTime(
                parseISO(bankTransaction.match.bank_transaction.date),
                DATE_FORMAT,
              )}, ${bankTransaction.match?.details?.description}`}
            </Span>
          </>
        )}
        {bankTransaction.categorization_status !== CategorizationStatus.MATCHED
          && bankTransaction.categorization_status !== CategorizationStatus.SPLIT && (
          <Span size='sm'>
            {bankTransaction.category?.display_name}
          </Span>
        )}
      </>
    )
  }

  return (
    <Span size='sm'>
      {selectedCategory?.label ?? 'No category selected'}
    </Span>
  )
}
