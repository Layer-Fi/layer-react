import { useCallback, useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { buildCategorizeBankTransactionPayloadForSplit, hasReceipts, isCategorized } from '@utils/bankTransactions/shared'
import { useCategorizeBankTransactionWithCacheUpdate } from '@hooks/features/bankTransactions/useCategorizeBankTransactionWithCacheUpdate'
import { useSplitsForm } from '@hooks/features/bankTransactions/useSplitsForm'
import { useTaxCodeOptions } from '@hooks/features/bankTransactions/useTaxCodeOptions'
import { RECEIPT_ALLOWED_INPUT_FILE_TYPES } from '@hooks/legacy/useReceipts'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import type { BankTransactionNonSuggestedMatchOption } from '@providers/BankTransactionsCategorizationStore/utils'
import PaperclipIcon from '@icons/Paperclip'
import Scissors from '@icons/Scissors'
import Trash from '@icons/Trash'
import { Button } from '@ui/Button/Button'
import { HStack, Spacer, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { BankTransactionFormFields } from '@components/BankTransactionFormFields/BankTransactionFormFields'
import { BankTransactionReceipts } from '@components/BankTransactionReceipts/BankTransactionReceipts'
import { type BankTransactionReceiptsHandle } from '@components/BankTransactionReceipts/BankTransactionReceipts'
import { CategorySelectDrawerWithTrigger } from '@components/CategorySelect/CategorySelectDrawerWithTrigger'
import { AmountInput } from '@components/Input/AmountInput'
import { FileInput } from '@components/Input/FileInput'
import { Input } from '@components/Input/Input'
import { TaxCodeMobileDrawer } from '@components/TaxCodeSelect/TaxCodeMobileDrawer'
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
  } = useSplitsForm({ bankTransaction })

  const { taxCodeOptions, hasTaxCodeOptions, getSelectedTaxCodeOption } = useTaxCodeOptions(bankTransaction)

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

  const handleCategoryChange = useCallback((index: number) => (value: BankTransactionNonSuggestedMatchOption | null) => {
    changeCategoryForSplitAtIndex(index, value)
  }, [changeCategoryForSplitAtIndex])

  return (
    <VStack gap='sm'>
      {showCategorization && (
        <VStack gap='sm'>
          <VStack gap='3xs'>
            <Span size='sm' weight='bold'>
              {t('bankTransactions:action.split_transaction', 'Split transaction')}
            </Span>
            <VStack gap='sm'>
              {localSplits.map((split, index) => (
                <HStack
                  key={`split-${index}`}
                  gap='xs'
                  align='center'
                  justify='space-between'
                  className='Layer__BankTransactionsMobileSplitForm__SplitRow'
                >
                  <AmountInput
                    name={`split-${index}`}
                    disabled={index === 0 || !showCategorization}
                    onChange={updateSplitAmount(index)}
                    value={getInputValueForSplitAtIndex(index, split)}
                    onBlur={onBlurSplitAmount}
                    isInvalid={split.amount < 0}
                    className='Layer__BankTransactionsMobileSplitForm__AmountInput'
                  />
                  <CategorySelectDrawerWithTrigger
                    selectedValue={split.category}
                    onSelectedValueChange={handleCategoryChange(index)}
                    showTooltips={showTooltips}
                    slotProps={{ TriggerSpan: { size: 'sm' } }}
                  />
                  {hasTaxCodeOptions && (
                    <VStack className='Layer__BankTransactionsMobileSplitForm__TaxCode'>
                      <TaxCodeMobileDrawer
                        options={taxCodeOptions}
                        selectedValue={getSelectedTaxCodeOption(split.taxCode)}
                        onSelectedValueChange={(value) => {
                          updateSplitAtIndex(index, currentSplit => ({
                            ...currentSplit,
                            taxCode: value?.value ?? null,
                          }))
                        }}
                        isDisabled={!showCategorization}
                      />
                    </VStack>
                  )}
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
          </VStack>
          <HStack align='end'>
            {localSplits.length > 1 && (
              <VStack pbs='xs' gap='3xs'>
                <Span size='sm' weight='bold'>
                  {t('common:label.total', 'Total')}
                </Span>
                <Input
                  disabled={true}
                  inputMode='numeric'
                  value={formatCurrencyFromCents(localSplits.reduce((total, { amount }) => total + amount, 0))}
                  className='Layer__BankTransactionsMobileSplitForm__TotalAmountInput'
                />
              </VStack>
            )}
            <Spacer />
            <Button onClick={addSplit} variant='outlined'>
              <HStack align='center' gap='2xs' pis='2xs' pie='2xs'>
                {t('bankTransactions:action.split_label', 'Split')}
                <Scissors size={14} />
              </HStack>
            </Button>
          </HStack>
          {splitFormError && <ErrorText>{splitFormError}</ErrorText>}
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
