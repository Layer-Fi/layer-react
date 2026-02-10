import {
  useEffect,
  useRef,
  useState,
} from 'react'
import classNames from 'classnames'

import {
  type BankTransaction,
  type SuggestedMatch,
} from '@internal-types/bank_transactions'
import { type Split } from '@internal-types/bank_transactions'
import { SplitAsOption, SuggestedMatchAsOption } from '@internal-types/categorizationOption'
import { centsToDollars as formatMoney } from '@models/Money'
import {
  hasMatch,
} from '@utils/bankTransactions'
import { getBankTransactionFirstSuggestedMatch } from '@utils/bankTransactions'
import { useSplitsForm } from '@hooks/useBankTransactions/useSplitsForm'
import { useBankTransactionsCategoryActions, useGetBankTransactionCategory } from '@providers/BankTransactionsCategoryStore/BankTransactionsCategoryStoreProvider'
import { useBankTransactionsIsCategorizationEnabledContext } from '@contexts/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import Scissors from '@icons/ScissorsFullOpen'
import Trash from '@icons/Trash'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Toggle, ToggleSize } from '@ui/Toggle/Toggle'
import { BankTransactionCategoryComboBox } from '@components/BankTransactionCategoryComboBox/BankTransactionCategoryComboBox'
import { BankTransactionReceiptsWithProvider } from '@components/BankTransactionReceipts/BankTransactionReceipts'
import { TextButton } from '@components/Button/TextButton'
import { AmountInput } from '@components/Input/AmountInput'
import { Input } from '@components/Input/Input'
import { MatchForm } from '@components/MatchForm/MatchForm'
import { Separator } from '@components/Separator/Separator'
import { ErrorText } from '@components/Typography/ErrorText'
import { BankTransactionFormFields } from '@features/bankTransactions/[bankTransactionId]/components/BankTransactionFormFields'
import { useBankTransactionCustomerVendorVisibility } from '@features/bankTransactions/[bankTransactionId]/customerVendor/components/BankTransactionCustomerVendorVisibilityProvider'
import { useSetMetadataOnBankTransaction } from '@features/bankTransactions/[bankTransactionId]/metadata/api/useSetMetadataOnBankTransaction'
import { useRemoveTagFromBankTransaction } from '@features/bankTransactions/[bankTransactionId]/tags/api/useRemoveTagFromBankTransaction'
import { useTagBankTransaction } from '@features/bankTransactions/[bankTransactionId]/tags/api/useTagBankTransaction'
import { useBankTransactionTagVisibility } from '@features/bankTransactions/[bankTransactionId]/tags/components/BankTransactionTagVisibilityProvider'
import { CustomerVendorSelector } from '@features/customerVendor/components/CustomerVendorSelector'
import { type CustomerVendorSchema } from '@features/customerVendor/customerVendorSchemas'
import { TagDimensionsGroup } from '@features/tags/components/TagDimensionsGroup'
import { type Tag } from '@features/tags/tagSchemas'

import './expandedBankTransactionRow.scss'

export type ExpandedRowState = {
  splits: Split[]
  description: string
  file: unknown
}

enum Purpose {
  categorize = 'categorize',
  match = 'match',
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
  asListItem?: boolean
  categorized?: boolean

  showDescriptions: boolean
  showReceiptUploads: boolean
  showTooltips: boolean

  variant?: 'list' | 'row'
  onValidityChange?: (isValid: boolean) => void
}

