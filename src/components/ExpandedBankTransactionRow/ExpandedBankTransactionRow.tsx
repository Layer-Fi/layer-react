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
} from '../../types/bank_transactions'
import {
  hasMatch,
  hasSuggestedTransferMatches,
} from '../../utils/bankTransactions'
import { BankTransactionReceiptsWithProvider } from '../BankTransactionReceipts'
import { Tag, makeTagKeyValueFromTag, makeTag, makeTagFromTransactionTag } from '../../features/tags/tagSchemas'
import { TagDimensionsGroup } from '../../features/tags/components/TagDimensionsGroup'
import { CustomerVendorSelector } from '../../features/customerVendor/components/CustomerVendorSelector'
import { CustomerVendorSchema } from '../../features/customerVendor/customerVendorSchemas'
import { useTagBankTransaction } from '../../features/bankTransactions/[bankTransactionId]/tags/api/useTagBankTransaction'
import { useRemoveTagFromBankTransaction } from '../../features/bankTransactions/[bankTransactionId]/tags/api/useRemoveTagFromBankTransaction'
import { useSetMetadataOnBankTransaction } from '../../features/bankTransactions/[bankTransactionId]/metadata/api/useSetMetadataOnBankTransaction'

import { SubmitButton, TextButton } from '../Button'
import { SubmitAction } from '../Button/SubmitButton'
import { Button } from '../ui/Button/Button'
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
import { isSplitCategorizationEncoded, type ClassificationEncoded } from '../../schemas/categorization'
import { ApiCategorizationAsOption } from '../../types/categorizationOption'
import { type BankTransactionCategoryComboBoxOption } from '../../components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { type Split } from '../../types/bank_transactions'
import { BankTransactionCategoryComboBox } from '../BankTransactionCategoryComboBox/BankTransactionCategoryComboBox'
import { useBulkSelectionActions } from '../../providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { calculateAddSplit, calculateRemoveSplit, calculateUpdatedAmounts, getBankTransactionMatchId, getCustomerVendorForBankTransaction, getCustomerVendorForSplitEntry, validateSplit } from './utils'
import { useGetBankTransactionCategory } from '../../providers/BankTransactionsCategoryStore/BankTransactionsCategoryStoreProvider'

