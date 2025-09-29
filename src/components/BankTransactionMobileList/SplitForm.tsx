import { useEffect, useRef, useState } from 'react'
import { useBankTransactionsContext } from '../../contexts/BankTransactionsContext'
import PaperclipIcon from '../../icons/Paperclip'
import Trash from '../../icons/Trash'
import {
  centsToDollars as formatMoney,
  dollarsToCents as parseMoney,
} from '../../models/Money'
import { BankTransaction } from '../../types'
import {
  SingleCategoryUpdate,
  SplitCategoryUpdate,
  hasSuggestions,
} from '../../types/categories'
import { getCategorizePayload, hasReceipts } from '../../utils/bankTransactions'
import { BankTransactionReceipts } from '../BankTransactionReceipts'
import { BankTransactionReceiptsHandle } from '../BankTransactionReceipts/BankTransactionReceipts'
import { Tag, makeTagKeyValueFromTag } from '../../features/tags/tagSchemas'
import { Button, ButtonVariant, TextButton } from '../Button'
import { CategorySelect } from '../CategorySelect'
import {
  CategoryOption,
  mapCategoryToExclusionOption,
  mapCategoryToOption,
} from '../CategorySelect/CategorySelect'
import { FileInput, Input } from '../Input'
import { ErrorText, Text, TextSize, TextWeight } from '../Typography'
import classNames from 'classnames'
import { BankTransactionFormFields } from '../../features/bankTransactions/[bankTransactionId]/components/BankTransactionFormFields'

type Split = {
  amount: number
  inputValue: string
  category: CategoryOption | undefined
  tags: readonly Tag[]
}

type RowState = {
  splits: Split[]
  description: string
  file: unknown
}

