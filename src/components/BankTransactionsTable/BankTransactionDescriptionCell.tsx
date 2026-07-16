import { File } from 'lucide-react'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { getBankTransactionDisplayName, isCustomTransaction } from '@utils/bankTransactions/shared'
import { BankTransactionsFeature, useIsBankTransactionsFeatureEnabled } from '@providers/BankTransactionsFeatureVisibility/BankTransactionsFeatureVisibilityProvider'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { EditCustomTransactionButton } from '@components/BankTransactions/RecordManualTransaction/EditCustomTransactionButton'
import { IconBox } from '@components/IconBox/IconBox'

import './bankTransactionDescriptionCell.scss'

type BankTransactionDescriptionCellProps = {
  bankTransaction: BankTransaction
}

export const BankTransactionDescriptionCell = ({
  bankTransaction,
}: BankTransactionDescriptionCellProps) => {
  const showReceiptUploads = useIsBankTransactionsFeatureEnabled(BankTransactionsFeature.ReceiptUploads)
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
      <HStack gap='xs' align='center' overflow='hidden'>
        {isCustomTransaction(bankTransaction) && (
          <EditCustomTransactionButton bankTransaction={bankTransaction} />
        )}
        <Span ellipsis withTooltip>
          {getBankTransactionDisplayName(bankTransaction)}
        </Span>
      </HStack>
      {hasReceipt && (
        <IconBox>
          <File size={12} />
        </IconBox>
      )}
    </HStack>
  )
}
