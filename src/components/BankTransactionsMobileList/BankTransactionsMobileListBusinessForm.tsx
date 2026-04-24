import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { CategorizationType } from '@internal-types/categories'
import { ApiCategorizationAsOption, PlaceholderAsOption } from '@internal-types/categorizationOption'
import { getBankTransactionTaxCodeOptions, getCategoryPayloadTaxCode, hasReceipts, isCategorized } from '@utils/bankTransactions'
import { useCategorizeBankTransactionWithCacheUpdate } from '@hooks/features/bankTransactions/useCategorizeBankTransactionWithCacheUpdate'
import { RECEIPT_ALLOWED_INPUT_FILE_TYPES } from '@hooks/legacy/useReceipts'
import { useBankTransactionsCategorizationActions, useGetBankTransactionCategorization } from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import PaperclipIcon from '@icons/Paperclip'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { type BankTransactionCategoryComboBoxOption, isPlaceholderAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { convertApiCategorizationToCategoryOrSplitAsOption } from '@components/BankTransactionCategoryComboBox/utils'
import { BankTransactionFormFields } from '@components/BankTransactionFormFields/BankTransactionFormFields'
import { BankTransactionReceipts, type BankTransactionReceiptsHandle } from '@components/BankTransactionReceipts/BankTransactionReceipts'
import { BusinessFormMobile } from '@components/BusinessForm/BusinessFormMobile'
import { type BusinessFormMobileItemOption, type BusinessFormOptionValue } from '@components/BusinessForm/BusinessFormMobileItem'
import { CategorySelectDrawer } from '@components/CategorySelect/CategorySelectDrawer'
import { FileInput } from '@components/Input/FileInput'
import { TaxCodeSelectDrawer, type TaxCodeSelectOption } from '@components/TaxCodeSelect/TaxCodeSelectDrawer'
import { ErrorText } from '@components/Typography/ErrorText'

const SELECT_CATEGORY_VALUE = 'SELECT_CATEGORY'
const SELECT_TAX_CODE_VALUE = '__select_tax_code__'
const NO_TAX_CODE_VALUE = '__no_tax_code__'

export const isSelectCategoryOption = (
  value: BankTransactionCategoryComboBoxOption,
): boolean => {
  return isPlaceholderAsOption(value) && value.value === SELECT_CATEGORY_VALUE
}

type DisplayOption = BusinessFormMobileItemOption<BankTransactionCategoryComboBoxOption>
type TaxCodeDisplayOptionValue = TaxCodeSelectOption | BusinessFormOptionValue
type TaxCodeDisplayOption = BusinessFormMobileItemOption<TaxCodeDisplayOptionValue>

interface BankTransactionsMobileListBusinessFormProps {
  bankTransaction: BankTransaction
  showCategorization?: boolean
  showDescriptions: boolean
  showReceiptUploads: boolean
  showTooltips: boolean
}

export const BankTransactionsMobileListBusinessForm = ({
  bankTransaction,
  showCategorization,
  showDescriptions,
  showReceiptUploads,
  showTooltips,
}: BankTransactionsMobileListBusinessFormProps) => {
  const { t } = useTranslation()
  const receiptsRef = useRef<BankTransactionReceiptsHandle>(null)

  const {
    categorize: categorizeBankTransaction,
    isMutating: isCategorizing,
    isError: isErrorCategorizing,
  } = useCategorizeBankTransactionWithCacheUpdate()

  const { selectedCategorization } = useGetBankTransactionCategorization(bankTransaction.id)
  const { setTransactionCategorization } = useBankTransactionsCategorizationActions()
  const selectedCategory = selectedCategorization?.category
  const selectedTaxCode = selectedCategorization?.taxCode ?? null
  const hasSelectedTaxCode = selectedCategorization !== undefined
  const sessionTaxCodes = useMemo(() => {
    return hasSelectedTaxCode && selectedTaxCode ? [selectedTaxCode] : []
  }, [hasSelectedTaxCode, selectedTaxCode])

  const [showRetry, setShowRetry] = useState(false)
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false)
  const [isTaxCodeDrawerOpen, setIsTaxCodeDrawerOpen] = useState(false)

  useEffect(() => {
    if (isErrorCategorizing) {
      setShowRetry(true)
    }
  }, [isErrorCategorizing])

  const taxCodeOptions = useMemo<TaxCodeSelectOption[]>(
    () => getBankTransactionTaxCodeOptions(bankTransaction),
    [bankTransaction],
  )

  const getTaxCodeOption = useCallback((taxCode: string | null): TaxCodeSelectOption | null => {
    if (!taxCode) {
      return null
    }

    return sessionTaxCodes.find(option => option.value === taxCode)
      ?? taxCodeOptions.find(option => option.value === taxCode)
      ?? null
  }, [sessionTaxCodes, taxCodeOptions])

  const initialTaxCode = useMemo(
    () => getTaxCodeOption(bankTransaction.tax_code ?? null),
    [bankTransaction.tax_code, getTaxCodeOption],
  )

  const currentTaxCode = useMemo(() => {
    if (hasSelectedTaxCode) {
      return selectedTaxCode ?? null
    }

    return initialTaxCode
  }, [hasSelectedTaxCode, initialTaxCode, selectedTaxCode])

  const initialCategory = useMemo(() => {
    if (!bankTransaction.category) {
      return null
    }

    return convertApiCategorizationToCategoryOrSplitAsOption(bankTransaction.category)
  }, [bankTransaction.category])

  const categorySuggestionOptions = useMemo(() => {
    if (bankTransaction?.categorization_flow?.type !== CategorizationType.ASK_FROM_SUGGESTIONS) {
      return []
    }

    return bankTransaction.categorization_flow.suggestions.map(suggestion => new ApiCategorizationAsOption(suggestion))
  }, [bankTransaction.categorization_flow])

  const categoryOptions = useMemo((): DisplayOption[] => {
    const options: DisplayOption[] = []
    const seenValues = new Set<string>()

    const appendOption = (category: BankTransactionCategoryComboBoxOption | null) => {
      if (!category || seenValues.has(category.value)) {
        return
      }

      seenValues.add(category.value)
      options.push({ value: category })
    }

    appendOption(selectedCategory ?? null)
    appendOption(initialCategory)
    categorySuggestionOptions.forEach(appendOption)

    options.push({
      value: new PlaceholderAsOption({
        label: t('bankTransactions:action.show_all_categories', 'Show all categories'),
        value: SELECT_CATEGORY_VALUE,
      }),
      asLink: true,
    })

    return options
  }, [categorySuggestionOptions, initialCategory, selectedCategory, t])

  const taxCodeSectionOptions = useMemo((): TaxCodeDisplayOption[] => {
    const options: TaxCodeDisplayOption[] = []
    const seenValues = new Set<string>()

    const appendOption = (option: TaxCodeDisplayOptionValue, asLink = false) => {
      if (seenValues.has(option.value)) {
        return
      }

      seenValues.add(option.value)
      options.push({ value: option, asLink })
    }

    if (currentTaxCode) {
      appendOption(currentTaxCode)
    }

    if (initialTaxCode) {
      appendOption(initialTaxCode)
    }

    sessionTaxCodes.forEach(option => appendOption(option))

    appendOption({
      label: t('bankTransactions:action.no_tax_code', 'No tax code'),
      value: NO_TAX_CODE_VALUE,
    })

    appendOption({
      label: `+ ${t('common:action.add_label', 'Add')} ${t('common:label.more', 'More')}`,
      value: SELECT_TAX_CODE_VALUE,
    }, true)

    return options
  }, [currentTaxCode, initialTaxCode, sessionTaxCodes, t])

  const syncTaxCodeWithCategory = useCallback((category: BankTransactionCategoryComboBoxOption | null) => {
    if (category?.classification?.type === 'Exclusion') {
      setTransactionCategorization(bankTransaction.id, { taxCode: null })
    }
  }, [bankTransaction.id, setTransactionCategorization])

  const onCategorySelect = useCallback((category: DisplayOption) => {
    if (isSelectCategoryOption(category.value)) {
      setIsCategoryDrawerOpen(true)
      return
    }

    const option = category.value

    if (!isPlaceholderAsOption(option)) {
      syncTaxCodeWithCategory(option)
    }

    if (
      selectedCategory
      && option.value === selectedCategory.value
    ) {
      setTransactionCategorization(bankTransaction.id, { category: null })
      return
    }

    setTransactionCategorization(bankTransaction.id, { category: option })
  }, [bankTransaction.id, selectedCategory, setTransactionCategorization, syncTaxCodeWithCategory])

  const onCategoryDrawerSelect = useCallback((category: BankTransactionCategoryComboBoxOption | null) => {
    if (!category) return

    syncTaxCodeWithCategory(category)
    setTransactionCategorization(bankTransaction.id, { category })
  }, [bankTransaction.id, setTransactionCategorization, syncTaxCodeWithCategory])

  const onTaxCodeSelect = useCallback((taxCode: TaxCodeDisplayOption) => {
    if (taxCode.value.value === SELECT_TAX_CODE_VALUE) {
      setIsTaxCodeDrawerOpen(true)
      return
    }

    if (taxCode.value.value === NO_TAX_CODE_VALUE) {
      setTransactionCategorization(bankTransaction.id, { taxCode: null })
      return
    }

    setTransactionCategorization(bankTransaction.id, {
      taxCode: {
        label: taxCode.value.label,
        value: taxCode.value.value,
      },
    })
  }, [bankTransaction.id, setTransactionCategorization])

  const onTaxCodeDrawerSelect = useCallback((taxCode: TaxCodeSelectOption | null) => {
    setTransactionCategorization(bankTransaction.id, { taxCode })
  }, [bankTransaction.id, setTransactionCategorization])

  const save = () => {
    if (!selectedCategory) {
      return
    }

    const payload = selectedCategory.classification
    if (payload === null) return

    void categorizeBankTransaction(
      bankTransaction.id,
      {
        type: 'Category',
        category: payload,
        taxCode: getCategoryPayloadTaxCode(payload, currentTaxCode?.value),
      },
      true,
    )
  }

  return (
    <>
      <VStack gap='sm'>
        {showCategorization
          && (
            <>
              <BusinessFormMobile<BankTransactionCategoryComboBoxOption>
                options={categoryOptions}
                onSelect={onCategorySelect}
                selectedId={selectedCategory?.value}
                ariaLabel={t('bankTransactions:action.select_a_category', 'Select a category')}
              />
              {taxCodeOptions.length > 0 && (
                <BusinessFormMobile<TaxCodeDisplayOptionValue>
                  options={taxCodeSectionOptions}
                  onSelect={onTaxCodeSelect}
                  selectedId={currentTaxCode?.value ?? NO_TAX_CODE_VALUE}
                  ariaLabel={t('bankTransactions:action.select_tax_code', 'Select tax code')}
                />
              )}
            </>
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
              label={t('bankTransactions:label.receipts', 'Receipts')}
              ref={receiptsRef}
              floatingActions={false}
              hideUploadButtons={true}
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
          {showCategorization && categoryOptions.length > 1
            && (
              <Button
                onClick={save}
                fullWidth
                isDisabled={!selectedCategory || isCategorizing}
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
        {isErrorCategorizing && showRetry
          ? (
            <ErrorText>
              {t('bankTransactions:error.approval_failed_check_connection', 'Approval failed. Check connection and retry in a few seconds.')}
            </ErrorText>
          )
          : null}
      </VStack>
      <CategorySelectDrawer
        onSelect={onCategoryDrawerSelect}
        selectedId={selectedCategory?.value}
        showTooltips={showTooltips}
        isOpen={isCategoryDrawerOpen}
        onOpenChange={setIsCategoryDrawerOpen}
      />
      <TaxCodeSelectDrawer
        options={taxCodeOptions}
        onSelect={onTaxCodeDrawerSelect}
        selectedId={currentTaxCode?.value}
        isOpen={isTaxCodeDrawerOpen}
        onOpenChange={setIsTaxCodeDrawerOpen}
        isClearable
      />
    </>
  )
}