export const SplitForm = ({
  bankTransaction,
  showTooltips,
  showCategorization,
  showReceiptUploads,
  showDescriptions,
}: {
  bankTransaction: BankTransaction
  showTooltips: boolean
  showCategorization?: boolean
  showReceiptUploads?: boolean
  showDescriptions?: boolean
}) => {
  const receiptsRef = useRef<BankTransactionReceiptsHandle>(null)

  const {
    categorize: categorizeBankTransaction,
    isLoading,
  } = useBankTransactionsContext()

  const defaultCategory =
    bankTransaction.category
    || (hasSuggestions(bankTransaction.categorization_flow)
      && bankTransaction.categorization_flow?.suggestions?.[0])

  const [rowState, updateRowState] = useState<RowState>({
    splits: bankTransaction.category?.entries
      ? bankTransaction.category?.entries.map((c) => {
        return c.type === 'ExclusionSplitEntry' && c.category.type === 'ExclusionNested'
          ? {
            amount: c.amount || 0,
            inputValue: formatMoney(c.amount),
            category: mapCategoryToExclusionOption(c.category),
            tags: [],
          }
          : {
            amount: c.amount || 0,
            inputValue: formatMoney(c.amount),
            category: mapCategoryToOption(c.category),
            tags: [],
          }
      })
      : [
        {
          amount: bankTransaction.amount,
          inputValue: formatMoney(bankTransaction.amount),
          category: defaultCategory
            ? mapCategoryToOption(defaultCategory)
            : undefined,
          tags: [],
        },
        {
          amount: 0,
          inputValue: '0.00',
          category: defaultCategory
            ? mapCategoryToOption(defaultCategory)
            : undefined,
          tags: [],
        },
      ],
    description: '',
    file: undefined,
  })
  const [formError, setFormError] = useState<string | undefined>()
  const [showRetry, setShowRetry] = useState(false)

  useEffect(() => {
    if (bankTransaction.error) {
      setShowRetry(true)
    }
  }, [bankTransaction.error])

  const removeSplit = (index: number) => {
    const newSplits = rowState.splits.filter((_v, idx) => idx !== index)
    const splitTotal = newSplits.reduce((sum, split, index) => {
      const amount = index === 0 ? 0 : split.amount
      return sum + amount
    }, 0)
    const remaining = bankTransaction.amount - splitTotal
    newSplits[0].amount = remaining
    newSplits[0].inputValue = formatMoney(remaining)

    updateRowState({
      ...rowState,
      splits: newSplits,
    })
    setFormError(undefined)
  }

  const updateAmounts =
    (rowNumber: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const newAmount = parseMoney(event.target.value) || 0
      const newDisplaying = event.target.value
      const splitTotal = rowState.splits.reduce((sum, split, index) => {
        const amount =
          index === 0 ? 0 : index === rowNumber ? newAmount : split.amount
        return sum + amount
      }, 0)
      const remaining = bankTransaction.amount - splitTotal
      rowState.splits[rowNumber].amount = newAmount
      rowState.splits[rowNumber].inputValue = newDisplaying
      rowState.splits[0].amount = remaining
      rowState.splits[0].inputValue = formatMoney(remaining)
      updateRowState({ ...rowState })
      setFormError(undefined)
    }

  const onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (event.target.value === '') {
      const [_, index] = event.target.name.split('-')
      rowState.splits[parseInt(index)].inputValue = '0.00'
      updateRowState({ ...rowState })
      setFormError(undefined)
    }
  }

  const changeCategory = (index: number, newValue: CategoryOption) => {
    rowState.splits[index].category = newValue
    updateRowState({ ...rowState })
    setFormError(undefined)
  }

  const addSplit = () => {
    updateRowState({
      ...rowState,
      splits: [
        ...rowState.splits,
        {
          amount: 0,
          inputValue: '0.00',
          category: defaultCategory
            ? mapCategoryToOption(defaultCategory)
            : undefined,
          tags: [],
        },
      ],
    })
    setFormError(undefined)
  }

  const validateSplit = (splitData: RowState) => {
    let valid = true

    splitData.splits.forEach((split) => {
      if (split.amount <= 0) {
        valid = false
      }
      else if (!split.category) {
        valid = false
      }
    })

    return valid
  }

  const save = async () => {
    if (!validateSplit(rowState)) {
      if (rowState.splits.length > 1) {
        setFormError(
          'Use only positive amounts and select category for each entry',
        )
      }
      else {
        setFormError('Category is required')
      }
      return
    }

    await categorizeBankTransaction(
      bankTransaction.id,
      rowState.splits.length === 1 && rowState?.splits[0].category
        ? ({
          type: 'Category',
          category: getCategorizePayload(rowState?.splits[0].category),
        } as SingleCategoryUpdate)
        : ({
          type: 'Split',
          entries: rowState.splits.map(split => ({
            category: split.category
              ? getCategorizePayload(split.category)
              : '',
            amount: split.amount,
            tag_key_values: split.tags.map(tag => makeTagKeyValueFromTag(tag)),
          })),
        } as SplitCategoryUpdate),
      true,
    )
  }

  return (
    <div>
      {showCategorization
        ? (
          <>
            <Text weight={TextWeight.bold} size={TextSize.sm}>
              Split transaction
            </Text>
            <div className='Layer__bank-transactions__table-cell__header'>
              <Text size={TextSize.sm}>Category</Text>
              <Text size={TextSize.sm}>Amount</Text>
            </div>
            <div className='Layer__bank-transactions__splits-inputs'>
              {rowState.splits.map((split, index) => (
                <div
                  className='Layer__bank-transactions__table-cell--split-entry'
                  key={`split-${index}`}
                >
                  <div className='Layer__bank-transactions__table-cell--split-entry__right-col'>
                    <CategorySelect
                      bankTransaction={bankTransaction}
                      name={`category-${bankTransaction.id}`}
                      value={split.category}
                      onChange={value => changeCategory(index, value)}
                      className='Layer__category-menu--full'
                      disabled={bankTransaction.processing}
                      excludeMatches
                      asDrawer
                      showTooltips={showTooltips}
                    />
                  </div>
                  <Input
                    type='text'
                    name={`split-${index}`}
                    className={classNames(
                      'Layer__split-amount-input',
                      index === 0 && 'Layer__split-amount-input--first',
                    )}
                    disabled={index === 0}
                    onChange={updateAmounts(index)}
                    value={split.inputValue}
                    onBlur={onBlur}
                    isInvalid={split.amount < 0}
                    errorMessage='Negative values are not allowed'
                    inputMode='numeric'
                  />
                  {index > 0 && (
                    <Button
                      className='Layer__bank-transactions__table-cell--split-entry__merge-btn'
                      onClick={() => removeSplit(index)}
                      rightIcon={<Trash size={16} />}
                      variant={ButtonVariant.secondary}
                      iconOnly={true}
                    />
                  )}
                </div>
              ))}
              <TextButton
                onClick={addSplit}
                disabled={isLoading}
                className='Layer__add-new-split'
              >
                Add new split
              </TextButton>
            </div>
          </>
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
            ref={receiptsRef}
            floatingActions={false}
            hideUploadButtons={true}
            label='Receipts'
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
        {showCategorization && (
          <Button
            fullWidth={true}
            onClick={() => void save()}
            disabled={isLoading || bankTransaction.processing}
          >
            {isLoading || bankTransaction.processing ? 'Saving...' : 'Save'}
          </Button>
        )}
      </div>
      {formError && <ErrorText>{formError}</ErrorText>}
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
