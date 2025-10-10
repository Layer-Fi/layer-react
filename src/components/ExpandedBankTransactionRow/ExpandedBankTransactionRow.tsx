import {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
} from 'react'
import { useBankTransactionsContext } from '../../contexts/BankTransactionsContext'
import AlertCircle from '../../icons/AlertCircle'
import Scissors from '../../icons/ScissorsFullOpen'
import Trash from '../../icons/Trash'
import { centsToDollars as formatMoney } from '../../models/Money'
import {
  BankTransaction,
  SplitCategoryUpdate,
  SingleCategoryUpdate,
} from '../../types'
import { hasSuggestions } from '../../types/categories'
import {
  getCategorizePayload,
  hasMatch,
  hasSuggestedTransferMatches,
} from '../../utils/bankTransactions'
import { BankTransactionReceiptsWithProvider } from '../BankTransactionReceipts'
import { Tag, makeTagKeyValueFromTag, makeTag, makeTagFromTransactionTag } from '../../features/tags/tagSchemas'
import { TagDimensionsGroup } from '../Journal/JournalEntryForm/TagDimensionsGroup'
import { CustomerVendorSelector } from '../../features/customerVendor/components/CustomerVendorSelector'
import { decodeCustomerVendor, CustomerVendorSchema } from '../../features/customerVendor/customerVendorSchemas'
import { useTagBankTransaction } from '../../features/bankTransactions/[bankTransactionId]/tags/api/useTagBankTransaction'
import { useRemoveTagFromBankTransaction } from '../../features/bankTransactions/[bankTransactionId]/tags/api/useRemoveTagFromBankTransaction'
import { useSetMetadataOnBankTransaction } from '../../features/bankTransactions/[bankTransactionId]/metadata/api/useSetMetadataOnBankTransaction'

import { SubmitButton, TextButton } from '../Button'
import { SubmitAction } from '../Button/SubmitButton'
import { Button } from '../ui/Button/Button'
import { CategorySelect } from '../CategorySelect'
import {
  CategoryOption,
  mapCategoryToExclusionOption,
  mapCategoryToOption,
} from '../CategorySelect/CategorySelect'
import { Input } from '../Input'
import { MatchForm } from '../MatchForm'
import { Toggle } from '../Toggle'
import { ToggleSize } from '../Toggle/Toggle'
import { Text, ErrorText, TextSize } from '../Typography'
import { APIErrorNotifications } from './APIErrorNotifications'
import classNames from 'classnames'
import { useEffectiveBookkeepingStatus } from '../../hooks/bookkeeping/useBookkeepingStatus'
import { isCategorizationEnabledForStatus } from '../../utils/bookkeeping/isCategorizationEnabled'
import { BankTransactionFormFields } from '../../features/bankTransactions/[bankTransactionId]/components/BankTransactionFormFields'
import { useBankTransactionTagVisibility } from '../../features/bankTransactions/[bankTransactionId]/tags/components/BankTransactionTagVisibilityProvider'
import { useBankTransactionCustomerVendorVisibility } from '../../features/bankTransactions/[bankTransactionId]/customerVendor/components/BankTransactionCustomerVendorVisibilityProvider'

type Props = {
  bankTransaction: BankTransaction
  isOpen?: boolean
  close: () => void
  asListItem?: boolean
  submitBtnText?: string
  containerWidth?: number
  categorized?: boolean

  showDescriptions: boolean
  showReceiptUploads: boolean
  showTooltips: boolean
}

type Split = {
  amount: number
  inputValue: string
  category: CategoryOption | undefined
  tags: readonly Tag[]
  customerVendor: typeof CustomerVendorSchema.Type | null
}

type RowState = {
  splits: Split[]
  description: string
  file: unknown
}

enum Purpose {
  categorize = 'categorize',
  match = 'match',
}

export type SaveHandle = {
  save: () => void
}

