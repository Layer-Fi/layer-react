import { type BankTransaction } from '@internal-types/bankTransactions'
import { VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

import './bankTransactionAccountCell.scss'

type BankTransactionAccountCellProps = {
  bankTransaction: BankTransaction
}

export const BankTransactionAccountCell = ({ bankTransaction }: BankTransactionAccountCellProps) => (
  <VStack align='start' className='Layer__BankTransactionAccountCell'>
    <Span ellipsis className='Layer__BankTransactionAccountCell__Line'>
      {bankTransaction.accountName}
      {bankTransaction.accountMask && ` ${bankTransaction.accountMask}`}
    </Span>
    {bankTransaction.accountInstitution?.name && (
      <Span ellipsis className='Layer__BankTransactionAccountCell__Line' variant='subtle' size='sm'>
        {bankTransaction.accountInstitution.name}
      </Span>
    )}
  </VStack>
)
