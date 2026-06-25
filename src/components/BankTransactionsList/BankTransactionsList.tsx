import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { useBankTransactionsTableCheckboxState } from '@hooks/features/bankTransactions/useBankTransactionsTableCheckboxState'
import { useUpsertBankTransactionsDefaultCategories } from '@hooks/features/bankTransactions/useUpsertBankTransactionsDefaultCategories'
import { useBankTransactionsIsCategorizationEnabledContext } from '@contexts/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import { Checkbox } from '@ui/Checkbox/Checkbox'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import {
  type BankTransactionCTAStringOverrides,
} from '@components/BankTransactions/BankTransactions'
import { BankTransactionsPaginatedList } from '@components/BankTransactions/BankTransactionsPaginatedList'
import { BankTransactionsListItem } from '@components/BankTransactionsList/BankTransactionsListItem'
import type { TablePaginationProps } from '@components/PaginatedDataTable/PaginatedDataTable'

import './bankTransactionsList.scss'

interface BankTransactionsListProps {
  bankTransactions?: BankTransaction[]
  stringOverrides?: BankTransactionCTAStringOverrides
  isMonthlyViewMode: boolean
  paginationProps: TablePaginationProps

  showDescriptions: boolean
  showReceiptUploads: boolean
  showTooltips: boolean
}

type BankTransactionsListContentProps = Pick<
  BankTransactionsListProps,
  'bankTransactions' | 'stringOverrides' | 'showDescriptions' | 'showReceiptUploads' | 'showTooltips'
>

const BankTransactionsListContent = ({
  bankTransactions,
  stringOverrides,
  showDescriptions,
  showReceiptUploads,
  showTooltips,
}: BankTransactionsListContentProps) => {
  const { t } = useTranslation()
  const { isAllSelected, isPartiallySelected, onHeaderCheckboxChange } = useBankTransactionsTableCheckboxState({ bankTransactions })
  useUpsertBankTransactionsDefaultCategories(bankTransactions)

  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabledContext()

  return (
    <>
      {isCategorizationEnabled && (
        <HStack gap='md' pi='md' pb='md' align='center'>
          <Checkbox
            isSelected={isAllSelected}
            isIndeterminate={isPartiallySelected}
            onChange={onHeaderCheckboxChange}
            aria-label={t('bankTransactions:label.select_all_transactions', 'Select all transactions on this page')}
          />
          <Span size='sm'>
            {t('common:label.select_all', 'Select all')}
          </Span>
        </HStack>
      )}
      <ul className='Layer__bank-transactions__list'>
        {bankTransactions?.map((bankTransaction: BankTransaction) => (
          <BankTransactionsListItem
            key={bankTransaction.id}
            bankTransaction={bankTransaction}
            stringOverrides={stringOverrides}

            showDescriptions={showDescriptions}
            showReceiptUploads={showReceiptUploads}
            showTooltips={showTooltips}
          />
        ))}
      </ul>
    </>
  )
}

export const BankTransactionsList = ({
  bankTransactions,
  isMonthlyViewMode,
  paginationProps,
  ...contentProps
}: BankTransactionsListProps) => (
  <BankTransactionsPaginatedList
    bankTransactions={bankTransactions}
    isMonthlyViewMode={isMonthlyViewMode}
    paginationProps={paginationProps}
  >
    {displayedTransactions => (
      <BankTransactionsListContent bankTransactions={displayedTransactions} {...contentProps} />
    )}
  </BankTransactionsPaginatedList>
)
