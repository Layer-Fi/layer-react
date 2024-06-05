import React, { useEffect, useMemo, useState } from 'react'
import { useBankTransactions } from '../../hooks/useBankTransactions'
import { useLayerContext } from '../../hooks/useLayerContext'
import { BankTransaction, CategorizationType } from '../../types'
import { ActionableList } from '../ActionableList'
import { Button, RetryButton } from '../Button'
import { ErrorText } from '../Typography'
import {
  Option,
  mapCategoryToOption,
  flattenCategories,
  getAssignedValue,
} from './utils'

interface BusinessFormProps {
  bankTransaction: BankTransaction
}

export const BusinessForm = ({ bankTransaction }: BusinessFormProps) => {
  const { categories } = useLayerContext()
  const { categorize: categorizeBankTransaction, isLoading } =
    useBankTransactions()
  const [selectedCategory, setSelectedCategory] = useState<Option | undefined>(
    getAssignedValue(bankTransaction),
  )
  const [showRetry, setShowRetry] = useState(false)

  useEffect(() => {
    if (bankTransaction.error) {
      setShowRetry(true)
    }
  }, [bankTransaction.error])

  // @TODO - use category options in drawer
  const categoryOptions = flattenCategories(categories)

  const options = useMemo(() => {
    const options =
      bankTransaction?.categorization_flow?.type ===
      CategorizationType.ASK_FROM_SUGGESTIONS
        ? bankTransaction.categorization_flow.suggestions.map(x =>
            mapCategoryToOption(x),
          )
        : []

    options.push({
      label: options.length > 0 ? 'Something else' : 'Select category',
      id: 'SELECT_CATEGORY',
      value: {
        type: 'SELECT_CATEGORY',
      },
    })

    if (selectedCategory && !options.find(x => x.id === selectedCategory?.id)) {
      options.unshift(selectedCategory)
    }

    return options
  }, [bankTransaction, selectedCategory])

  const onCategorySelect = (category: Option) => {
    if (category.value.type === 'SELECT_CATEGORY') {
      console.log('open drawer...', categoryOptions)
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

    categorizeBankTransaction(bankTransaction.id, {
      type: 'Category',
      category: {
        type: 'StableName',
        stable_name: selectedCategory.value.payload.stable_name || '',
      },
    })
  }

  return (
    <div className='Layer__bank-transaction-mobile-list-item__business-form'>
      <ActionableList<Option['value']>
        options={options}
        onClick={onCategorySelect}
        selected={selectedCategory}
      />
      {!showRetry && (
        <Button
          onClick={save}
          disabled={!selectedCategory || isLoading}
          fullWidth={true}
        >
          Save
        </Button>
      )}
      {showRetry ? (
        <RetryButton
          onClick={() => {
            if (!bankTransaction.processing) {
              save()
            }
          }}
          fullWidth={true}
          className='Layer__bank-transaction__retry-btn'
          processing={bankTransaction.processing}
          error={'Approval failed. Check connection and retry in few seconds.'}
        >
          Retry
        </RetryButton>
      ) : null}
      {bankTransaction.error && showRetry ? (
        <ErrorText>
          Approval failed. Check connection and retry in few seconds.
        </ErrorText>
      ) : null}
    </div>
  )
}
