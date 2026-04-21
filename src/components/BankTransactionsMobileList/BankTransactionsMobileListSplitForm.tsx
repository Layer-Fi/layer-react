import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { hasReceipts } from '@utils/bankTransactions'
import { buildCategorizeBankTransactionPayloadForSplit } from '@utils/bankTransactions'
import { isCategorized } from '@utils/bankTransactions'
import { useCategorizeBankTransactionWithCacheUpdate } from '@hooks/features/bankTransactions/useCategorizeBankTransactionWithCacheUpdate'
import { useSplitsForm } from '@hooks/features/bankTransactions/useSplitsForm'
import { RECEIPT_ALLOWED_INPUT_FILE_TYPES } from '@hooks/legacy/useReceipts'
import { useGetBankTransactionCategory } from '@providers/BankTransactionsCategoryStore/BankTransactionsCategoryStoreProvider'
import PaperclipIcon from '@icons/Paperclip'
import Scissors from '@icons/Scissors'
import Trash from '@icons/Trash'
import { Button } from '@ui/Button/Button'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { HStack, VStack } from '@ui/Stack/Stack'
import { type BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { BankTransactionFormFields } from '@components/BankTransactionFormFields/BankTransactionFormFields'
import { BankTransactionReceipts } from '@components/BankTransactionReceipts/BankTransactionReceipts'
import { type BankTransactionReceiptsHandle } from '@components/BankTransactionReceipts/BankTransactionReceipts'
import { CategorySelectDrawerWithTrigger } from '@components/CategorySelect/CategorySelectDrawerWithTrigger'
import { AmountInput } from '@components/Input/AmountInput'
import { FileInput } from '@components/Input/FileInput'
import { ErrorText } from '@components/Typography/ErrorText'
import { Text } from '@components/Typography/Text'

import './bankTransactionsMobileListSplitForm.scss'

interface BankTransactionsMobileListSplitFormProps {
  bankTransaction: BankTransaction
  showTooltips: boolean
  showCategorization?: boolean
  showReceiptUploads?: boolean
  showDescriptions?: boolean
}

type TaxCodeOption = {
  label: string
  value: string
}

export const BankTransactionsMobileListSplitForm = ({
  bankTransaction,
  showTooltips,
  showCategorization,
  showReceiptUploads,
  showDescriptions,
}: BankTransactionsMobileListSplitFormProps) => {
  const { t } = useTranslation()
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
    updateSplitAtIndex,
    getInputValueForSplitAtIndex,
    onBlurSplitAmount,
  } = useSplitsForm({
    bankTransaction,
    selectedCategory,
  })

  const taxCodeOptions = useMemo<TaxCodeOption[]>(
    () => bankTransaction.tax_options?.canada.map(taxOption => ({
      label: taxOption.display_name,
      value: taxOption.code,
    })) ?? [],
    [bankTransaction.tax_options?.canada],
  )

  const showTaxCodeSelector = taxCodeOptions.length > 0

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

  const getSelectedTaxCodeOption = useCallback(
    (taxCode: string | null): TaxCodeOption | null => {
      if (!taxCode) {
        return null
      }

      return taxCodeOptions.find(option => option.value === taxCode) ?? null
    },
    [taxCodeOptions],
  )

  const handleTaxCodeChange = useCallback(
    (index: number) => (option: TaxCodeOption | null) => {
      updateSplitAtIndex(index, split => ({
        ...split,
        taxCode: option?.value ?? null,
      }))
    },
    [updateSplitAtIndex],
  )

  return (
    <VStack gap='sm'>
      {showCategorization
        && (
          <VStack gap='sm'>
            <VStack gap='sm'>
              {localSplits.map((split, index) => (
                <VStack
                  key={`split-${index}`}
                  gap='xs'
                  className='Layer__BankTransactionsMobileSplitForm__SplitEntry'
                >
                  <HStack
                    justify='space-between'
                    align='center'
                  >
                    <Text>
                      {t('bankTransactions:action.split_label', 'Split')}
                    </Text>
                    <Text>
                      {`#${index + 1}`}
                    </Text>
                  </HStack>
                  <HStack
                    align='center'
                    gap='xs'
                    pie='xs'
                  >
                    <HStack className='Layer__BankTransactionsMobileSplitForm__AmountInputContainer'>
                      <AmountInput
                        name={`split-${index}`}
                        disabled={index === 0 || !showCategorization}
                        onChange={updateSplitAmount(index)}
                        value={getInputValueForSplitAtIndex(index, split)}
                        onBlur={onBlurSplitAmount}
                        isInvalid={split.amount < 0}
                        className='Layer__BankTransactionsMobileSplitForm__AmountInput'
                      />
                    </HStack>
                    <HStack className='Layer__BankTransactionsMobileSplitForm__ActionButtonContainer'>
                      {index === 0
                        ? (
                          <Button
                            onClick={addSplit}
                            variant='outlined'
                            fullWidth
                          >
                            <HStack align='center' gap='2xs' pis='2xs' pie='2xs'>
                              {t('bankTransactions:action.split_label', 'Split')}
                              <Scissors size={14} />
                            </HStack>
                          </Button>
                        )
                        : (
                          <Button
                            onClick={() => removeSplit(index)}
                            variant='outlined'
                            fullWidth
                          >
                            <HStack align='center' gap='2xs' pis='2xs' pie='2xs'>
                              {t('common:action.remove', 'Remove')}
                              <Trash size={14} />
                            </HStack>
                          </Button>
                        )}
                    </HStack>
                  </HStack>
                  <HStack
                    gap='xs'
                    align='start'
                    className='Layer__BankTransactionsMobileSplitForm__SplitSelectors'
                  >
                    <HStack className='Layer__BankTransactionsMobileSplitForm__CategorySelect'>
                      <CategorySelectDrawerWithTrigger
                        value={split.category}
                        onChange={handleCategoryChange(index)}
                        showTooltips={showTooltips}
                      />
                    </HStack>
                    {showTaxCodeSelector && (
                      <ComboBox<TaxCodeOption>
                        selectedValue={getSelectedTaxCodeOption(split.taxCode)}
                        onSelectedValueChange={handleTaxCodeChange(index)}
                        options={taxCodeOptions}
                        isDisabled={
                          !showCategorization
                          || split.category === null
                          || split.category.classification?.type === 'Exclusion'
                        }
                        isSearchable={false}
                        isClearable
                        placeholder={t('bankTransactions:action.select_tax_code', 'Select tax code')}
                        className='Layer__BankTransactionsMobileSplitForm__TaxCodeSelect'
                      />
                    )}
                  </HStack>
                </VStack>
              ))}
            </VStack>
            {splitFormError && <HStack pbe='sm'><ErrorText>{splitFormError}</ErrorText></HStack>}
          </VStack>
        )}
      <BankTransactionFormFields
        bankTransaction={bankTransaction}
        showDescriptions={showDescriptions}
        hideCustomerVendor
        hideTags
        isMobile
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
            label={t('bankTransactions:label.receipts', 'Receipts')}
          />
        )}
      </div>
      <HStack gap='md'>
        {showReceiptUploads && (
          <FileInput
            onUpload={files => receiptsRef.current?.uploadReceipt(files[0])}
            text={t('bankTransactions:action.upload_receipt', 'Upload receipt')}
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
              ? (isCategorized(bankTransaction)
                ? t('common:state.updating', 'Updating...')
                : t('common:state.confirming', 'Confirming...'))
              : (isCategorized(bankTransaction)
                ? t('common:action.update_label', 'Update')
                : t('common:action.confirm_label', 'Confirm'))}
          </Button>
        )}
      </HStack>
      {(isErrorCategorizing && showRetry)
        && (
          <ErrorText>
            {t('bankTransactions:error.approval_failed_check_connection', 'Approval failed. Check connection and retry in a few seconds.')}
          </ErrorText>
        )}
    </VStack>
  )
}
