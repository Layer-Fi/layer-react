import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { CategorizationType } from '@internal-types/categories'
import { ApiCategorizationAsOption, PlaceholderAsOption } from '@internal-types/categorizationOption'
import { applyCategoryChange } from '@utils/bankTransactions/categorization'
import { canCategoryHaveTaxCode } from '@utils/bankTransactions/categorization'
import {
  hasReceipts,
  isCategorized,
} from '@utils/bankTransactions/shared'
import { useCategorizationSubmit } from '@hooks/features/bankTransactions/useCategorizationSubmit'
import { useTaxCodeOptions } from '@hooks/features/bankTransactions/useTaxCodeOptions'
import { RECEIPT_ALLOWED_INPUT_FILE_TYPES } from '@hooks/legacy/useReceipts'
import {
  useBankTransactionsCategorizationActions,
  useGetBankTransactionCategorizationByTransactionId,
} from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import PaperclipIcon from '@icons/Paperclip'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { type BankTransactionCategoryComboBoxOption, isPlaceholderAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { convertApiCategorizationToCategoryOrSplitAsOption } from '@components/BankTransactionCategoryComboBox/utils'
import { BankTransactionFormFields } from '@components/BankTransactionFormFields/BankTransactionFormFields'
import { BankTransactionReceipts } from '@components/BankTransactionReceipts/BankTransactionReceipts'
import { type BankTransactionReceiptsHandle } from '@components/BankTransactionReceipts/BankTransactionReceipts'
import { BankTransactionErrorText } from '@components/BankTransactions/BankTransactionErrorText'
import { BusinessFormMobile } from '@components/BusinessForm/BusinessFormMobile'
import { type BusinessFormMobileItemOption } from '@components/BusinessForm/BusinessFormMobileItem'
import { CategorySelectDrawer } from '@components/CategorySelect/CategorySelectDrawer'
import { FileInput } from '@components/Input/FileInput'
import type { TaxCodeComboBoxOption } from '@components/TaxCodeSelect/taxCodeComboBoxOption'
import { TaxCodeSelect } from '@components/TaxCodeSelect/TaxCodeSelect'

const SELECT_CATEGORY_VALUE = 'SELECT_CATEGORY'

export const isSelectCategoryOption = (
  value: BankTransactionCategoryComboBoxOption,
): boolean => {
  return isPlaceholderAsOption(value) && value.value === SELECT_CATEGORY_VALUE
}

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
    submit,
    errorMessage: submitErrorMessage,
    isProcessing: isCategorizing,
    isError: isErrorCategorizing,
  } = useCategorizationSubmit({ bankTransaction, notify: true })

  const [sessionCategories, setSessionCategories] = useState<Map<string, BankTransactionCategoryComboBoxOption>>(() => {
    const initialMap = new Map<string, BankTransactionCategoryComboBoxOption>()

    if (bankTransaction.category) {
      const existingCategory = convertApiCategorizationToCategoryOrSplitAsOption(bankTransaction.category)
      initialMap.set(existingCategory.value, existingCategory)
    }

    if (bankTransaction?.categorization_flow?.type === CategorizationType.ASK_FROM_SUGGESTIONS) {
      bankTransaction.categorization_flow.suggestions.forEach((suggestion) => {
        const opt = new ApiCategorizationAsOption(suggestion)
        initialMap.set(opt.value, opt)
      })
    }

    return initialMap
  })

  const { selectedCategorization } = useGetBankTransactionCategorizationByTransactionId(bankTransaction.id)
  const { setTransactionCategorization } = useBankTransactionsCategorizationActions()
  const selectedCategory = selectedCategorization?.category

  const [showRetry, setShowRetry] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const { taxCodeOptions, hasTaxCodeOptions } = useTaxCodeOptions(bankTransaction)

  useEffect(() => {
    if (isErrorCategorizing) {
      setShowRetry(true)
    }
  }, [isErrorCategorizing])

  const options = useMemo((): BusinessFormMobileItemOption[] => {
    const options: BusinessFormMobileItemOption[] = Array.from(sessionCategories.values()).map(category => ({
      value: category,
    }))

    options.push({
      value: new PlaceholderAsOption({
        label: t('bankTransactions:action.show_all_categories', 'Show all categories'),
        value: 'SELECT_CATEGORY',
      }),
      asLink: true,
    })

    return options
  }, [t, sessionCategories])

  const onCategorySelect = (category: BusinessFormMobileItemOption) => {
    if (isSelectCategoryOption(category.value)) {
      setIsDrawerOpen(true)
    }
    else {
      const option = category.value

      if (!isPlaceholderAsOption(option)) {
        setSessionCategories(prev => new Map(prev).set(option.value, option))
      }

      const nextCategory = (selectedCategory && option.value === selectedCategory.value)
        ? null
        : option
      setTransactionCategorization(
        bankTransaction.id,
        applyCategoryChange(selectedCategorization, nextCategory),
      )
    }
  }

  const save = () => {
    void submit()
  }

  const onDrawerSelect = useCallback((category: BankTransactionCategoryComboBoxOption | null) => {
    if (!category) return

    setSessionCategories(prev => new Map(prev).set(category.value, category))
    setTransactionCategorization(
      bankTransaction.id,
      applyCategoryChange(selectedCategorization, category),
    )
  }, [bankTransaction.id, selectedCategorization, setTransactionCategorization])

  const handleTaxCodeChange = useCallback((taxCode: TaxCodeComboBoxOption | null) => {
    setTransactionCategorization(bankTransaction.id, { taxCode })
  }, [bankTransaction.id, setTransactionCategorization])

  return (
    <>
      <VStack gap='sm'>
        {showCategorization
          && (
            <BusinessFormMobile
              options={options}
              onSelect={onCategorySelect}
              selectedId={selectedCategory?.value}
            />
          )}
        {showCategorization && hasTaxCodeOptions && canCategoryHaveTaxCode(selectedCategory) && (
          <TaxCodeSelect
            isMobileView
            options={taxCodeOptions}
            value={selectedCategorization?.taxCode ?? null}
            onChange={handleTaxCodeChange}
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
          {showCategorization && sessionCategories.size > 0
            && (
              <Button
                onClick={save}
                fullWidth
                isDisabled={isCategorizing}
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
        <BankTransactionErrorText
          submitErrorMessage={submitErrorMessage}
          showApprovalError={isErrorCategorizing && showRetry}
          layout='inline'
        />
      </VStack>
      <CategorySelectDrawer
        onSelect={onDrawerSelect}
        selectedId={selectedCategory?.value}
        showTooltips={showTooltips}
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
    </>

  )
}
