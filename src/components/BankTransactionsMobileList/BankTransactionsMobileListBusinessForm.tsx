import { ErrorText } from '@components/Typography/ErrorText'
import { FileInput } from '@components/Input/FileInput'
import { Button } from '@ui/Button/Button'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import PaperclipIcon from '@icons/Paperclip'
import { BankTransaction } from '@internal-types/bank_transactions'
import { hasReceipts } from '@utils/bankTransactions'
import { BusinessFormMobile } from '@components/BusinessForm/BusinessFormMobile'
import { BankTransactionReceipts } from '@components/BankTransactionReceipts/BankTransactionReceipts'
import { BankTransactionReceiptsHandle } from '@components/BankTransactionReceipts/BankTransactionReceipts'
import classNames from 'classnames'
import { BankTransactionFormFields } from '@features/bankTransactions/[bankTransactionId]/components/BankTransactionFormFields'
import { CategorySelectDrawer } from '@components/CategorySelect/CategorySelectDrawer'
import { CategorizationType } from '@internal-types/categories'
import { ApiCategorizationAsOption } from '@internal-types/categorizationOption'
import { useBankTransactionsCategoryActions, useGetBankTransactionCategory } from '@providers/BankTransactionsCategoryStore/BankTransactionsCategoryStoreProvider'
import { HStack, VStack } from '@components/ui/Stack/Stack'
import { BusinessFormMobileItemOption } from '@components/BusinessForm/BusinessFormMobileItem'
import { isSelectCategoryOption, getOptionId } from '@components/BusinessForm/utils'

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
  const receiptsRef = useRef<BankTransactionReceiptsHandle>(null)

  const { categorize: categorizeBankTransaction, isLoading } =
    useBankTransactionsContext()

  const { selectedCategory } = useGetBankTransactionCategory(bankTransaction.id)
  const { setTransactionCategory } = useBankTransactionsCategoryActions()

  const [showRetry, setShowRetry] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    if (bankTransaction.error) {
      setShowRetry(true)
    }
  }, [bankTransaction.error])

  const options = useMemo((): DisplayOption[] => {
    const options: DisplayOption[] =
      bankTransaction?.categorization_flow?.type === CategorizationType.ASK_FROM_SUGGESTIONS
        ? bankTransaction.categorization_flow.suggestions.map((x) => {
          const opt = new ApiCategorizationAsOption(x)
          return {
            value: opt,
          }
        })
        : []

    if (selectedCategory && !options.find(x => getOptionId(x.value) === selectedCategory.value)) {
      options.unshift({
        value: selectedCategory,
      })
    }

    if (options.length) {
      options.push({
        value: {
          type: 'SELECT_CATEGORY',
        },
        asLink: true,
      })
    }

    return options
  }, [bankTransaction, selectedCategory])

  const onCategorySelect = (category: DisplayOption) => {
    if (isSelectCategoryOption(category.value)) {
      setIsDrawerOpen(true)
    }
    else {
      const option = category.value
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

    const payload = selectedCategory.classificationEncoded
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
              label='Receipts'
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
              text='Upload receipt'
              iconOnly={true}
              icon={<PaperclipIcon />}
            />
          )}
          {options.length === 0
            && (
              <Button
                onClick={() => { setIsDrawerOpen(true) }}
                isDisabled={!selectedCategory || isLoading || bankTransaction.processing}
                fullWidth
                variant='outlined'
              >
                Select category
              </Button>
            )}
          {showCategorization && options.length > 0
            && (
              <Button
                onClick={save}
                fullWidth
              >
                {bankTransaction.processing || isLoading
                  ? 'Confirming...'
                  : 'Confirm'}
              </Button>
            )}
        </HStack>
        {bankTransaction.error && showRetry
          ? (
            <ErrorText>
              Approval failed. Check connection and retry in few seconds.
            </ErrorText>
          )
          : null}
      </VStack>
      <CategorySelectDrawer
        onSelect={category => setTransactionCategory(bankTransaction.id, category)}
        selectedId={selectedCategory?.value}
        showTooltips={showTooltips}
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
    </>

  )
}
