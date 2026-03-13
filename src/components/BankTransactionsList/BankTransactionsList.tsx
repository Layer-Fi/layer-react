import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { DATE_FORMAT } from '@utils/time/timeFormats'
import { useBankTransactionsTableCheckboxState } from '@hooks/features/bankTransactions/useBankTransactionsTableCheckboxState'
import { useUpsertBankTransactionsDefaultCategories } from '@hooks/features/bankTransactions/useUpsertBankTransactionsDefaultCategories'
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
  const { t } = useTranslation()
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
            aria-label={t('selectAllTransactionsOnThisPage', 'Select all transactions on this page')}
          />
          <Span size='sm'>
            {t('selectAll', 'Select all')}
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
