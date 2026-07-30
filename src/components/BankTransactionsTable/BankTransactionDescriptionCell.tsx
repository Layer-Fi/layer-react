import { File } from 'lucide-react'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { IconBox } from '@ui/IconBox/IconBox'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { EditCustomTransactionButton } from '@components/BankTransactions/RecordManualTransaction/EditCustomTransactionButton'
import { useIsEditableCustomTransaction } from '@components/BankTransactions/RecordManualTransaction/useIsEditableCustomTransaction'

import './bankTransactionDescriptionCell.scss'

type BankTransactionDescriptionCellProps = {
  bankTransaction: BankTransaction
}

export const BankTransactionDescriptionCell = ({
  bankTransaction,
}: BankTransactionDescriptionCellProps) => {
  const hasReceipt = bankTransaction.documentIds?.length > 0
  const isEditable = useIsEditableCustomTransaction(bankTransaction)

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
        {isEditable && <EditCustomTransactionButton bankTransaction={bankTransaction} />}
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