const isAlreadyMatched = (bankTransaction?: BankTransaction) => {
  if (bankTransaction?.match) {
    const foundMatch = bankTransaction.suggested_matches?.find(
      x =>
        x.details.id === bankTransaction?.match?.details.id
        || x.details.id === bankTransaction?.match?.bank_transaction.id,
    )
    return foundMatch?.id
  }

  return undefined
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

export interface DocumentWithStatus {
  id?: string
  url?: string
  status: 'pending' | 'uploaded' | 'failed' | 'deleting'
  type?: string
  name?: string
  date?: string
  error?: string
}

const ExpandedBankTransactionRow = forwardRef<SaveHandle, Props>(
  (
    {
      bankTransaction,
      isOpen = false,
      close,
      categorized,
      asListItem = false,
      submitBtnText = 'Save',
      containerWidth,

      showDescriptions,
      showReceiptUploads,
      showTooltips,
    },
    ref,
  ) => {
    const {
      categorize: categorizeBankTransaction,
      match: matchBankTransaction,
    } = useBankTransactionsContext()

    // Hooks for auto-saving tags and customer/vendor in unsplit state
    const { trigger: tagBankTransaction } = useTagBankTransaction({ bankTransactionId: bankTransaction.id })
    const { trigger: removeTagFromBankTransaction } = useRemoveTagFromBankTransaction({ bankTransactionId: bankTransaction.id })
    const { trigger: setMetadataOnBankTransaction } = useSetMetadataOnBankTransaction({ bankTransactionId: bankTransaction.id })

    // Get visibility settings for tags and customer/vendor
    const { showTags } = useBankTransactionTagVisibility()
    const { showCustomerVendor } = useBankTransactionCustomerVendorVisibility()

    const [purpose, setPurpose] = useState<Purpose>(
      bankTransaction.category
        ? Purpose.categorize
        : hasMatch(bankTransaction)
          ? Purpose.match
          : Purpose.categorize,
    )
    const [selectedMatchId, setSelectedMatchId] = useState<string | undefined>(
      isAlreadyMatched(bankTransaction)
      ?? bankTransaction?.suggested_matches?.[0]?.id,
    )
    const [matchFormError, setMatchFormError] = useState<string | undefined>()
    const [splitFormError, setSplitFormError] = useState<string | undefined>()
    const bodyRef = useRef<HTMLSpanElement>(null)

    const defaultCategory =
      bankTransaction.category
        ? bankTransaction.category
        : hasSuggestions(bankTransaction.categorization_flow)
          ? bankTransaction.categorization_flow?.suggestions.at(0)
          : undefined

    const initialCustomerVendor = bankTransaction.customer
      ? decodeCustomerVendor({ ...bankTransaction.customer, customerVendorType: 'CUSTOMER' })
      : bankTransaction.vendor
        ? decodeCustomerVendor({ ...bankTransaction.vendor, customerVendorType: 'VENDOR' })
        : null

    const initialTags = bankTransaction.transaction_tags.map(({ id, key, value, dimension_display_name, value_display_name, archived_at, _local }) => makeTag({
      id,
      key,
      value,
      dimensionDisplayName: dimension_display_name,
      valueDisplayName: value_display_name,
      archivedAt: archived_at,
      _local: {
        isOptimistic: _local?.isOptimistic ?? false,
      },
    }))

    const [rowState, updateRowState] = useState<RowState>({
      splits: bankTransaction.category?.entries
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

          return c.type === 'ExclusionSplitEntry' && c.category.type === 'ExclusionNested'
            ? {
              amount: c.amount || 0,
              inputValue: formatMoney(c.amount),
              category: mapCategoryToExclusionOption(c.category),
              tags: splitTags,
              customerVendor: splitCustomerVendor,
            }
            : {
              amount: c.amount || 0,
              inputValue: formatMoney(c.amount),
              category: mapCategoryToOption(c.category),
              tags: splitTags,
              customerVendor: splitCustomerVendor,
            }
        })
        : [
          {
            amount: bankTransaction.amount,
            inputValue: formatMoney(bankTransaction.amount),
            category: defaultCategory ? mapCategoryToOption(defaultCategory) : undefined,
            tags: initialTags,
            customerVendor: initialCustomerVendor,
          },
        ],
      description: '',
      file: undefined,
    })

    const addSplit = () => {
      updateRowState({
        ...rowState,
        splits: [
          ...rowState.splits,
          {
            amount: 0,
            inputValue: '0.00',
            category: defaultCategory ? mapCategoryToOption(defaultCategory) : undefined,
            tags: [],
            customerVendor: initialCustomerVendor,
          },
        ],
      })
      setSplitFormError(undefined)
    }

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
      setSplitFormError(undefined)
    }

    const sanitizeNumberInput = (input: string): string => {
      let sanitized = input.replace(/[^0-9.]/g, '')

      // Ensure there's at most one period
      const parts = sanitized.split('.')
      if (parts.length > 2) {
        sanitized = parts[0] + '.' + parts.slice(1).join('')
      }

      // Limit to two digits after the decimal point
      if (parts.length === 2) {
        sanitized = parts[0] + '.' + parts[1].slice(0, 2)
      }

      return sanitized
    }

    const updateAmounts =
      (rowNumber: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const newDisplaying = sanitizeNumberInput(event.target.value)

        const newAmount = Number(newDisplaying) * 100 // cents
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
        setSplitFormError(undefined)
      }

    const onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      if (event.target.value === '') {
        const [_, index] = event.target.name.split('-')
        rowState.splits[parseInt(index)].inputValue = '0.00'
        updateRowState({ ...rowState })
        setSplitFormError(undefined)
      }
    }

    const onChangePurpose = (event: React.ChangeEvent<HTMLInputElement>) => {
      setPurpose(
        event.target.value === 'match'
          ? Purpose.match
          : Purpose.categorize,
      )
      setSplitFormError(undefined)
      setMatchFormError(undefined)
    }

    const changeCategory = (index: number, newValue: CategoryOption) => {
      rowState.splits[index].category = newValue
      updateRowState({ ...rowState })
      setSplitFormError(undefined)
    }

    const changeTags = (index: number, newTags: readonly Tag[]) => {
      const oldTags = rowState.splits[index].tags
      rowState.splits[index].tags = newTags
      updateRowState({ ...rowState })
      setSplitFormError(undefined)

      // Auto-save tags only when in unsplit state (single split entry)
      if (rowState.splits.length === 1) {
        const addedTags = newTags.filter(newTag =>
          !oldTags.some(oldTag => oldTag.key === newTag.key && oldTag.value === newTag.value),
        )

        const removedTags = oldTags.filter(oldTag =>
          !newTags.some(newTag => newTag.key === oldTag.key && newTag.value === oldTag.value),
        )

        addedTags.forEach((tag) => {
          void tagBankTransaction({
            key: tag.key,
            value: tag.value,
            dimensionDisplayName: tag.dimensionDisplayName,
            valueDisplayName: tag.valueDisplayName,
          })
        })

        removedTags.forEach((tag) => {
          void removeTagFromBankTransaction({
            tagId: tag.id,
          })
        })
      }
    }

    const changeCustomerVendor = (index: number, newCustomerVendor: typeof CustomerVendorSchema.Type | null) => {
      rowState.splits[index].customerVendor = newCustomerVendor
      updateRowState({ ...rowState })
      setSplitFormError(undefined)

      // Auto-save customer/vendor only when in unsplit state (single split entry)
      if (rowState.splits.length === 1) {
        void setMetadataOnBankTransaction({
          customer: newCustomerVendor?.customerVendorType === 'CUSTOMER' ? newCustomerVendor : null,
          vendor: newCustomerVendor?.customerVendorType === 'VENDOR' ? newCustomerVendor : null,
        })
      }
    }

    const save = async () => {
      if (purpose === Purpose.match) {
        if (!selectedMatchId) {
          setMatchFormError('Select an option to match the transaction')
          return
        }
        else if (
          selectedMatchId
          && selectedMatchId !== isAlreadyMatched(bankTransaction)
        ) {
          await onMatchSubmit(selectedMatchId)
          return
        }
        close()
        return
      }

      if (!validateSplit(rowState)) {
        if (rowState.splits.length > 1) {
          setSplitFormError(
            'Use only positive amounts and select category for each entry',
          )
        }
        else {
          setSplitFormError('Category is required')
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
              tags: split.tags.map(tag => makeTagKeyValueFromTag(tag)),
              customer_id: split.customerVendor?.customerVendorType === 'CUSTOMER' ? split.customerVendor.id : null,
              vendor_id: split.customerVendor?.customerVendorType === 'VENDOR' ? split.customerVendor.id : null,
            })),
          } as SplitCategoryUpdate),
      )
      close()
    }

    // Call this save action after clicking save in parent component:
    useImperativeHandle(ref, () => ({
      save,
    }))

    const onMatchSubmit = async (matchId: string) => {
      const foundMatch = bankTransaction.suggested_matches?.find(
        x => x.id === matchId,
      )
      if (!foundMatch) {
        return
      }

      await matchBankTransaction(bankTransaction.id, foundMatch.id)
      close()
    }

    const bookkeepingStatus = useEffectiveBookkeepingStatus()
    const categorizationEnabled = isCategorizationEnabledForStatus(bookkeepingStatus)

    const effectiveSplits = categorizationEnabled
      ? rowState.splits
      : []

    const className = 'Layer__expanded-bank-transaction-row'

    return (
      <span
        className={`${className} ${className}--${
          isOpen ? 'expanded' : 'collapsed'
        }`}
      >
        {!isOpen
          ? null
          : (
            <span className={`${className}__wrapper`} ref={bodyRef}>
              {categorizationEnabled
                ? (
                  <div className={`${className}__content-toggle`}>
                    <Toggle
                      name={`purpose-${bankTransaction.id}${
                        asListItem ? '-li' : ''
                      }`}
                      size={ToggleSize.small}
                      options={[
                        {
                          value: 'categorize',
                          label: 'Categorize',
                        },
                        {
                          value: 'match',
                          label: hasSuggestedTransferMatches(bankTransaction) ? 'Transfer' : 'Match',
                          disabled: !hasMatch(bankTransaction),
                          disabledMessage:
                        'We could not find matching transactions',
                        },
                      ]}
                      selected={purpose}
                      onChange={onChangePurpose}
                    />
                  </div>
                )
                : (
                  <></>
                )}
              <div
                className={`${className}__content`}
                id={`expanded-${bankTransaction.id}`}
              >
                <div className={`${className}__content-panels`}>
                  <div
                    className={classNames(
                      `${className}__match`,
                      `${className}__content-panel`,
                      purpose === Purpose.match
                        ? `${className}__content-panel--active`
                        : '',
                    )}
                  >
                    <div className={`${className}__content-panel-container`}>
                      <MatchForm
                        classNamePrefix={className}
                        bankTransaction={bankTransaction}
                        selectedMatchId={selectedMatchId}
                        readOnly={!categorizationEnabled}
                        setSelectedMatchId={(id) => {
                          setMatchFormError(undefined)
                          setSelectedMatchId(id)
                        }}
                        matchFormError={matchFormError}
                      />
                    </div>
                  </div>

                  <div
                    className={classNames(
                      `${className}__splits`,
                      `${className}__content-panel`,
                      purpose === Purpose.categorize
                        ? `${className}__content-panel--active`
                        : '',
                    )}
                  >
                    <div className={`${className}__content-panel-container`}>
                      <div className={`${className}__splits-inputs`}>
                        {effectiveSplits.map((split, index) => (
                          <div
                            className={`${className}__table-cell--split-entry`}
                            key={`split-${index}`}
                          >
                            <Input
                              type='text'
                              name={`split-${index}${asListItem ? '-li' : ''}`}
                              disabled={
                                index === 0 || !categorizationEnabled
                              }
                              onChange={updateAmounts(index)}
                              value={split.inputValue}
                              onBlur={onBlur}
                              isInvalid={split.amount < 0}
                              inputMode='numeric'
                              errorMessage='Negative values are not allowed'
                              className={`${className}__table-cell--split-entry__amount`}
                            />
                            <CategorySelect
                              bankTransaction={bankTransaction}
                              name={`category-${bankTransaction.id}`}
                              value={split.category}
                              onChange={value => changeCategory(index, value)}
                              className='Layer__category-menu--full'
                              disabled={
                                bankTransaction.processing
                                || !categorizationEnabled
                              }
                              excludeMatches
                              showTooltips={showTooltips}
                            />
                            {showTags && (
                              <div className={`${className}__table-cell--split-entry__tags`}>
                                <TagDimensionsGroup
                                  value={split.tags}
                                  onChange={tags => changeTags(index, tags)}
                                  showLabels={false}
                                  isReadOnly={!categorizationEnabled}
                                />
                              </div>
                            )}
                            {showCustomerVendor && (
                              <div className='Layer__expanded-bank-transaction-row__table-cell--split-entry__customer'>
                                <CustomerVendorSelector
                                  selectedCustomerVendor={split.customerVendor}
                                  onSelectedCustomerVendorChange={customerVendor => changeCustomerVendor(index, customerVendor)}
                                  placeholder='Set customer or vendor'
                                  isReadOnly={!categorizationEnabled}
                                  showLabel={false}
                                />
                              </div>
                            )}
                            <div className='Layer__expanded-bank-transaction-row__table-cell--split-entry__button'>
                              <Button
                                onPress={() => removeSplit(index)}
                                variant='outlined'
                                icon
                                isDisabled={index == 0}
                              >
                                <Trash size={18} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {splitFormError && <ErrorText>{splitFormError}</ErrorText>}
                      <div className={`${className}__total-and-btns`}>
                        {effectiveSplits.length > 1 && (
                          <Input
                            disabled={true}
                            leftText='Total'
                            inputMode='numeric'
                            value={`$${formatMoney(
                              effectiveSplits.reduce(
                                (x, { amount }) => x + amount,
                                0,
                              ),
                            )}`}
                          />
                        )}
                        {categorizationEnabled
                          ? (
                            <div className={`${className}__splits-buttons`}>
                              {effectiveSplits.length > 1
                                ? (
                                  <TextButton
                                    onClick={addSplit}
                                  >
                                    Add new split
                                  </TextButton>
                                )
                                : (
                                  <Button
                                    onClick={addSplit}
                                    variant='outlined'
                                  >
                                    <Scissors size={14} />
                                    Split
                                  </Button>
                                )}
                            </div>
                          )
                          : (
                            <></>
                          )}
                      </div>
                    </div>
                  </div>
                </div>

                <BankTransactionFormFields
                  bankTransaction={bankTransaction}
                  showDescriptions={showDescriptions}
                  hideTags={purpose === Purpose.categorize}
                  hideCustomerVendor={purpose === Purpose.categorize}
                />

                {showReceiptUploads && (
                  <BankTransactionReceiptsWithProvider
                    bankTransaction={bankTransaction}
                    isActive={isOpen}
                    classNamePrefix={className}
                    floatingActions={!asListItem}
                  />
                )}

                {asListItem && categorizationEnabled
                  ? (
                    <div className={`${className}__submit-btn`}>
                      {bankTransaction.error
                        ? (
                          <Text
                            as='span'
                            size={TextSize.md}
                            className='Layer__unsaved-info'
                          >
                            <span>Unsaved</span>
                            <AlertCircle size={12} />
                          </Text>
                        )
                        : null}
                      <SubmitButton
                        onClick={() => {
                          if (!bankTransaction.processing) {
                            void save()
                          }
                        }}
                        className='Layer__bank-transaction__submit-btn'
                        processing={bankTransaction.processing}
                        active={true}
                        action={
                          categorized ? SubmitAction.SAVE : SubmitAction.UPDATE
                        }
                      >
                        {submitBtnText}
                      </SubmitButton>
                    </div>
                  )
                  : null}
              </div>
              <APIErrorNotifications
                bankTransaction={bankTransaction}
                containerWidth={containerWidth}
              />
            </span>
          )}
      </span>
    )
  },
)

ExpandedBankTransactionRow.displayName = 'ExpandedBankTransactionRow'

export { ExpandedBankTransactionRow }
