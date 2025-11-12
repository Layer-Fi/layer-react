import { ErrorText } from '@components/Typography/ErrorText'
import { Text, TextSize } from '@components/Typography/Text'
import { Input } from '@components/Input/Input'
import { Button } from '@ui/Button/Button'
import { TextButton } from '@components/Button/TextButton'
import {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
} from 'react'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import AlertCircle from '@icons/AlertCircle'
import Scissors from '@icons/ScissorsFullOpen'
import Trash from '@icons/Trash'
import { centsToDollars as formatMoney } from '@models/Money'
import {
  BankTransaction,
  SuggestedMatch,
} from '@internal-types/bank_transactions'
import {
  hasMatch,
} from '@utils/bankTransactions'
import { BankTransactionReceiptsWithProvider } from '@components/BankTransactionReceipts/BankTransactionReceipts'
import { Tag } from '@features/tags/tagSchemas'
import { TagDimensionsGroup } from '@features/tags/components/TagDimensionsGroup'
import { CustomerVendorSelector } from '@features/customerVendor/components/CustomerVendorSelector'
import { CustomerVendorSchema } from '@features/customerVendor/customerVendorSchemas'
import { useTagBankTransaction } from '@features/bankTransactions/[bankTransactionId]/tags/api/useTagBankTransaction'
import { useRemoveTagFromBankTransaction } from '@features/bankTransactions/[bankTransactionId]/tags/api/useRemoveTagFromBankTransaction'
import { useSetMetadataOnBankTransaction } from '@features/bankTransactions/[bankTransactionId]/metadata/api/useSetMetadataOnBankTransaction'
import { SubmitAction, SubmitButton } from '@components/Button/SubmitButton'
import { MatchForm } from '@components/MatchForm/MatchForm'
import { Toggle, ToggleSize } from '@components/Toggle/Toggle'
import { APIErrorNotifications } from '@components/ExpandedBankTransactionRow/APIErrorNotifications'
import classNames from 'classnames'
import { useEffectiveBookkeepingStatus } from '@hooks/bookkeeping/useBookkeepingStatus'
import { isCategorizationEnabledForStatus } from '@utils/bookkeeping/isCategorizationEnabled'
import { BankTransactionFormFields } from '@features/bankTransactions/[bankTransactionId]/components/BankTransactionFormFields'
import { useBankTransactionTagVisibility } from '@features/bankTransactions/[bankTransactionId]/tags/components/BankTransactionTagVisibilityProvider'
import { useBankTransactionCustomerVendorVisibility } from '@features/bankTransactions/[bankTransactionId]/customerVendor/components/BankTransactionCustomerVendorVisibilityProvider'
import { type Split } from '@internal-types/bank_transactions'
import { BankTransactionCategoryComboBox } from '@components/BankTransactionCategoryComboBox/BankTransactionCategoryComboBox'
import { useBulkSelectionActions } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { getBankTransactionFirstSuggestedMatch, getBankTransactionMatchAsSuggestedMatch } from '@utils/bankTransactions'
import { useBankTransactionsCategoryActions, useGetBankTransactionCategory } from '@providers/BankTransactionsCategoryStore/BankTransactionsCategoryStoreProvider'
import { SplitAsOption, SuggestedMatchAsOption } from '@internal-types/categorizationOption'
import { AmountInput } from '@components/Input/AmountInput'
import { HStack } from '@ui/Stack/Stack'
import { useSplitsForm } from '@hooks/useBankTransactions/useSplitsForm'
import { buildCategorizeBankTransactionPayloadForSplit } from '@hooks/useBankTransactions/utils'

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
    const { setTransactionCategory } = useBankTransactionsCategoryActions()
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
    const [selectedMatch, setSelectedMatch] = useState<SuggestedMatch | undefined>(
      getBankTransactionFirstSuggestedMatch(bankTransaction),
    )
    const [matchFormError, setMatchFormError] = useState<string | undefined>()
    const bodyRef = useRef<HTMLSpanElement>(null)

    const {
      localSplits,
      splitFormError,
      isValid,
      addSplit,
      removeSplit,
      updateSplitAmount,
      changeCategoryForSplitAtIndex,
      updateSplitAtIndex,
      onBlurSplitAmount,
      getInputValueForSplitAtIndex,
      setSplitFormError,
    } = useSplitsForm({ bankTransaction, selectedCategory, isOpen })

    const onChangePurpose = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newPurpose = event.target.value === 'match'
        ? Purpose.match
        : Purpose.categorize
      setPurpose(newPurpose)

      if (newPurpose === Purpose.match) {
        setTransactionCategory(bankTransaction.id, selectedMatch ? new SuggestedMatchAsOption(selectedMatch) : null)
      }

      else if (newPurpose === Purpose.categorize && isValid) {
        setTransactionCategory(bankTransaction.id, new SplitAsOption(localSplits))
      }

      setSplitFormError(undefined)
      setMatchFormError(undefined)
    }

    const changeTags = (index: number, newTags: readonly Tag[]) => {
      const oldTags = localSplits[index].tags
      updateSplitAtIndex(index, split => ({ ...split, tags: newTags }))

      // Auto-save tags only when in unsplit state (single split entry)
      if (localSplits.length === 1) {
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
      updateSplitAtIndex(index, split => ({ ...split, customerVendor: newCustomerVendor }))
      // Auto-save customer/vendor only when in unsplit state (single split entry)
      if (localSplits.length === 1) {
        void setMetadataOnBankTransaction({
          customer: newCustomerVendor?.customerVendorType === 'CUSTOMER' ? newCustomerVendor : null,
          vendor: newCustomerVendor?.customerVendorType === 'VENDOR' ? newCustomerVendor : null,
        })
      }
    }

    const save = async () => {
      if (purpose === Purpose.match) {
        if (!selectedMatch) {
          setMatchFormError('Select an option to match the transaction')
          return
        }
        else if (
          selectedMatch
          && selectedMatch.id !== getBankTransactionMatchAsSuggestedMatch(bankTransaction)?.id
        ) {
          await onMatchSubmit(selectedMatch.id)
          return
        }
        close()
        return
      }

      if (!isValid) return

      const categorizationRequest = buildCategorizeBankTransactionPayloadForSplit(localSplits)

      await categorizeBankTransaction(
        bankTransaction.id,
        categorizationRequest,
      )

      // Remove from bulk selection store
      deselect(bankTransaction.id)
      close()
    }

    // This will allow the parent BankTransactionRow / ListItem / MobileListItem to call the save function from this component.
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
      ? localSplits
      : []

    const className = 'Layer__expanded-bank-transaction-row'

    return (
      <span
        className={`${className} ${className}--${
          isOpen ? 'expanded' : 'collapsed'
        }`}
      >
        {isOpen && (
          <span className={`${className}__wrapper`} ref={bodyRef}>
            {categorizationEnabled
              && (
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
                        label: 'Match',
                        disabled: !hasMatch(bankTransaction),
                        disabledMessage:
                        'We could not find matching transactions',
                      },
                    ]}
                    selected={purpose}
                    onChange={onChangePurpose}
                  />
                </div>
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
                      selectedMatchId={selectedMatch?.id}
                      readOnly={!categorizationEnabled}
                      setSelectedMatch={(suggestedMatch) => {
                        setMatchFormError(undefined)
                        setSelectedMatch(suggestedMatch)
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
                          <AmountInput
                            name={`split-${index}${asListItem ? '-li' : ''}`}
                            disabled={
                              index === 0 || !categorizationEnabled
                            }
                            onChange={updateSplitAmount(index)}
                            value={getInputValueForSplitAtIndex(index, split)}
                            onBlur={onBlurSplitAmount}
                            className={`${className}__table-cell--split-entry__amount`}
                            isInvalid={split.amount < 0}
                          />
                          <BankTransactionCategoryComboBox
                            bankTransaction={bankTransaction}
                            selectedValue={split.category}
                            onSelectedValueChange={(value) => {
                              changeCategoryForSplitAtIndex(index, value)
                            }}
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
                    {splitFormError && <HStack pb='sm'><ErrorText>{splitFormError}</ErrorText></HStack>}
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
                && (
                  <div className={`${className}__submit-btn`}>
                    {bankTransaction.error
                      && (
                        <Text
                          as='span'
                          size={TextSize.md}
                          className='Layer__unsaved-info'
                        >
                          <span>Unsaved</span>
                          <AlertCircle size={12} />
                        </Text>
                      )}
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
                )}
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
