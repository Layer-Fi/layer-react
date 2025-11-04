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
import { makeTagKeyValueFromTag } from '../../features/tags/tagSchemas'
import { decodeCustomerVendor } from '../../features/customerVendor/customerVendorSchemas'
import { Button, ButtonVariant, TextButton } from '../Button'
import { FileInput, Input } from '../Input'
import { ErrorText, Text, TextSize, TextWeight } from '../Typography'
import classNames from 'classnames'
import { BankTransactionFormFields } from '../../features/bankTransactions/[bankTransactionId]/components/BankTransactionFormFields'
import { CategorySelectDrawerWithTrigger } from '../CategorySelect/CategorySelectDrawerWithTrigger'
import { ApiCategorizationAsOption, SplitAsOption } from '../../types/categorizationOption'
import { type BankTransactionCategoryComboBoxOption } from '../../components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { type Split } from '../../types/bank_transactions'
import { convertFromCents } from '../../utils/format'
import { getSplitsErrorMessage, isSplitsValid } from '../ExpandedBankTransactionRow/utils'
import { HStack } from '../ui/Stack/Stack'
import { useBankTransactionsCategoryActions, useGetBankTransactionCategory } from '../../providers/BankTransactionsCategoryStore/BankTransactionsCategoryStoreProvider'
import { getLocalSplitStateForExpandedTableRow } from '../ExpandedBankTransactionRow/utils'

interface SplitFormProps {
  bankTransaction: BankTransaction
  showTooltips: boolean
  showCategorization?: boolean
  showReceiptUploads?: boolean
  showDescriptions?: boolean
}

export const SplitForm = ({
  bankTransaction,
  showTooltips,
  showCategorization,
  showReceiptUploads,
  showDescriptions,
}: SplitFormProps) => {
  const receiptsRef = useRef<BankTransactionReceiptsHandle>(null)

  const {
    categorize: categorizeBankTransaction,
    isLoading,
  } = useBankTransactionsContext()

  const { selectedCategory } = useGetBankTransactionCategory(bankTransaction.id)
  const { setTransactionCategory } = useBankTransactionsCategoryActions()

  const [localSplits, setLocalSplits] = useState<Split[]>(
    getLocalSplitStateForExpandedTableRow(selectedCategory, bankTransaction),
  )
  const [formError, setFormError] = useState<string | undefined>()
  const [showRetry, setShowRetry] = useState(false)

  useEffect(() => {
    setLocalSplits(getLocalSplitStateForExpandedTableRow(selectedCategory, bankTransaction))
    setFormError(undefined)
  }, [selectedCategory, bankTransaction])

  useEffect(() => {
    if (bankTransaction.error) {
      setShowRetry(true)
    }
  }, [bankTransaction.error])

  const removeSplit = (index: number) => {
    const newSplits = localSplits.filter((_v, idx) => idx !== index)
    const splitTotal = newSplits.reduce((sum, split, index) => {
      const amount = index === 0 ? 0 : split.amount
      return sum + amount
    }, 0)
    const remaining = bankTransaction.amount - splitTotal
    newSplits[0].amount = remaining

    setLocalSplits(newSplits)
    setFormError(undefined)

    // Auto-save when category / split is valid
    if (isSplitsValid(newSplits)) {
      setTransactionCategory(bankTransaction.id, new SplitAsOption(newSplits))
    }
  }

  const updateAmounts =
    (rowNumber: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const newAmount = parseMoney(event.target.value) || 0
      const splitTotal = localSplits.reduce((sum, split, index) => {
        const amount =
          index === 0 ? 0 : index === rowNumber ? newAmount : split.amount
        return sum + amount
      }, 0)
      const remaining = bankTransaction.amount - splitTotal
      const newSplits = [...localSplits]
      newSplits[rowNumber].amount = newAmount
      newSplits[0].amount = remaining
      setLocalSplits(newSplits)
      setFormError(undefined)

      // Auto-save when category / split is valid
      if (isSplitsValid(newSplits)) {
        setTransactionCategory(bankTransaction.id, new SplitAsOption(newSplits))
      }
    }

  const onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (event.target.value === '') {
      setFormError(undefined)
    }
  }

  const changeCategory = (index: number, newValue: BankTransactionCategoryComboBoxOption | null) => {
    if (newValue === null) return

    const newSplits = [...localSplits]
    newSplits[index].category = newValue
    setLocalSplits(newSplits)
    setFormError(undefined)

    // Auto-save when category / split is valid
    if (isSplitsValid(newSplits)) {
      setTransactionCategory(bankTransaction.id, new SplitAsOption(newSplits))
    }
  }

  const addSplit = () => {
    const defaultCategory =
      bankTransaction.category
      || (hasSuggestions(bankTransaction.categorization_flow)
        && bankTransaction.categorization_flow?.suggestions?.[0])

    const initialCustomerVendor = bankTransaction.customer
      ? decodeCustomerVendor({ ...bankTransaction.customer, customerVendorType: 'CUSTOMER' })
      : bankTransaction.vendor
        ? decodeCustomerVendor({ ...bankTransaction.vendor, customerVendorType: 'VENDOR' })
        : null

    setLocalSplits([
      ...localSplits,
      {
        amount: 0,
        category: defaultCategory
          ? new ApiCategorizationAsOption(defaultCategory)
          : null,
        tags: [],
        customerVendor: initialCustomerVendor,
      },
    ])
    setFormError(undefined)
  }

  const save = async () => {
    if (!isSplitsValid(localSplits)) {
      setFormError(getSplitsErrorMessage(localSplits))
      return
    }

    await categorizeBankTransaction(
      bankTransaction.id,
      localSplits.length === 1 && localSplits[0].category
        ? ({
          type: 'Category',
          category: localSplits[0].category?.classificationEncoded,
        } as SingleCategoryUpdate)
        : ({
          type: 'Split',
          entries: localSplits.map(split => ({
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
              {localSplits.map((split, index) => (
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
      {formError && <HStack pb='sm'><ErrorText>{formError}</ErrorText></HStack>}
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
