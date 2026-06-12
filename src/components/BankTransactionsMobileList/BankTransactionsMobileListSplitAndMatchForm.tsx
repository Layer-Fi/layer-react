import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { hasMatch } from '@utils/bankTransactions/shared'
import { useGetBankTransactionCategorizationWithDefault } from '@hooks/features/bankTransactions/useGetBankTransactionCategorizationWithDefault'
import { BankTransactionSelectionVariant, useBankTransactionsCategorizationActions } from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { Button } from '@ui/Button/Button'
import { BankTransactionsMobileListMatchForm } from '@components/BankTransactionsMobileList/BankTransactionsMobileListMatchForm'
import { BankTransactionsMobileListSplitForm } from '@components/BankTransactionsMobileList/BankTransactionsMobileListSplitForm'

interface BankTransactionsMobileListSplitAndMatchFormProps {
  bankTransaction: BankTransaction
  showTooltips: boolean
  showCategorization?: boolean
  showReceiptUploads?: boolean
  showDescriptions?: boolean
}

export const BankTransactionsMobileListSplitAndMatchForm = ({
  bankTransaction,
  showTooltips,
  showReceiptUploads,
  showDescriptions,
  showCategorization,
}: BankTransactionsMobileListSplitAndMatchFormProps) => {
  const { t } = useTranslation()
  const anyMatch = hasMatch(bankTransaction)

  const selectedCategorization = useGetBankTransactionCategorizationWithDefault(bankTransaction)
  const { variant } = selectedCategorization
  const { setTransactionSelectionVariant } = useBankTransactionsCategorizationActions()

  return (
    <>
      {variant === BankTransactionSelectionVariant.CATEGORY && (
        <BankTransactionsMobileListSplitForm
          bankTransaction={bankTransaction}
          showTooltips={showTooltips}
          showReceiptUploads={showReceiptUploads}
          showDescriptions={showDescriptions}
          showCategorization={showCategorization}
        />
      )}
      {variant === BankTransactionSelectionVariant.MATCH && (
        <BankTransactionsMobileListMatchForm
          bankTransaction={bankTransaction}
          showReceiptUploads={showReceiptUploads}
          showDescriptions={showDescriptions}
          showCategorization={showCategorization}
        />
      )}
      {showCategorization && anyMatch && (
        variant === BankTransactionSelectionVariant.MATCH
          ? (
            <Button variant='text' onPress={() => setTransactionSelectionVariant(bankTransaction.id, BankTransactionSelectionVariant.CATEGORY)}>
              {t('bankTransactions:action.or_split_transaction', 'or split transaction')}
            </Button>
          )
          : (
            <Button variant='text' onPress={() => setTransactionSelectionVariant(bankTransaction.id, BankTransactionSelectionVariant.MATCH)}>
              {t('bankTransactions:action.or_find_match', 'or find match')}
            </Button>
          )
      )}
    </>
  )
}
