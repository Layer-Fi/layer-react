import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useBankTransactionsContext } from '../../contexts/BankTransactionsContext'
import { DrawerContext } from '../../contexts/DrawerContext'
import PaperclipIcon from '../../icons/Paperclip'
import { BankTransaction, CategorizationType } from '../../types'
import { hasReceipts } from '../../utils/bankTransactions'
import { ActionableList } from '../ActionableList'
import { BankTransactionReceipts } from '../BankTransactionReceipts'
import { BankTransactionReceiptsHandle } from '../BankTransactionReceipts/BankTransactionReceipts'
import { Button, ButtonVariant } from '../Button'
import { FileInput } from '../Input'
import { ErrorText } from '../Typography'
import { BusinessCategories } from './BusinessCategories'
import { Option, mapCategoryToOption, getAssignedValue } from './utils'
import classNames from 'classnames'
import { BankTransactionTagsAndMemo } from '../../features/bankTransactions/[bankTransactionId]/components/BankTransactionTagsAndMemo'

interface BusinessFormProps {
  bankTransaction: BankTransaction
  showCategorization?: boolean
  showDescriptions: boolean
  showReceiptUploads: boolean
  showTooltips: boolean
}

export const BusinessForm = ({
  bankTransaction,
  showCategorization,
  showDescriptions,
  showReceiptUploads,
  showTooltips,
}: BusinessFormProps) => {
  const receiptsRef = useRef<BankTransactionReceiptsHandle>(null)

  const { setContent, close } = useContext(DrawerContext)
  const { categorize: categorizeBankTransaction, isLoading } =
    useBankTransactionsContext()
  const [selectedCategory, setSelectedCategory] = useState<Option | undefined>(
    getAssignedValue(bankTransaction),
  )
  const [showRetry, setShowRetry] = useState(false)

  useEffect(() => {
    if (bankTransaction.error) {
      setShowRetry(true)
    }
  }, [bankTransaction.error])

  const options = useMemo(() => {
    const options =
      bankTransaction?.categorization_flow?.type
      === CategorizationType.ASK_FROM_SUGGESTIONS
        ? bankTransaction.categorization_flow.suggestions.map(x =>
          mapCategoryToOption(x),
        )
        : []

    if (selectedCategory && !options.find(x => x.id === selectedCategory?.id)) {
      options.unshift(selectedCategory)
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

  const onDrawerCategorySelect = (value: Option) => {
    close()
    setSelectedCategory(value)
  }

  const openDrawer = () => {
    setContent(
      <BusinessCategories
        selectedId={selectedCategory?.id}
        select={onDrawerCategorySelect}
        showTooltips={showTooltips}
      />,
    )
  }

  const onCategorySelect = (category: Option) => {
    if (category.value.type === 'SELECT_CATEGORY') {
      openDrawer()
    }
    else {
      if (
        selectedCategory
        && category.value.payload?.id === selectedCategory.value.payload?.id
      ) {
        setSelectedCategory(undefined)
      }
      else {
        setSelectedCategory(category)
      }
    }
  }

  const save = () => {
    if (!selectedCategory || !selectedCategory.value.payload) {
      return
    }

    const payload = selectedCategory?.value?.payload?.id
      ? {
        type: 'AccountId' as const,
        id: selectedCategory.value.payload.id,
      }
      : {
        type: 'StableName' as const,
        stable_name: selectedCategory.value.payload?.stable_name || '',
      }

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
    <div className='Layer__bank-transaction-mobile-list-item__business-form'>
      {showCategorization
        ? (
          <ActionableList<Option['value']>
            options={options}
            onClick={onCategorySelect}
            selectedId={selectedCategory?.id}
            showDescriptions={showTooltips}
          />
        )
        : null}
      <BankTransactionTagsAndMemo
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
              onClick={openDrawer}
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
  )
}
