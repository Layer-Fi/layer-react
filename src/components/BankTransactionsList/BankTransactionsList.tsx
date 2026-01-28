import { type BankTransaction } from '@internal-types/bank_transactions'
import { DATE_FORMAT } from '@config/general'
import { useBankTransactionsTableCheckboxState } from '@hooks/useBankTransactions/useBankTransactionsTableCheckboxState'
import { useUpsertBankTransactionsDefaultCategories } from '@hooks/useBankTransactions/useUpsertBankTransactionsDefaultCategories'
import { useBankTransactionsIsCategorizationEnabledContext } from '@contexts/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import { Checkbox } from '@ui/Checkbox/Checkbox'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import {
  type BankTransactionCTAStringOverrides,
} from '@components/BankTransactions/BankTransactions'
import { BankTransactionsListItem } from '@components/BankTransactionsList/BankTransactionsListItem'

interface BankTransactionsListProps {
  bankTransactions?: BankTransaction[]
  stringOverrides?: BankTransactionCTAStringOverrides

  showDescriptions: boolean
  showReceiptUploads: boolean
  showTooltips: boolean
}

export const BankTransactionsList = ({
  bankTransactions,
  stringOverrides,

  showDescriptions,
  showReceiptUploads,
  showTooltips,
}: BankTransactionsListProps) => {
  const { isAllSelected, isPartiallySelected, onHeaderCheckboxChange } = useBankTransactionsTableCheckboxState({ bankTransactions })
  useUpsertBankTransactionsDefaultCategories(bankTransactions)

  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabledContext()

  return (
    <>
      {isCategorizationEnabled && (
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
      )}
      <ul className='Layer__bank-transactions__list'>
        {bankTransactions?.map(
          (bankTransaction: BankTransaction, index: number) => (
            <BankTransactionsListItem
              key={bankTransaction.id}
              index={index}
              dateFormat={DATE_FORMAT}
              bankTransaction={bankTransaction}
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
