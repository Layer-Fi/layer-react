import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useBankTransactionsContext } from '../../contexts/BankTransactionsContext'
import { DrawerContext } from '../../contexts/DrawerContext'
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

interface BusinessFormProps {
  bankTransaction: BankTransaction
  showTooltips: boolean
  showReceiptUploads?: boolean
}

export const BusinessForm = ({
  bankTransaction,
  showTooltips,
  showReceiptUploads,
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
      bankTransaction?.categorization_flow?.type ===
      CategorizationType.ASK_FROM_SUGGESTIONS
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
    } else {
      if (
        selectedCategory &&
        category.value.payload?.id === selectedCategory.value.payload?.id
      ) {
        setSelectedCategory(undefined)
      } else {
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

    categorizeBankTransaction(
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
      <ActionableList<Option['value']>
        options={options}
        onClick={onCategorySelect}
        selectedId={selectedCategory?.id}
        showDescriptions={showTooltips}
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
          />
        )}
      </div>
      <div className='Layer__bank-transaction-mobile-list-item__actions'>
        {showReceiptUploads && (
          <FileInput
            onUpload={receiptsRef.current?.uploadReceipt}
            text='Upload receipt'
            iconOnly={true}
          />
        )}
        {options.length === 0 ? (
          <Button
            onClick={openDrawer}
            fullWidth={true}
            variant={ButtonVariant.secondary}
          >
            Select category
          </Button>
        ) : null}
        {options.length > 0 ? (
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
        ) : null}
      </div>
      {bankTransaction.error && showRetry ? (
        <ErrorText>
          Approval failed. Check connection and retry in few seconds.
        </ErrorText>
      ) : null}
    </div>
  )
}
