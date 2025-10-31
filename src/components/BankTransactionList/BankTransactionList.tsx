import { DATE_FORMAT } from '../../config/general'
import { BankTransaction } from '../../types/bank_transactions'
import {
  BankTransactionCTAStringOverrides,
} from '../BankTransactions/BankTransactions'
import { BankTransactionListItem } from './BankTransactionListItem'
import { Checkbox } from '../ui/Checkbox/Checkbox'
import { Span } from '../ui/Typography/Text'
import { HStack } from '../ui/Stack/Stack'
import { useBankTransactionsTableCheckboxState } from '../../hooks/useBankTransactions/useBankTransactionsTableCheckboxState'
import { useUpsertBankTransactionsDefaultCategories } from '../../hooks/useBankTransactions/useUpsertBankTransactionsDefaultCategories'

interface BankTransactionListProps {
  bankTransactions?: BankTransaction[]
  editable: boolean
  containerWidth: number
  removeTransaction: (bt: BankTransaction) => void
  stringOverrides?: BankTransactionCTAStringOverrides

  showDescriptions: boolean
  showReceiptUploads: boolean
  showTooltips: boolean
}

export const BankTransactionList = ({
  bankTransactions,
  editable,
  removeTransaction,
  containerWidth,
  stringOverrides,

  showDescriptions,
  showReceiptUploads,
  showTooltips,
}: BankTransactionListProps) => {
  const { isAllSelected, isPartiallySelected, onHeaderCheckboxChange } = useBankTransactionsTableCheckboxState({ bankTransactions })
  useUpsertBankTransactionsDefaultCategories(bankTransactions)

  return (
    <>
      <HStack
        gap='md'
        pi='md'
        pb='md'
        align='center'
        className='Layer__bank-transactions__list-header'
      >
        <Checkbox
          isSelected={isAllSelected}
          isIndeterminate={isPartiallySelected}
          onChange={onHeaderCheckboxChange}
          aria-label='Select all transactions on this page'
        />
        <Span size='sm'>
          Select all
        </Span>
      </HStack>
      <ul className='Layer__bank-transactions__list'>
        {bankTransactions?.map(
          (bankTransaction: BankTransaction, index: number) => (
            <BankTransactionListItem
              key={bankTransaction.id}
              index={index}
              dateFormat={DATE_FORMAT}
              bankTransaction={bankTransaction}
              editable={editable}
              removeTransaction={removeTransaction}
              containerWidth={containerWidth}
              stringOverrides={stringOverrides}

              showDescriptions={showDescriptions}
              showReceiptUploads={showReceiptUploads}
              showTooltips={showTooltips}
            />
          ),
        )}
      </ul>
    </>
  )
}
