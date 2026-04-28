import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { buildCategorizeBankTransactionPayloadForSplit, hasReceipts, isCategorized } from '@utils/bankTransactions/shared'
import { getBankTransactionTaxCodeOptions, isExclusionCategory } from '@utils/bankTransactions/taxCode'
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
    () => getBankTransactionTaxCodeOptions(bankTransaction),
    [bankTransaction],
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
          <SplitsCategorizationForm
            localSplits={localSplits}
            splitFormError={splitFormError}
            showCategorization={showCategorization}
            showTooltips={showTooltips}
            showTaxCodeSelector={showTaxCodeSelector}
            taxCodeOptions={taxCodeOptions}
            formatCurrencyFromCents={formatCurrencyFromCents}
            addSplit={addSplit}
            removeSplit={removeSplit}
            updateSplitAmount={updateSplitAmount}
            handleCategoryChange={handleCategoryChange}
            handleTaxCodeChange={handleTaxCodeChange}
            getSelectedTaxCodeOption={getSelectedTaxCodeOption}
            getInputValueForSplitAtIndex={getInputValueForSplitAtIndex}
            onBlurSplitAmount={onBlurSplitAmount}
          />
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

interface BankTransactionsMobileListSplitFormProps {
  bankTransaction: BankTransaction
  showTooltips: boolean
  showCategorization?: boolean
  showReceiptUploads?: boolean
  showDescriptions?: boolean
}

type SplitsForm = ReturnType<typeof useSplitsForm>
type LocalSplit = SplitsForm['localSplits'][number]

interface SplitsCategorizationFormProps {
  localSplits: LocalSplit[]
  splitFormError: string | undefined
  showCategorization: boolean
  showTooltips: boolean
  showTaxCodeSelector: boolean
  taxCodeOptions: TaxCodeSelectOption[]
  formatCurrencyFromCents: (amount: number) => string
  addSplit: SplitsForm['addSplit']
  removeSplit: SplitsForm['removeSplit']
  updateSplitAmount: SplitsForm['updateSplitAmount']
  handleCategoryChange: (index: number) => (value: BankTransactionCategoryComboBoxOption | null) => void
  handleTaxCodeChange: (index: number) => (option: TaxCodeSelectOption | null) => void
  getSelectedTaxCodeOption: (taxCode: string | null) => TaxCodeSelectOption | null
  getInputValueForSplitAtIndex: SplitsForm['getInputValueForSplitAtIndex']
  onBlurSplitAmount: SplitsForm['onBlurSplitAmount']
}

const SplitsCategorizationForm = ({
  localSplits,
  splitFormError,
  showCategorization,
  showTooltips,
  showTaxCodeSelector,
  taxCodeOptions,
  formatCurrencyFromCents,
  addSplit,
  removeSplit,
  updateSplitAmount,
  handleCategoryChange,
  handleTaxCodeChange,
  getSelectedTaxCodeOption,
  getInputValueForSplitAtIndex,
  onBlurSplitAmount,
}: SplitsCategorizationFormProps) => {
  return (
    <VStack gap='sm'>
      {localSplits.map((split, index) => (
        <SplitFormRow
          key={`split-${index}`}
          split={split}
          splitIndex={index}
          splitCount={localSplits.length}
          showCategorization={showCategorization}
          showTooltips={showTooltips}
          showTaxCodeSelector={showTaxCodeSelector}
          taxCodeOptions={taxCodeOptions}
          removeSplit={removeSplit}
          updateSplitAmount={updateSplitAmount}
          handleCategoryChange={handleCategoryChange}
          handleTaxCodeChange={handleTaxCodeChange}
          getSelectedTaxCodeOption={getSelectedTaxCodeOption}
          getInputValueForSplitAtIndex={getInputValueForSplitAtIndex}
          onBlurSplitAmount={onBlurSplitAmount}
        />
      ))}

      {localSplits.length > 1
        ? (
          <SplitTotalRow
            localSplits={localSplits}
            formatCurrencyFromCents={formatCurrencyFromCents}
            addSplit={addSplit}
          />
        )
        : (
          <HStack justify='end'>
            <SplitButton onClick={addSplit} />
          </HStack>
        )}

      {splitFormError && (
        <ErrorText>
          {splitFormError}
        </ErrorText>
      )}
    </VStack>
  )
}

