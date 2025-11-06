import { Text, TextSize, TextWeight } from '@components/Typography/Text'
import { ErrorText } from '@components/Typography/ErrorText'
import { FileInput } from '@components/Input/FileInput'
import { TextButton } from '@components/Button/TextButton'
import { Button, ButtonVariant } from '@components/Button/Button'
import { useEffect, useRef, useState } from 'react'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import PaperclipIcon from '@icons/Paperclip'
import Trash from '@icons/Trash'
import { BankTransaction } from '@internal-types/bank_transactions'
import { hasReceipts } from '@utils/bankTransactions'
import { BankTransactionReceipts } from '@components/BankTransactionReceipts/BankTransactionReceipts'
import { BankTransactionReceiptsHandle } from '@components/BankTransactionReceipts/BankTransactionReceipts'
import classNames from 'classnames'
import { BankTransactionFormFields } from '@features/bankTransactions/[bankTransactionId]/components/BankTransactionFormFields'
import { CategorySelectDrawerWithTrigger } from '@components/CategorySelect/CategorySelectDrawerWithTrigger'
import { getSplitsErrorMessage, isSplitsValid } from '@components/ExpandedBankTransactionRow/utils'
import { HStack } from '@ui/Stack/Stack'
import { useGetBankTransactionCategory } from '@providers/BankTransactionsCategoryStore/BankTransactionsCategoryStoreProvider'
import { useSplitsForm } from '@hooks/useBankTransactions/useSplitsForm'
import { AmountInput } from '@components/Input/AmountInput'
import { buildCategorizeBankTransactionPayloadForSplit } from '@hooks/useBankTransactions/utils'
import { useBulkSelectionActions } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'

interface SplitFormProps {
  bankTransaction: BankTransaction
  showTooltips: boolean
  showCategorization?: boolean
  showReceiptUploads?: boolean
  showDescriptions?: boolean
}

export const SplitForm = ({
  bankTransaction,
  showTooltips,
  showCategorization,
  showReceiptUploads,
  showDescriptions,
}: SplitFormProps) => {
  const receiptsRef = useRef<BankTransactionReceiptsHandle>(null)

  const {
    categorize: categorizeBankTransaction,
    isLoading,
  } = useBankTransactionsContext()

  const { selectedCategory } = useGetBankTransactionCategory(bankTransaction.id)
  const [showRetry, setShowRetry] = useState(false)

  const { deselect } = useBulkSelectionActions()

  const {
    localSplits,
    splitFormError: formError,
    addSplit,
    removeSplit,
    updateSplitAmount,
    changeCategoryForSplitAtIndex,
    getInputValueForSplitAtIndex,
    setSplitFormError,
    onBlurSplitAmount,
  } = useSplitsForm({
    bankTransaction,
    selectedCategory,
  })

  useEffect(() => {
    if (bankTransaction.error) {
      setShowRetry(true)
    }
  }, [bankTransaction.error])

  const save = async () => {
    if (!isSplitsValid(localSplits)) {
      setSplitFormError(getSplitsErrorMessage(localSplits))
      return
    }

    const categorizationRequest = buildCategorizeBankTransactionPayloadForSplit(localSplits)

    await categorizeBankTransaction(
      bankTransaction.id,
      categorizationRequest,
    )

    // Remove from bulk selection store
    deselect(bankTransaction.id)
    close()
  }

  return (
    <div>
      {showCategorization
        ? (
          <>
            <Text weight={TextWeight.bold} size={TextSize.sm}>
              Split transaction
            </Text>
            <div className='Layer__bank-transactions__table-cell__header'>
              <Text size={TextSize.sm}>Category</Text>
              <Text size={TextSize.sm}>Amount</Text>
            </div>
            <div className='Layer__bank-transactions__splits-inputs'>
              {localSplits.map((split, index) => (
                <div
                  className='Layer__bank-transactions__table-cell--split-entry'
                  key={`split-${index}`}
                >
                  <div className='Layer__bank-transactions__table-cell--split-entry__right-col'>
                    <CategorySelectDrawerWithTrigger
                      value={split.category}
                      onChange={value => changeCategoryForSplitAtIndex(index, value)}
                      showTooltips={showTooltips}
                    />
                  </div>
                  <AmountInput
                    name={`split-${index}`}
                    disabled={index === 0 || !showCategorization}
                    onChange={updateSplitAmount(index)}
                    value={getInputValueForSplitAtIndex(index, split)}
                    onBlur={onBlurSplitAmount}
                    isInvalid={split.amount < 0}
                  />
                  {index > 0 && (
                    <Button
                      className='Layer__bank-transactions__table-cell--split-entry__merge-btn'
                      onClick={() => removeSplit(index)}
                      rightIcon={<Trash size={16} />}
                      variant={ButtonVariant.secondary}
                      iconOnly={true}
                    />
                  )}
                </div>
              ))}
              <TextButton
                onClick={addSplit}
                disabled={isLoading}
                className='Layer__add-new-split'
              >
                Add new split
              </TextButton>
            </div>
          </>
        )
        : null}
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
        {showCategorization && (
          <Button
            fullWidth={true}
            onClick={() => void save()}
            disabled={isLoading || bankTransaction.processing}
          >
            {isLoading || bankTransaction.processing ? 'Saving...' : 'Save'}
          </Button>
        )}
      </div>
      {formError && <HStack pb='sm'><ErrorText>{formError}</ErrorText></HStack>}
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
