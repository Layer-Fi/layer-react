import { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'

import { type BankTransaction } from '@internal-types/bank_transactions'
import { CategorizationStatus } from '@schemas/bankTransactions/bankTransaction'
import { hasReceipts, isCredit } from '@utils/bankTransactions'
import { useCategorizeBankTransactionWithCacheUpdate } from '@hooks/useBankTransactions/useCategorizeBankTransactionWithCacheUpdate'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import PaperclipIcon from '@icons/Paperclip'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { BankTransactionReceipts } from '@components/BankTransactionReceipts/BankTransactionReceipts'
import { type BankTransactionReceiptsHandle } from '@components/BankTransactionReceipts/BankTransactionReceipts'
import { PersonalCategories } from '@components/BankTransactionsMobileList/constants'
import { FileInput } from '@components/Input/FileInput'
import { ErrorText } from '@components/Typography/ErrorText'
import { BankTransactionFormFields } from '@features/bankTransactions/[bankTransactionId]/components/BankTransactionFormFields'

interface BankTransactionsMobileListPersonalFormProps {
  bankTransaction: BankTransaction
  showReceiptUploads?: boolean
  showDescriptions?: boolean
  showCategorization?: boolean
}

const isAlreadyAssigned = (bankTransaction: BankTransaction) => {
  if (
    bankTransaction.categorization_status === CategorizationStatus.MATCHED
    || bankTransaction?.categorization_status === CategorizationStatus.SPLIT
  ) {
    return false
  }

  return Boolean(
    bankTransaction.category
    && Object.values(PersonalCategories).includes(
      bankTransaction.category.display_name as PersonalCategories,
    ),
  )
}

export const BankTransactionsMobileListPersonalForm = ({
  bankTransaction,
  showReceiptUploads,
  showDescriptions,
  showCategorization,
}: BankTransactionsMobileListPersonalFormProps) => {
  const receiptsRef = useRef<BankTransactionReceiptsHandle>(null)

  const { isLoading: isLoadingBankTransactions } = useBankTransactionsContext()

  const {
    categorize: categorizeBankTransaction,
    isMutating: isCategorizing,
    isError: isErrorCategorizing,
  } = useCategorizeBankTransactionWithCacheUpdate()

  const [showRetry, setShowRetry] = useState(false)

  useEffect(() => {
    if (isErrorCategorizing) {
      setShowRetry(true)
    }
  }, [isErrorCategorizing])

  const save = () => {
    if (!showCategorization) {
      return
    }

    void categorizeBankTransaction(
      bankTransaction.id,
      {
        type: 'Category',
        category: {
          type: 'Exclusion',
          exclusionType: isCredit(bankTransaction)
            ? PersonalCategories.INCOME
            : PersonalCategories.EXPENSES,
        },
      },
      true,
    )
  }

  const alreadyAssigned = isAlreadyAssigned(bankTransaction)

  return (
    <VStack gap='sm'>
      <BankTransactionFormFields
        bankTransaction={bankTransaction}
        showDescriptions={showDescriptions}
        hideCustomerVendor
        hideTags
      />
      <div
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
            label='Receipts'
          />
        )}
      </div>
      <HStack gap='md'>
        {showReceiptUploads && (
          <FileInput
            onUpload={files => receiptsRef.current?.uploadReceipt(files[0])}
            text='Upload receipt'
            iconOnly={true}
            icon={<PaperclipIcon />}
          />
        )}
        {showCategorization
          && (
            <Button
              fullWidth
              onClick={save}
              isDisabled={alreadyAssigned || isLoadingBankTransactions || isCategorizing}
            >
              {isCategorizing
                ? 'Confirming...'
                : alreadyAssigned
                  ? 'Confirmed'
                  : 'Mark as Personal'}
            </Button>
          )}
      </HStack>
      {isErrorCategorizing && showRetry
        ? (
          <ErrorText>
            Approval failed. Check connection and retry in few seconds.
          </ErrorText>
        )
        : null}
    </VStack>
  )
}