interface SplitFormRowProps {
  split: LocalSplit
  splitIndex: number
  splitCount: number
  showCategorization: boolean
  showTooltips: boolean
  showTaxCodeSelector: boolean
  taxCodeOptions: TaxCodeSelectOption[]
  removeSplit: SplitsForm['removeSplit']
  updateSplitAmount: SplitsForm['updateSplitAmount']
  handleCategoryChange: (index: number) => (value: BankTransactionCategoryComboBoxOption | null) => void
  handleTaxCodeChange: (index: number) => (option: TaxCodeSelectOption | null) => void
  getSelectedTaxCodeOption: (taxCode: string | null) => TaxCodeSelectOption | null
  getInputValueForSplitAtIndex: SplitsForm['getInputValueForSplitAtIndex']
  onBlurSplitAmount: SplitsForm['onBlurSplitAmount']
}

const SplitFormRow = ({
  split,
  splitIndex,
  splitCount,
  showCategorization,
  showTooltips,
  showTaxCodeSelector,
  taxCodeOptions,
  removeSplit,
  updateSplitAmount,
  handleCategoryChange,
  handleTaxCodeChange,
  getSelectedTaxCodeOption,
  getInputValueForSplitAtIndex,
  onBlurSplitAmount,
}: SplitFormRowProps) => {
  const { t } = useTranslation()

  return (
    <VStack
      gap='3xs'
      pbs='sm'
    >
      {splitIndex === 0 && splitCount > 1 && (
        <Span size='sm'>
          {t('bankTransactions:label.split_label', 'Splits')}
        </Span>
      )}
      <VStack gap='xs'>
        <div className='Layer__BankTransactionsMobileSplitForm__SplitGridContainer'>
          <AmountInput
            name={`split-${splitIndex}`}
            disabled={splitIndex === 0 || !showCategorization}
            onChange={updateSplitAmount(splitIndex)}
            value={getInputValueForSplitAtIndex(splitIndex, split)}
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
              onChange={handleCategoryChange(splitIndex)}
              showTooltips={showTooltips}
            />
            {splitIndex > 0 && (
              <Button
                onClick={() => removeSplit(splitIndex)}
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
            <SplitTaxCodeSelect
              split={split}
              splitIndex={splitIndex}
              showCategorization={showCategorization}
              taxCodeOptions={taxCodeOptions}
              handleTaxCodeChange={handleTaxCodeChange}
              getSelectedTaxCodeOption={getSelectedTaxCodeOption}
            />
          )}
        </div>
      </VStack>
    </VStack>
  )
}

interface SplitTaxCodeSelectProps {
  split: LocalSplit
  splitIndex: number
  showCategorization: boolean
  taxCodeOptions: TaxCodeSelectOption[]
  handleTaxCodeChange: (index: number) => (option: TaxCodeSelectOption | null) => void
  getSelectedTaxCodeOption: (taxCode: string | null) => TaxCodeSelectOption | null
}

const SplitTaxCodeSelect = ({
  split,
  splitIndex,
  showCategorization,
  taxCodeOptions,
  handleTaxCodeChange,
  getSelectedTaxCodeOption,
}: SplitTaxCodeSelectProps) => {
  return (
    <>
      <HStack pis='3xs' aria-hidden='true' />
      <TaxCodeSelectDrawerWithTrigger
        options={taxCodeOptions}
        value={getSelectedTaxCodeOption(split.taxCode ?? null)}
        onChange={handleTaxCodeChange(splitIndex)}
        isDisabled={
          !showCategorization
          || isExclusionCategory(split.category)
        }
      />
    </>
  )
}

interface SplitTotalRowProps {
  localSplits: LocalSplit[]
  formatCurrencyFromCents: (amount: number) => string
  addSplit: SplitsForm['addSplit']
}

const SplitTotalRow = ({
  localSplits,
  formatCurrencyFromCents,
  addSplit,
}: SplitTotalRowProps) => {
  const { t } = useTranslation()

  return (
    <VStack pbs='xs' gap='3xs'>
      <Span size='sm'>
        {t('common:label.total', 'Total')}
      </Span>
      <HStack justify='space-between'>
        <Input
          disabled={true}
          inputMode='numeric'
          value={formatCurrencyFromCents(localSplits.reduce((total, { amount }) => total + amount, 0))}
          className='Layer__BankTransactionsMobileSplitForm__TotalAmountInput'
        />
        <SplitButton onClick={addSplit} />
      </HStack>
    </VStack>
  )
}

interface SplitButtonProps {
  onClick: () => void
}

const SplitButton = ({ onClick }: SplitButtonProps) => {
  const { t } = useTranslation()

  return (
    <Button
      onClick={onClick}
      variant='outlined'
    >
      <HStack align='center' gap='2xs' pis='2xs' pie='2xs'>
        {t('bankTransactions:action.split_label', 'Split')}
        <Scissors size={14} />
      </HStack>
    </Button>
  )
}
