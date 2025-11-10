import { ErrorText } from '@components/Typography/ErrorText'
import { FileInput } from '@components/Input/FileInput'
import { Button, ButtonVariant } from '@components/Button/Button'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import PaperclipIcon from '@icons/Paperclip'
import { BankTransaction } from '@internal-types/bank_transactions'
import { hasReceipts } from '@utils/bankTransactions'
import { ActionableList } from '@components/ActionableList/ActionableList'
import { BankTransactionReceipts } from '@components/BankTransactionReceipts/BankTransactionReceipts'
import { BankTransactionReceiptsHandle } from '@components/BankTransactionReceipts/BankTransactionReceipts'
import classNames from 'classnames'
import { BankTransactionFormFields } from '@features/bankTransactions/[bankTransactionId]/components/BankTransactionFormFields'
import { CategorySelectDrawer } from '@components/CategorySelect/CategorySelectDrawer'
import { CategorizationType } from '@internal-types/categories'
import { ApiCategorizationAsOption } from '@internal-types/categorizationOption'
import { type BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { useBankTransactionsCategoryActions, useGetBankTransactionCategory } from '@providers/BankTransactionsCategoryStore/BankTransactionsCategoryStoreProvider'

type DisplayOption = {
  label: string
  id: string
  description?: string
  value: BankTransactionCategoryComboBoxOption | { type: 'SELECT_CATEGORY' }
  secondary?: boolean
  asLink?: boolean
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
            label: opt.label,
            id: opt.value,
            description: x.description ?? undefined,
            value: opt,
          }
        })
        : []

    if (selectedCategory && !options.find(x => x.id === selectedCategory.value)) {
      options.unshift({
        label: selectedCategory.label,
        id: selectedCategory.value,
        value: selectedCategory,
      })
    }

    if (options.length) {
      options.push({
        label: 'See all categories',
        id: 'SELECT_CATEGORY',
        value: {
          type: 'SELECT_CATEGORY',
        },
        secondary: true,
        asLink: true,
      })
    }

    return options
  }, [bankTransaction, selectedCategory])

  const onCategorySelect = (category: DisplayOption) => {
    if ('type' in category.value && category.value.type === 'SELECT_CATEGORY') {
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
      <div className='Layer__bank-transaction-mobile-list-item__business-form'>
        {showCategorization
          ? (
            <ActionableList<BankTransactionCategoryComboBoxOption | { type: 'SELECT_CATEGORY' }>
              options={options}
              onClick={onCategorySelect}
              selectedId={selectedCategory?.value}
              showDescriptions={showTooltips}
            />
          )
          : null}
        <BankTransactionFormFields
          bankTransaction={bankTransaction}
          showDescriptions={showDescriptions}
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
        <div className='Layer__bank-transaction-mobile-list-item__actions'>
          {showReceiptUploads && (
            <FileInput
              onUpload={files => receiptsRef.current?.uploadReceipt(files[0])}
              text='Upload receipt'
              iconOnly={true}
              icon={<PaperclipIcon />}
            />
          )}
          {options.length === 0
            ? (
              <Button
                onClick={() => { setIsDrawerOpen(true) }}
                fullWidth={true}
                variant={ButtonVariant.secondary}
              >
                Select category
              </Button>
            )
            : null}
          {showCategorization && options.length > 0
            ? (
              <Button
                onClick={save}
                disabled={
                  !selectedCategory || isLoading || bankTransaction.processing
                }
                fullWidth={true}
              >
                {isLoading || bankTransaction.processing
                  ? 'Confirming...'
                  : 'Confirm'}
              </Button>
            )
            : null}
        </div>
        {bankTransaction.error && showRetry
          ? (
            <ErrorText>
              Approval failed. Check connection and retry in few seconds.
            </ErrorText>
          )
          : null}
      </div>
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
