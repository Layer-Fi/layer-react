import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { CategorizationType } from '@internal-types/categories'
import { ApiCategorizationAsOption, PlaceholderAsOption } from '@internal-types/categorizationOption'
import { hasReceipts } from '@utils/bankTransactions'
import { isCategorized } from '@utils/bankTransactions'
import { useCategorizeBankTransactionWithCacheUpdate } from '@hooks/features/bankTransactions/useCategorizeBankTransactionWithCacheUpdate'
import { RECEIPT_ALLOWED_INPUT_FILE_TYPES } from '@hooks/legacy/useReceipts'
import { useBankTransactionsCategoryActions, useGetBankTransactionCategory } from '@providers/BankTransactionsCategoryStore/BankTransactionsCategoryStoreProvider'
import PaperclipIcon from '@icons/Paperclip'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { type BankTransactionCategoryComboBoxOption, isPlaceholderAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { convertApiCategorizationToCategoryOrSplitAsOption } from '@components/BankTransactionCategoryComboBox/utils'
import { BankTransactionFormFields } from '@components/BankTransactionFormFields/BankTransactionFormFields'
import { BankTransactionReceipts } from '@components/BankTransactionReceipts/BankTransactionReceipts'
import { type BankTransactionReceiptsHandle } from '@components/BankTransactionReceipts/BankTransactionReceipts'
import { BusinessFormMobile } from '@components/BusinessForm/BusinessFormMobile'
import { type BusinessFormMobileItemOption, type BusinessFormOptionValue } from '@components/BusinessForm/BusinessFormMobileItem'
import { CategorySelectDrawer } from '@components/CategorySelect/CategorySelectDrawer'
import { FileInput } from '@components/Input/FileInput'
import { ErrorText } from '@components/Typography/ErrorText'

const SELECT_CATEGORY_VALUE = 'SELECT_CATEGORY'

export const isSelectCategoryOption = (
  value: BusinessFormOptionValue,
): boolean => {
  return isPlaceholderAsOption(value) && value.value === SELECT_CATEGORY_VALUE
}

type DisplayOption = BusinessFormMobileItemOption

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

  const { selectedCategory } = useGetBankTransactionCategory(bankTransaction.id)
  const { setTransactionCategory } = useBankTransactionsCategoryActions()

  const [showRetry, setShowRetry] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    if (isErrorCategorizing) {
      setShowRetry(true)
    }
  }, [isErrorCategorizing])

  const options = useMemo((): DisplayOption[] => {
    const options: DisplayOption[] = Array.from(sessionCategories.values()).map(category => ({
      value: category,
    }))

    options.push({
      value: new PlaceholderAsOption({
        label: t('showAllCategories', 'Show all categories'),
        value: 'SELECT_CATEGORY',
      }),
      asLink: true,
    })

    return options
  }, [t, sessionCategories])

  const onCategorySelect = (category: DisplayOption) => {
    if (isSelectCategoryOption(category.value)) {
      setIsDrawerOpen(true)
    }
    else {
      const option = category.value

      if (!isPlaceholderAsOption(option)) {
        setSessionCategories(prev => new Map(prev).set(option.value, option))
      }

      if (
        selectedCategory
        && option.value === selectedCategory.value
      ) {
        setTransactionCategory(bankTransaction.id, null)
      }
      else {
        setTransactionCategory(bankTransaction.id, option)
      }
    }
  }

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
      },
      true,
    )
  }

  const onDrawerSelect = useCallback((category: BankTransactionCategoryComboBoxOption | null) => {
    if (!category) return

    setSessionCategories(prev => new Map(prev).set(category.value, category))
    setTransactionCategory(bankTransaction.id, category)
  }, [bankTransaction.id, setTransactionCategory])

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
              label={t('receipts', 'Receipts')}
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
              text={t('uploadReceipt', 'Upload receipt')}
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
                isDisabled={!selectedCategory || isCategorizing}
              >
                {isCategorizing
                  ? (isCategorized(bankTransaction) ? t('updating', 'Updating...') : t('confirming', 'Confirming...'))
                  : (isCategorized(bankTransaction) ? t('update', 'Update') : t('confirm', 'Confirm'))}
              </Button>
            )}
        </HStack>
        {isErrorCategorizing && showRetry
          ? (
            <ErrorText>
              {t('approvalFailedCheckConnectionAndRetryInFewSeconds', 'Approval failed. Check connection and retry in few seconds.')}
            </ErrorText>
          )
          : null}
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
