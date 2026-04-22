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
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useGetBankTransactionCategorization } from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import PaperclipIcon from '@icons/Paperclip'
import Scissors from '@icons/Scissors'
import Trash from '@icons/Trash'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { type BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { BankTransactionFormFields } from '@components/BankTransactionFormFields/BankTransactionFormFields'
import { BankTransactionReceipts } from '@components/BankTransactionReceipts/BankTransactionReceipts'
import { type BankTransactionReceiptsHandle } from '@components/BankTransactionReceipts/BankTransactionReceipts'
import { CategorySelectDrawerWithTrigger } from '@components/CategorySelect/CategorySelectDrawerWithTrigger'
import { AmountInput } from '@components/Input/AmountInput'
import { FileInput } from '@components/Input/FileInput'
import { Input } from '@components/Input/Input'
import type { TaxCodeSelectOption } from '@components/TaxCodeSelect/TaxCodeSelectDrawer'
import { TaxCodeSelectDrawerWithTrigger } from '@components/TaxCodeSelect/TaxCodeSelectDrawerWithTrigger'
import { ErrorText } from '@components/Typography/ErrorText'

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
  const { t } = useTranslation()
  const { formatCurrencyFromCents } = useIntlFormatter()
  const receiptsRef = useRef<BankTransactionReceiptsHandle>(null)

  const {
    categorize: categorizeBankTransaction,
    isMutating: isCategorizing,
    isError: isErrorCategorizing,
  } = useCategorizeBankTransactionWithCacheUpdate()

  const { selectedCategorization } = useGetBankTransactionCategorization(bankTransaction.id)
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
    selectedCategorization,
  })

  const taxCodeOptions = useMemo<TaxCodeSelectOption[]>(
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
    (taxCode: string | null): TaxCodeSelectOption | null => {
      if (!taxCode) {
        return null
      }

      return taxCodeOptions.find(option => option.value === taxCode) ?? null
    },
    [taxCodeOptions],
  )

  const handleTaxCodeChange = useCallback(
    (index: number) => (option: TaxCodeSelectOption | null) => {
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
            {localSplits.map((split, index) => (
              <VStack
                key={`split-${index}`}
                gap='xs'
              >

                <Span>
                  {`${t('bankTransactions:action.split_label', 'Split')} #${index + 1}`}
                </Span>

                <div className='Layer__BankTransactionsMobileSplitForm__SplitGridContainer'>

                  <AmountInput
                    name={`split-${index}`}
                    disabled={index === 0 || !showCategorization}
                    onChange={updateSplitAmount(index)}
                    value={getInputValueForSplitAtIndex(index, split)}
                    onBlur={onBlurSplitAmount}
                    isInvalid={split.amount < 0}
                    className='Layer__BankTransactionsMobileSplitForm__AmountInput'
                  />

                  <HStack
                    align='center'
                    gap='xs'
                    fluid
                  >
                    <CategorySelectDrawerWithTrigger
                      value={split.category}
                      onChange={handleCategoryChange(index)}
                      showTooltips={showTooltips}
                    />
                    {index > 0 && (
                      <Button
                        onClick={() => removeSplit(index)}
                        variant='outlined'
                        icon
                        inset
                        aria-label={t('common:action.remove', 'Remove')}
                      >
                        <Trash size={14} />
                      </Button>
                    )}
                  </HStack>

                  {showTaxCodeSelector && (
                    <>
                      <HStack pis='3xs'>
                        <Span>
                          {t('bankTransactions:label.tax_code_colon', 'Tax Code:')}
                        </Span>
                      </HStack>
                      <TaxCodeSelectDrawerWithTrigger
                        options={taxCodeOptions}
                        value={getSelectedTaxCodeOption(split.taxCode)}
                        onChange={handleTaxCodeChange(index)}
                        isDisabled={
                          !showCategorization
                          || split.category === null
                          || split.category.classification?.type === 'Exclusion'
                        }
                        isClearable
                      />
                    </>
                  )}
                </div>
              </VStack>
            ))}

            <HStack justify='end'>
              <Button
                onClick={addSplit}
                variant='outlined'
              >
                <HStack align='center' gap='2xs' pis='2xs' pie='2xs'>
                  {t('bankTransactions:action.split_label', 'Split')}
                  <Scissors size={14} />
                </HStack>
              </Button>
            </HStack>
            {localSplits.length > 1 && (
              <Input
                disabled={true}
                leftText={t('common:label.total', 'Total')}
                inputMode='numeric'
                value={formatCurrencyFromCents(localSplits.reduce((total, { amount }) => total + amount, 0))}
                className='Layer__BankTransactionsMobileSplitForm__TotalAmountInput'
              />
            )}
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
