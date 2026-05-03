import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { hasReceipts } from '@utils/bankTransactions/shared'
import { VStack } from '@ui/Stack/Stack'
import { BankTransactionReceipts } from '@components/BankTransactionReceipts/BankTransactionReceipts'

import { useBankTransactionsMobileListSplitFormContext } from './BankTransactionsMobileListSplitFormContext'

export const BankTransactionsMobileListSplitFormReceiptSection = () => {
  const { t } = useTranslation()
  const {
    transaction: {
      bankTransaction,
      showReceiptUploads,
    },
    receipts: { receiptsRef },
  } = useBankTransactionsMobileListSplitFormContext()

  return (
    <VStack
      className={classNames(
        'Layer__bank-transaction-mobile-list-item__receipts',
        hasReceipts(bankTransaction)
          ? 'Layer__bank-transaction-mobile-list-item__actions--with-receipts'
          : undefined,
      )}
    >
      {showReceiptUploads && (
        <BankTransactionReceipts
          ref={receiptsRef}
          floatingActions={false}
          hideUploadButtons={true}
          label={t('bankTransactions:label.receipts', 'Receipts')}
        />
      )}
    </VStack>
  )
}
