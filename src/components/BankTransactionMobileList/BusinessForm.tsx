import React, { useContext, useEffect, useMemo, useState } from 'react'
import { DrawerContext } from '../../contexts/DrawerContext'
import { useBankTransactions } from '../../hooks/useBankTransactions'
import { BankTransaction, CategorizationType } from '../../types'
import { ActionableList } from '../ActionableList'
import { Button, RetryButton } from '../Button'
import { ErrorText } from '../Typography'
import { BusinessCategories } from './BusinessCategories'
import { Option, mapCategoryToOption, getAssignedValue } from './utils'

interface BusinessFormProps {
  bankTransaction: BankTransaction
}

export const BusinessForm = ({ bankTransaction }: BusinessFormProps) => {
  const { setContent, close } = useContext(DrawerContext)
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

  const options = useMemo(() => {
    const options =
      bankTransaction?.categorization_flow?.type ===
      CategorizationType.ASK_FROM_SUGGESTIONS
        ? bankTransaction.categorization_flow.suggestions.map(x =>
            mapCategoryToOption(x),
          )
        : []

    options.push({
      label: options.length > 0 ? 'All categories' : 'Select category',
      id: 'SELECT_CATEGORY',
      value: {
        type: 'SELECT_CATEGORY',
      },
      secondary: true,
      asLink: true,
    })

    if (selectedCategory && !options.find(x => x.id === selectedCategory?.id)) {
      options.unshift(selectedCategory)
    }

    return options
  }, [bankTransaction, selectedCategory])

  const onDrawerCategorySelect = (value: Option) => {
    close()
    setSelectedCategory(value)
  }

  const onCategorySelect = (category: Option) => {
    if (category.value.type === 'SELECT_CATEGORY') {
      setContent(<BusinessCategories select={onDrawerCategorySelect} />)
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
          Save
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
