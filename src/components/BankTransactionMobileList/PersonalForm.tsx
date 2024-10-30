import React, { useEffect, useRef, useState } from 'react'
import { useBankTransactionsContext } from '../../contexts/BankTransactionsContext'
import PaperclipIcon from '../../icons/Paperclip'
import { BankTransaction, CategorizationStatus } from '../../types'
import { hasReceipts, isCredit } from '../../utils/bankTransactions'
import { BankTransactionReceipts } from '../BankTransactionReceipts'
import { BankTransactionReceiptsHandle } from '../BankTransactionReceipts/BankTransactionReceipts'
import { Button } from '../Button'
import { FileInput, InputGroup } from '../Input'
import { Textarea } from '../Textarea'
import { Text, ErrorText, TextSize } from '../Typography'
import { PersonalCategories } from './constants'
import { useMemoTextContext } from './useMemoText'
import classNames from 'classnames'

interface PersonalFormProps {
  bankTransaction: BankTransaction
  showReceiptUploads?: boolean
  showDescriptions?: boolean
  isOpen?: boolean
}

const isAlreadyAssigned = (bankTransaction: BankTransaction) => {
  if (
    bankTransaction.categorization_status === CategorizationStatus.MATCHED ||
    bankTransaction?.categorization_status === CategorizationStatus.SPLIT
  ) {
    return false
  }

  return Boolean(
    bankTransaction.category &&
      Object.values(PersonalCategories).includes(
        bankTransaction.category.display_name as PersonalCategories,
      ),
  )
}

export const PersonalForm = ({
  bankTransaction,
  showReceiptUploads,
  isOpen,
  showDescriptions,
}: PersonalFormProps) => {
  const receiptsRef = useRef<BankTransactionReceiptsHandle>(null)

  const { categorize: categorizeBankTransaction, isLoading } =
    useBankTransactionsContext()
  const [showRetry, setShowRetry] = useState(false)
  const { memoText, setMemoText, saveMemoText } = useMemoTextContext()

  useEffect(() => {
    if (bankTransaction.error) {
      setShowRetry(true)
    }
  }, [bankTransaction.error])

  const save = () => {
    if (showDescriptions && memoText !== undefined) {
      saveMemoText()
    }

    categorizeBankTransaction(
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
      {showDescriptions && (
        <InputGroup
          className='Layer__bank-transaction-mobile-list-item__description'
          name='description'
        >
          <Text
            size={TextSize.sm}
            className='Layer__bank-transaction-mobile-list-item__description__label'
          >
            Description
          </Text>
          <Textarea
            name='description'
            placeholder='Add description'
            value={memoText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setMemoText(e.target.value)
            }
          />
        </InputGroup>
      )}
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
      <div className='Layer__bank-transaction-mobile-list-item__actions'>
        {showReceiptUploads && (
          <FileInput
            onUpload={receiptsRef.current?.uploadReceipt}
            text='Upload receipt'
            iconOnly={true}
            icon={<PaperclipIcon />}
          />
        )}
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
      </div>
      {bankTransaction.error && showRetry ? (
        <ErrorText>
          Approval failed. Check connection and retry in few seconds.
        </ErrorText>
      ) : null}
    </div>
  )
}
