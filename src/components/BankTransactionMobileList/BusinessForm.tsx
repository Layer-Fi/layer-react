import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useBankTransactionsContext } from '../../contexts/BankTransactionsContext'
import { DrawerContext } from '../../contexts/DrawerContext'
import { BankTransaction, CategorizationType } from '../../types'
import { ActionableList } from '../ActionableList'
import { Button, ButtonVariant } from '../Button'
import { ErrorText } from '../Typography'
import { BusinessCategories } from './BusinessCategories'
import { Option, mapCategoryToOption, getAssignedValue } from './utils'
import { useProfitAndLossLTM } from '../../hooks/useProfitAndLoss/useProfitAndLossLTM'

interface BusinessFormProps {
  bankTransaction: BankTransaction
  hardRefreshPnlOnCategorize?: boolean
}

export const BusinessForm = ({
  bankTransaction,
  hardRefreshPnlOnCategorize = false
}: BusinessFormProps) => {
  const { setContent, close } = useContext(DrawerContext)
  const { categorize: categorizeBankTransaction, isLoading } =
    useBankTransactionsContext()
  const { refetch } = useProfitAndLossLTM()
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
        label: 'All categories',
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
    setContent(<BusinessCategories select={onDrawerCategorySelect} />)
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
          type: 'AccountId' as 'AccountId',
          id: selectedCategory.value.payload.id,
        }
      : {
          type: 'StableName' as 'StableName',
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
    if (hardRefreshPnlOnCategorize) refetch()
  }

  return (
    <div className='Layer__bank-transaction-mobile-list-item__business-form'>
      <ActionableList<Option['value']>
        options={options}
        onClick={onCategorySelect}
        selected={selectedCategory}
      />
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
          {isLoading || bankTransaction.processing ? 'Saving...' : 'Save'}
        </Button>
      ) : null}
      {bankTransaction.error && showRetry ? (
        <ErrorText>
          Approval failed. Check connection and retry in few seconds.
        </ErrorText>
      ) : null}
    </div>
  )
}
