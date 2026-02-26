import { useCallback, useEffect, useRef, useState } from 'react'
import classNames from 'classnames'

import { type BankTransaction } from '@internal-types/bank_transactions'
import { hasReceipts } from '@utils/bankTransactions'
import { useCategorizeBankTransactionWithCacheUpdate } from '@hooks/useBankTransactions/useCategorizeBankTransactionWithCacheUpdate'
import { useSplitsForm } from '@hooks/useBankTransactions/useSplitsForm'
import { buildCategorizeBankTransactionPayloadForSplit } from '@hooks/useBankTransactions/utils'
import { RECEIPT_ALLOWED_INPUT_FILE_TYPES } from '@hooks/useReceipts/useReceipts'
import { useGetBankTransactionCategory } from '@providers/BankTransactionsCategoryStore/BankTransactionsCategoryStoreProvider'
import PaperclipIcon from '@icons/Paperclip'
import Scissors from '@icons/Scissors'
import Trash from '@icons/Trash'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { type BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { BankTransactionReceipts } from '@components/BankTransactionReceipts/BankTransactionReceipts'
import { type BankTransactionReceiptsHandle } from '@components/BankTransactionReceipts/BankTransactionReceipts'
import { isCategorized } from '@components/BankTransactions/utils'
import { CategorySelectDrawerWithTrigger } from '@components/CategorySelect/CategorySelectDrawerWithTrigger'
import { AmountInput } from '@components/Input/AmountInput'
import { FileInput } from '@components/Input/FileInput'
import { ErrorText } from '@components/Typography/ErrorText'
import { Text, TextSize, TextWeight } from '@components/Typography/Text'
import { BankTransactionFormFields } from '@features/bankTransactions/[bankTransactionId]/components/BankTransactionFormFields'

import './bankTransactionsMobileListSplitForm.scss'

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
    isMutating: isCategorizing,
    isError: isErrorCategorizing,
  } = useCategorizeBankTransactionWithCacheUpdate()

  const { selectedCategory } = useGetBankTransactionCategory(bankTransaction.id)
  const [showRetry, setShowRetry] = useState(false)

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
    if (isErrorCategorizing) {
      setShowRetry(true)
    }
  }, [isErrorCategorizing])

  const save = () => {
    if (!isValid) return

    const categorizationRequest = buildCategorizeBankTransactionPayloadForSplit(localSplits)

    void categorizeBankTransaction(
      bankTransaction.id,
      categorizationRequest,
    )
  }

  const handleCategoryChange = useCallback((index: number) => (value: BankTransactionCategoryComboBoxOption | null) => {
    changeCategoryForSplitAtIndex(index, value)
  }, [changeCategoryForSplitAtIndex])

  return (
    <VStack gap='sm'>
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
            onUpload={file => receiptsRef.current?.uploadReceipt(file)}
            text='Upload receipt'
            iconOnly={true}
            icon={<PaperclipIcon />}
            accept={RECEIPT_ALLOWED_INPUT_FILE_TYPES}
          />
        )}
        {showCategorization && (
          <Button
            fullWidth
            onClick={save}
            isDisabled={isCategorizing || !isValid}
          >
            {isCategorizing
              ? (isCategorized(bankTransaction) ? 'Updating...' : 'Confirming...')
              : (isCategorized(bankTransaction) ? 'Update' : 'Confirm')}
          </Button>
        )}
      </HStack>
      {(isErrorCategorizing && showRetry)
        && (
          <ErrorText>
            Approval failed. Check connection and retry in few seconds.
          </ErrorText>
        )}
    </VStack>
  )
}
