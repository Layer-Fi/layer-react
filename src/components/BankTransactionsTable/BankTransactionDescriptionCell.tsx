import { File } from 'lucide-react'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { IconBox } from '@components/IconBox/IconBox'

import './bankTransactionDescriptionCell.scss'

type BankTransactionDescriptionCellProps = {
  bankTransaction: BankTransaction
  showReceiptUploads: boolean
}

export const BankTransactionDescriptionCell = ({
  bankTransaction,
  showReceiptUploads,
}: BankTransactionDescriptionCellProps) => {
  const hasReceipt = showReceiptUploads && bankTransaction.documentIds?.length > 0

  return (
    <HStack
      gap='sm'
      align='center'
      justify='space-between'
      overflow='hidden'
      fluid
      className='Layer__BankTransactionDescriptionCell'
    >
      <Span ellipsis withTooltip>
        {bankTransaction.counterpartyName ?? bankTransaction.description}
      </Span>
      {hasReceipt && (
        <IconBox>
          <File size={12} />
        </IconBox>
      )}
    </HStack>
  )
}
