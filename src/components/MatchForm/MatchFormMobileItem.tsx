import { HStack } from '@components/ui/Stack/Stack'
import { Span } from '@components/ui/Typography/Text'
import { GridListItem } from 'react-aria-components'
import { Checkbox } from '@components/ui/Checkbox/Checkbox'
import { BankTransactionsAmountDate } from '@components/BankTransactions/BankTransactionsAmountDate'
import { BankTransaction, SuggestedMatch } from '@internal-types/bank_transactions'

interface MatchFormMobileItemProps {
  match: SuggestedMatch
  bankTransaction: BankTransaction
  inAppLink: React.ReactNode
}

export const MatchFormMobileItem = ({ match, bankTransaction, inAppLink }: MatchFormMobileItemProps) => {
  return (
    <GridListItem
      id={match.id}
      key={match.id}
      textValue={match.details.description}
    >
      <HStack gap='md' pis='md'>
        <Checkbox
          slot='selection'
          variant='round'
        />
        <Span pbs='sm' size='sm'>
          {match.details.description}
        </Span>
        <BankTransactionsAmountDate
          bankTransaction={bankTransaction}
          slotProps={{
            amount: { size: 'sm' },
            date: { size: 'xs' },
          }}
        />
        <HStack>
          {inAppLink}
        </HStack>
      </HStack>
    </GridListItem>
  )
}
