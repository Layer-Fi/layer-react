import { type Meta, type StoryObj } from '@storybook/react-vite'

import { type BankTransaction } from '@internal-types/features/bankTransactions/bankTransaction'
import { type MatchDetailsWithFallbackType } from '@schemas/features/bankTransactions/matchDetails'
import { pickCyclic } from '@utils/shared/array/pickCyclic'
import { BankTransactions } from '@features/bankTransactions/BankTransactions/BankTransactions'

import { bankTransactions } from '@fixtures/generated/bankTransactions.gen'
import { get as getBankTransactions } from '@msw/api/businesses/[business-id]/bank-transactions/get'
import { handlers } from '@msw/handlers'

const withSuggestedMatch = (
  transaction: BankTransaction,
  details: MatchDetailsWithFallbackType,
): BankTransaction => ({
  ...transaction,
  suggestedMatches: [{ id: `${transaction.id}-scratch-suggested-match`, details }],
})

const matchDetailsBase = (transaction: BankTransaction) => ({
  id: `${transaction.id}-scratch-match-details`,
  amount: transaction.amount,
  date: transaction.date,
  adjustment: null,
})

const firstTransaction = pickCyclic(bankTransactions, 0)
const secondTransaction = pickCyclic(bankTransactions, 1)
const otherTransactions = bankTransactions.slice(2)

const loanMatchTransactions: readonly BankTransaction[] = [
  withSuggestedMatch(firstTransaction, {
    ...matchDetailsBase(firstTransaction),
    type: 'Loan_Payment_Match',
    description: 'Loan payment for Prime Lending loan',
    loanIdentifiers: { id: `loan-${firstTransaction.id}`, referenceNumber: 'LOAN-1042' },
  }),
  withSuggestedMatch(secondTransaction, {
    ...matchDetailsBase(secondTransaction),
    type: 'Some_Future_Match',
    description: 'A match detail type this package does not know about yet',
  }),
  ...otherTransactions,
]

const meta: Meta<typeof BankTransactions> = {
  title: 'Scratch/BankTransactionsLoanMatches',
  component: BankTransactions,
  parameters: {
    msw: { handlers: [getBankTransactions.mock(loanMatchTransactions), ...handlers] },
  },
  decorators: [
    Story => (
      <div
        className='BankTransactionsPage'
        style={{ display: 'grid', paddingBlock: '2rem', paddingInline: '3rem' }}
      >
        <div
          className='BankTransactionsContainer'
          style={{ display: 'grid', minInlineSize: '20rem', maxInlineSize: '80rem' }}
        >
          <Story />
        </div>
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof BankTransactions>

export const ScratchLoanAndUnknownMatches: Story = {}
