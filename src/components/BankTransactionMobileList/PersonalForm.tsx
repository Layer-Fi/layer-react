import { useEffect, useRef, useState } from 'react'
import { useBankTransactionsContext } from '../../contexts/BankTransactionsContext'
import PaperclipIcon from '../../icons/Paperclip'
import { BankTransaction, CategorizationStatus } from '../../types'
import { hasReceipts, isCredit } from '../../utils/bankTransactions'
import { BankTransactionReceipts } from '../BankTransactionReceipts/BankTransactionReceipts'
import { BankTransactionReceiptsHandle } from '../BankTransactionReceipts/BankTransactionReceipts'
import { Button } from '../Button'
import { FileInput } from '../Input'
import { ErrorText } from '../Typography'
import { PersonalCategories } from './constants'
import classNames from 'classnames'
import { BankTransactionFormFields } from '../../features/bankTransactions/[bankTransactionId]/components/BankTransactionFormFields'

interface PersonalFormProps {
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

export const PersonalForm = ({
  bankTransaction,
  showReceiptUploads,
  showDescriptions,
  showCategorization,
}: PersonalFormProps) => {
  const receiptsRef = useRef<BankTransactionReceiptsHandle>(null)

  const { categorize: categorizeBankTransaction, isLoading } =
    useBankTransactionsContext()
  const [showRetry, setShowRetry] = useState(false)

  useEffect(() => {
    if (bankTransaction.error) {
      setShowRetry(true)
    }
  }, [bankTransaction.error])

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
          exclusion_type: isCredit(bankTransaction)
            ? PersonalCategories.INCOME
            : PersonalCategories.EXPENSES,
        },
      },
      true,
    )
  }

  const alreadyAssigned = isAlreadyAssigned(bankTransaction)

  return (
    <div className='Layer__bank-transaction-mobile-list-item__personal-form'>
      <BankTransactionFormFields
        bankTransaction={bankTransaction}
        showDescriptions={showDescriptions}
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
            bankTransactionId={bankTransaction.id}
            floatingActions={false}
            hideUploadButtons={true}
            label='Receipts'
          />
        )}
      </div>
      <div className='Layer__bank-transaction-mobile-list-item__actions'>
        {showReceiptUploads && (
          <FileInput
            onUpload={files => receiptsRef.current?.uploadReceipt(files[0])}
            text='Upload receipt'
            iconOnly={true}
            icon={<PaperclipIcon />}
          />
        )}
        {showCategorization
          ? (
            <Button
              fullWidth={true}
              disabled={alreadyAssigned || isLoading || bankTransaction.processing}
              onClick={save}
            >
              {isLoading || bankTransaction.processing
                ? 'Saving...'
                : alreadyAssigned
                  ? 'Saved as Personal'
                  : 'Categorize as Personal'}
            </Button>
          )
          : null}
      </div>
      {bankTransaction.error && showRetry
        ? (
          <ErrorText>
            Approval failed. Check connection and retry in few seconds.
          </ErrorText>
        )
        : null}
    </div>
  )
}
