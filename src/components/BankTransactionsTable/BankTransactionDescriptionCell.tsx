import { File } from 'lucide-react'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { useIsEditableCustomBankTransaction } from '@hooks/features/bankTransactions/useIsEditableCustomBankTransaction'
import { IconBox } from '@ui/IconBox/IconBox'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { EditCustomBankTransactionButton } from '@features/bankTransactions/EditCustomBankTransactionButton/EditCustomBankTransactionButton'

import './bankTransactionDescriptionCell.scss'

type BankTransactionDescriptionCellProps = {
  bankTransaction: BankTransaction
}

export const BankTransactionDescriptionCell = ({
  bankTransaction,
}: BankTransactionDescriptionCellProps) => {
  const hasReceipt = bankTransaction.documentIds?.length > 0
  const isEditable = useIsEditableCustomBankTransaction(bankTransaction)

  return (
    <HStack
      gap='sm'
      align='center'
      justify='space-between'
      overflow='hidden'
      fluid
      className='Layer__BankTransactionDescriptionCell'
    >
      <HStack gap='4xs' align='center' overflow='hidden'>
        {isEditable && <EditCustomBankTransactionButton bankTransaction={bankTransaction} />}
        <Span ellipsis withTooltip>{bankTransaction.description}</Span>
      </HStack>
      {hasReceipt && (
        <IconBox>
          <File size={12} />
        </IconBox>
      )}
    </HStack>
  )
}