export type ExpandedRowState = {
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

export interface DocumentWithStatus {
  id?: string
  url?: string
  status: 'pending' | 'uploaded' | 'failed' | 'deleting'
  type?: string
  name?: string
  date?: string
  error?: string
}

type ExpandedBankTransactionRowProps = {
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

const ExpandedBankTransactionRow = forwardRef<SaveHandle, ExpandedBankTransactionRowProps>(
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
    },
    ref,
  ) => {
    const {
      categorize: categorizeBankTransaction,
      match: matchBankTransaction,
    } = useBankTransactionsContext()

    const { deselect } = useBulkSelectionActions()

    const { selectedCategory } = useGetBankTransactionCategory(bankTransaction.id)

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
      getBankTransactionMatchId(bankTransaction)
      ?? bankTransaction?.suggested_matches?.[0]?.id,
    )
    const [matchFormError, setMatchFormError] = useState<string | undefined>()
    const [splitFormError, setSplitFormError] = useState<string | undefined>()
    const bodyRef = useRef<HTMLSpanElement>(null)

    const initialCustomerVendor = getCustomerVendorForBankTransaction(bankTransaction)

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

    const [expandedRowState, updateExpandedRowState] = useState<ExpandedRowState>({
      splits: bankTransaction.category && isSplitCategorizationEncoded(bankTransaction.category)
        ? bankTransaction.category?.entries.map((splitEntry) => {
          // Use split-specific tags/customer/vendor only (no fallback to transaction-level values when splits exist)
          const splitTags = splitEntry.tags?.map(tag => makeTagFromTransactionTag({
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
          const splitCustomerVendor = getCustomerVendorForSplitEntry(splitEntry)

          return {
            amount: splitEntry.amount || 0,
            inputValue: formatMoney(splitEntry.amount),
            category: new ApiCategorizationAsOption(splitEntry.category),
            tags: splitTags,
            customerVendor: splitCustomerVendor,
          }
        })
        : [
          {
            amount: bankTransaction.amount,
            inputValue: formatMoney(bankTransaction.amount),
            category: selectedCategory ?? null,
            tags: initialTags,
            customerVendor: initialCustomerVendor,
          },
        ],
      description: '',
      file: undefined,
    })

    const addSplit = () => {
      const newExpandedRowState = calculateAddSplit(expandedRowState)
      updateExpandedRowState(newExpandedRowState)
      setSplitFormError(undefined)
    }

    const removeSplit = (index: number) => {
      const newExpandedRowState = calculateRemoveSplit(expandedRowState, { totalAmount: bankTransaction.amount, index })

      updateExpandedRowState(newExpandedRowState)
      setSplitFormError(undefined)
    }

    const updateAmounts =
      (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const newAmountInput = event.target.value

        const newExpandedRowState = calculateUpdatedAmounts(expandedRowState, { index, newAmountInput, totalAmount: bankTransaction.amount })
        updateExpandedRowState(newExpandedRowState)
        setSplitFormError(undefined)
      }

    const onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      if (event.target.value === '') {
        const [_, index] = event.target.name.split('-')
        expandedRowState.splits[parseInt(index)].inputValue = '0.00'
        updateExpandedRowState({ ...expandedRowState })
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

    const changeCategory = (index: number, newValue: BankTransactionCategoryComboBoxOption | null) => {
      if (newValue === null) return

      expandedRowState.splits[index].category = newValue
      updateExpandedRowState({ ...expandedRowState })
      setSplitFormError(undefined)
    }

    const changeTags = (index: number, newTags: readonly Tag[]) => {
      const oldTags = expandedRowState.splits[index].tags
      expandedRowState.splits[index].tags = newTags
      updateExpandedRowState({ ...expandedRowState })
      setSplitFormError(undefined)

      // Auto-save tags only when in unsplit state (single split entry)
      if (expandedRowState.splits.length === 1) {
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
      expandedRowState.splits[index].customerVendor = newCustomerVendor
      updateExpandedRowState({ ...expandedRowState })
      setSplitFormError(undefined)

      // Auto-save customer/vendor only when in unsplit state (single split entry)
      if (expandedRowState.splits.length === 1) {
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
          && selectedMatchId !== getBankTransactionMatchId(bankTransaction)
        ) {
          await onMatchSubmit(selectedMatchId)
          return
        }
        close()
        return
      }

      if (!validateSplit(expandedRowState)) {
        if (expandedRowState.splits.length > 1) {
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
        expandedRowState.splits.length === 1 && expandedRowState?.splits[0].category
          ? ({
            type: 'Category',
            category: expandedRowState?.splits[0].category.classificationEncoded as ClassificationEncoded,
          })
          : ({
            type: 'Split',
            entries: expandedRowState.splits.map(split => ({
              category: split.category?.classificationEncoded as ClassificationEncoded,
              amount: split.amount,
              tags: split.tags.map(tag => makeTagKeyValueFromTag(tag)),
              customer_id: split.customerVendor?.customerVendorType === 'CUSTOMER' ? split.customerVendor.id : null,
              vendor_id: split.customerVendor?.customerVendorType === 'VENDOR' ? split.customerVendor.id : null,
            })),
          }),
      )

      // Remove from bulk selection store
      deselect(bankTransaction.id)
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

      // Remove from bulk selection store
      deselect(bankTransaction.id)
      close()
    }

    const bookkeepingStatus = useEffectiveBookkeepingStatus()
    const categorizationEnabled = isCategorizationEnabledForStatus(bookkeepingStatus)

    const effectiveSplits = categorizationEnabled
      ? expandedRowState.splits
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
                            <BankTransactionCategoryComboBox
                              bankTransaction={bankTransaction}
                              selectedValue={split.category}
                              onSelectedValueChange={value => changeCategory(index, value)}
                              isLoading={bankTransaction.processing}
                              isDisabled={!categorizationEnabled}
                              includeSuggestedMatches={false}
                            />
                            {showTags && (
                              <TagDimensionsGroup
                                value={split.tags}
                                onChange={tags => changeTags(index, tags)}
                                showLabels={false}
                                isReadOnly={!categorizationEnabled}
                                className={`${className}__table-cell--split-entry__tags`}
                              />
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
