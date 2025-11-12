import { Text, TextSize, TextWeight } from '@components/Typography/Text'
import { ErrorText } from '@components/Typography/ErrorText'
import { FileInput } from '@components/Input/FileInput'
import { Button } from '@ui/Button/Button'
import { useCallback, useEffect, useRef, useState } from 'react'
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
import { useGetBankTransactionCategory } from '@providers/BankTransactionsCategoryStore/BankTransactionsCategoryStoreProvider'
import { useSplitsForm } from '@hooks/useBankTransactions/useSplitsForm'
import { AmountInput } from '@components/Input/AmountInput'
import { buildCategorizeBankTransactionPayloadForSplit } from '@hooks/useBankTransactions/utils'
import { useBulkSelectionActions } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { HStack, VStack } from '@components/ui/Stack/Stack'
import Scissors from '@icons/Scissors'
import './bankTransactionsMobileListSplitForm.scss'
import { BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'

interface BankTransactionsMobileListSplitFormProps {
  bankTransaction: BankTransaction
  showTooltips: boolean
  showCategorization?: boolean
  showReceiptUploads?: boolean
  showDescriptions?: boolean
}

export const BankTransactionsMobileListSplitForm = ({
  bankTransaction,
  showTooltips,
  showCategorization,
  showReceiptUploads,
  showDescriptions,
}: BankTransactionsMobileListSplitFormProps) => {
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
    splitFormError,
    isValid,
    addSplit,
    removeSplit,
    updateSplitAmount,
    changeCategoryForSplitAtIndex,
    getInputValueForSplitAtIndex,
    onBlurSplitAmount,
  } = useSplitsForm({
    bankTransaction,
    selectedCategory,
  })

  const effectiveSplits = showCategorization
    ? localSplits
    : []

  const addSplitButtonText = effectiveSplits.length > 1
    ? 'Add new split'
    : 'Split'

  useEffect(() => {
    if (bankTransaction.error) {
      setShowRetry(true)
    }
  }, [bankTransaction.error])

  const save = () => {
    if (!isValid) return

    const categorizationRequest = buildCategorizeBankTransactionPayloadForSplit(localSplits)

    void categorizeBankTransaction(
      bankTransaction.id,
      categorizationRequest,
    )

    // Remove from bulk selection store
    deselect(bankTransaction.id)
    close()
  }

  const handleCategoryChange = useCallback((index: number) => (value: BankTransactionCategoryComboBoxOption | null) => {
    changeCategoryForSplitAtIndex(index, value)
  }, [changeCategoryForSplitAtIndex])

  return (
    <VStack pbs='lg' gap='sm'>
      {showCategorization
        && (
          <VStack gap='sm'>
            <Text weight={TextWeight.bold} size={TextSize.sm}>
              Split transaction
            </Text>
            <VStack gap='sm'>
              {localSplits.map((split, index) => (
                <HStack
                  key={`split-${index}`}
                  gap='xs'
                  align='center'
                  justify='space-between'
                >
                  <CategorySelectDrawerWithTrigger
                    value={split.category}
                    onChange={handleCategoryChange(index)}
                    showTooltips={showTooltips}
                  />
                  <AmountInput
                    name={`split-${index}`}
                    disabled={index === 0 || !showCategorization}
                    onChange={updateSplitAmount(index)}
                    value={getInputValueForSplitAtIndex(index, split)}
                    onBlur={onBlurSplitAmount}
                    isInvalid={split.amount < 0}
                    className='Layer__BankTransactionsMobileSplitForm__AmountInput'
                  />
                  <Button
                    onClick={() => removeSplit(index)}
                    variant='outlined'
                    icon
                    isDisabled={index == 0}
                  >
                    <Trash size={16} />
                  </Button>

                </HStack>
              ))}
            </VStack>
            <HStack justify='end'>
              <Button
                onClick={addSplit}
                variant='outlined'
              >
                <Scissors size={14} />
                {addSplitButtonText}
              </Button>
            </HStack>
            {splitFormError && <HStack pbe='sm'><ErrorText>{splitFormError}</ErrorText></HStack>}
          </VStack>
        )}
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
        {showCategorization && (
          <Button
            fullWidth
            onClick={save}
            isDisabled={isLoading || bankTransaction.processing || !isValid}
          >
            {bankTransaction.processing || isLoading ? 'Confirming...' : 'Confirm'}
          </Button>
        )}
      </HStack>
      {(bankTransaction.error && showRetry)
        && (
          <ErrorText>
            Approval failed. Check connection and retry in few seconds.
          </ErrorText>
        )}
    </VStack>
  )
}