export const ExpandedBankTransactionRow = ({
  bankTransaction,
  isOpen = false,
  asListItem = false,
  showDescriptions,
  showReceiptUploads,
  variant = 'row',
  onValidityChange,
}: ExpandedBankTransactionRowProps) => {
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
    isValid: isSplitsValid,
    addSplit,
    removeSplit,
    updateSplitAmount,
    changeCategoryForSplitAtIndex,
    updateSplitAtIndex,
    onBlurSplitAmount,
    getInputValueForSplitAtIndex,
    setSplitFormError,
  } = useSplitsForm({ bankTransaction, selectedCategory, isOpen })

  useEffect(() => {
    const isValid = purpose === Purpose.match
      ? !!selectedMatch
      : isSplitsValid

    onValidityChange?.(isValid)
  }, [isSplitsValid, onValidityChange, purpose, selectedMatch])

  const onChangePurpose = (key: React.Key) => {
    const newPurpose = key === 'match'
      ? Purpose.match
      : Purpose.categorize
    setPurpose(newPurpose)

    if (newPurpose === Purpose.match) {
      setTransactionCategory(bankTransaction.id, selectedMatch ? new SuggestedMatchAsOption(selectedMatch) : null)
    }

    else if (newPurpose === Purpose.categorize && isSplitsValid) {
      setTransactionCategory(bankTransaction.id, new SplitAsOption(localSplits))
    }

    setSplitFormError(undefined)
    setMatchFormError(undefined)
  }

  const changeTags = (index: number, newTags: readonly Tag[]) => {
    const splitAtIndex = localSplits[index]
    if (!splitAtIndex) return
    const oldTags = splitAtIndex.tags
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

  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabledContext()

  const effectiveSplits = isCategorizationEnabled
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
        <>
          <Separator />
          <span className={`${className}__wrapper`} ref={bodyRef}>
            <VStack pis={variant === 'row' ? 'md' : undefined} pbs='sm' pbe='md'>
              {isCategorizationEnabled
                && (
                  <HStack pi='md' pbe='md' pbs='3xs'>
                    <Toggle
                      ariaLabel='Transaction action'
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
                      selectedKey={purpose}
                      onSelectionChange={onChangePurpose}
                    />
                  </HStack>
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
                        bankTransaction={bankTransaction}
                        selectedMatchId={selectedMatch?.id}
                        readOnly={!isCategorizationEnabled}
                        setSelectedMatch={(suggestedMatch) => {
                          setSelectedMatch(suggestedMatch)
                          setMatchFormError(!suggestedMatch ? 'Select an option to match the transaction' : undefined)
                          setTransactionCategory(
                            bankTransaction.id,
                            suggestedMatch ? new SuggestedMatchAsOption(suggestedMatch) : null,
                          )
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
                                index === 0 || !isCategorizationEnabled
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
                              isDisabled={!isCategorizationEnabled}
                              includeSuggestedMatches={false}
                            />
                            {showTags && (
                              <TagDimensionsGroup
                                value={split.tags}
                                onChange={tags => changeTags(index, tags)}
                                showLabels={false}
                                isReadOnly={!isCategorizationEnabled}
                                className={`${className}__table-cell--split-entry__tags`}
                              />
                            )}
                            {showCustomerVendor && (
                              <div className='Layer__expanded-bank-transaction-row__table-cell--split-entry__customer'>
                                <CustomerVendorSelector
                                  selectedCustomerVendor={split.customerVendor}
                                  onSelectedCustomerVendorChange={customerVendor => changeCustomerVendor(index, customerVendor)}
                                  placeholder='Set customer or vendor'
                                  isReadOnly={!isCategorizationEnabled}
                                  showLabel={false}
                                />
                              </div>
                            )}
                            <div className='Layer__expanded-bank-transaction-row__table-cell--split-entry__button'>
                              <Button
                                onPress={() => removeSplit(index)}
                                variant='outlined'
                                icon
                                isDisabled={index === 0}
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
                        {isCategorizationEnabled
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
                <VStack pis='md' className='Layer__ExpandedBankTransactionRow__Description'>
                  <BankTransactionFormFields
                    bankTransaction={bankTransaction}
                    showDescriptions={showDescriptions}
                    hideTags={purpose === Purpose.categorize}
                    hideCustomerVendor={purpose === Purpose.categorize}
                  />
                </VStack>

                {showReceiptUploads && (
                  <BankTransactionReceiptsWithProvider
                    bankTransaction={bankTransaction}
                    isActive={isOpen}
                    classNamePrefix={className}
                    floatingActions={!asListItem}
                  />
                )}
              </div>
            </VStack>
          </span>
        </>
      )}
    </span>
  )
}
