import { GridListItem } from 'react-aria-components'

import { type BankTransaction, type SuggestedMatch } from '@internal-types/bank_transactions'
import { isCredit } from '@utils/bankTransactions'
import { Checkbox } from '@ui/Checkbox/Checkbox'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { BankTransactionsAmountDate } from '@components/BankTransactions/BankTransactionsAmountDate'

import './matchFormMobileItem.scss'

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
      <HStack pi='md' gap='md' justify='space-between'>
        <HStack align='center'>
          <Checkbox
            slot='selection'
            variant='round'
            className='Layer__MatchFormMobileItem__Checkbox'
          />
          <Span size='sm'>
            {match.details.description}
          </Span>
        </HStack>
        <BankTransactionsAmountDate
          amount={match.details.amount}
          date={match.details.date}
          slotProps={{
            MoneySpan: { size: 'sm', displayPlusSign: isCredit(bankTransaction) },
            DateTime: { size: 'xs' },
          }}
        />
        {inAppLink && (
          <HStack align='center'>
            <Span size='sm'>
              {inAppLink}
            </Span>
          </HStack>
        )}
      </HStack>
    </GridListItem>
  )
}
