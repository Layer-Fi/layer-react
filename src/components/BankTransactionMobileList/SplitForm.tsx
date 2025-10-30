import { useEffect, useRef, useState } from 'react'
import { useBankTransactionsContext } from '../../contexts/BankTransactionsContext'
import PaperclipIcon from '../../icons/Paperclip'
import Trash from '../../icons/Trash'
import {
  dollarsToCents as parseMoney,
} from '../../models/Money'
import { BankTransaction } from '../../types/bank_transactions'
import {
  SingleCategoryUpdate,
  SplitCategoryUpdate,
  hasSuggestions,
} from '../../types/categories'
import { hasReceipts } from '../../utils/bankTransactions'
import { BankTransactionReceipts } from '../BankTransactionReceipts'
import { BankTransactionReceiptsHandle } from '../BankTransactionReceipts/BankTransactionReceipts'
import { makeTagKeyValueFromTag, makeTagFromTransactionTag } from '../../features/tags/tagSchemas'
import { decodeCustomerVendor } from '../../features/customerVendor/customerVendorSchemas'
import { Button, ButtonVariant, TextButton } from '../Button'
import { FileInput, Input } from '../Input'
import { ErrorText, Text, TextSize, TextWeight } from '../Typography'
import classNames from 'classnames'
import { BankTransactionFormFields } from '../../features/bankTransactions/[bankTransactionId]/components/BankTransactionFormFields'
import { CategorySelectDrawerWithTrigger } from '../CategorySelect/CategorySelectDrawerWithTrigger'
import { isSplitCategorizationEncoded } from '../../schemas/categorization'
import { ApiCategorizationAsOption } from '../../types/categorizationOption'
import { type BankTransactionCategoryComboBoxOption } from '../../components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { type Split } from '../../types/bank_transactions'
import { convertFromCents } from '../../utils/format'

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

  const initialCustomerVendor = bankTransaction.customer
    ? decodeCustomerVendor({ ...bankTransaction.customer, customerVendorType: 'CUSTOMER' })
    : bankTransaction.vendor
      ? decodeCustomerVendor({ ...bankTransaction.vendor, customerVendorType: 'VENDOR' })
      : null

  const [rowState, updateRowState] = useState<RowState>({
    splits: bankTransaction.category && isSplitCategorizationEncoded(bankTransaction.category)
      ? bankTransaction.category?.entries.map((c) => {
        // Use split-specific tags/customer/vendor only (no fallback to transaction-level values when splits exist)
        const splitTags = c.tags?.map(tag => makeTagFromTransactionTag({
          id: tag.id,
          key: tag.key,
          value: tag.value,
          dimensionDisplayName: tag.dimension_display_name,
          valueDisplayName: tag.value_display_name,
          createdAt: new Date(tag.created_at),
          updatedAt: new Date(tag.updated_at),
          deletedAt: tag.deleted_at ? new Date(tag.deleted_at) : null,
          archivedAt: tag.archived_at ? new Date(tag.archived_at) : null,
          _local: tag._local,
        })) ?? []
        const splitCustomerVendor = c.customer
          ? decodeCustomerVendor({ ...c.customer, customerVendorType: 'CUSTOMER' })
          : c.vendor
            ? decodeCustomerVendor({ ...c.vendor, customerVendorType: 'VENDOR' })
            : null

        return {
          amount: c.amount || 0,
          category: new ApiCategorizationAsOption(c.category),
          tags: splitTags,
          customerVendor: splitCustomerVendor,
        }
      })
      : [
        {
          amount: bankTransaction.amount,
          category: defaultCategory
            ? new ApiCategorizationAsOption(defaultCategory)
            : null,
          tags: [],
          customerVendor: initialCustomerVendor,
        },
        {
          amount: 0,
          category: defaultCategory
            ? new ApiCategorizationAsOption(defaultCategory)
            : null,
          tags: [],
          customerVendor: initialCustomerVendor,
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

    updateRowState({
      ...rowState,
      splits: newSplits,
    })
    setFormError(undefined)
  }

  const updateAmounts =
    (rowNumber: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const newAmount = parseMoney(event.target.value) || 0
      const splitTotal = rowState.splits.reduce((sum, split, index) => {
        const amount =
          index === 0 ? 0 : index === rowNumber ? newAmount : split.amount
        return sum + amount
      }, 0)
      const remaining = bankTransaction.amount - splitTotal
      rowState.splits[rowNumber].amount = newAmount
      rowState.splits[0].amount = remaining
      updateRowState({ ...rowState })
      setFormError(undefined)
    }

  const onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (event.target.value === '') {
      updateRowState({ ...rowState })
      setFormError(undefined)
    }
  }

  const changeCategory = (index: number, newValue: BankTransactionCategoryComboBoxOption | null) => {
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
          category: defaultCategory
            ? new ApiCategorizationAsOption(defaultCategory)
            : null,
          tags: [],
          customerVendor: initialCustomerVendor,
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
          category: rowState?.splits[0].category?.classificationEncoded,
        } as SingleCategoryUpdate)
        : ({
          type: 'Split',
          entries: rowState.splits.map(split => ({
            category: split.category?.classificationEncoded,
            amount: split.amount,
            tags: split.tags.map(tag => makeTagKeyValueFromTag(tag)),
            customer_id: split.customerVendor?.customerVendorType === 'CUSTOMER' ? split.customerVendor.id : null,
            vendor_id: split.customerVendor?.customerVendorType === 'VENDOR' ? split.customerVendor.id : null,
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
                    <CategorySelectDrawerWithTrigger
                      value={split.category}
                      onChange={value => changeCategory(index, value)}
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
                    value={convertFromCents(split.amount)}
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
