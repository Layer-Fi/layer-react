import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import {
  type BankTransaction,
  type SuggestedMatch,
} from '@internal-types/bankTransactions'
import { type Split } from '@internal-types/bankTransactions'
import { SplitAsOption, SuggestedMatchAsOption } from '@internal-types/categorizationOption'
import { type CustomerVendorSchema } from '@schemas/customerVendor'
import { type Tag } from '@schemas/tag'
import {
  hasMatch,
} from '@utils/bankTransactions'
import { getBankTransactionFirstSuggestedMatch } from '@utils/bankTransactions'
import { useSetMetadataOnBankTransaction } from '@hooks/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/metadata/useSetMetadataOnBankTransaction'
import { useRemoveTagFromBankTransaction } from '@hooks/api/businesses/[business-id]/bank-transactions/tags/useRemoveTagFromBankTransaction'
import { useTagBankTransaction } from '@hooks/api/businesses/[business-id]/bank-transactions/tags/useTagBankTransaction'
import { useSplitsForm } from '@hooks/features/bankTransactions/useSplitsForm'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useBankTransactionsCategoryActions, useGetBankTransactionCategory } from '@providers/BankTransactionsCategoryStore/BankTransactionsCategoryStoreProvider'
import { useBankTransactionsIsCategorizationEnabledContext } from '@contexts/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import Scissors from '@icons/ScissorsFullOpen'
import Trash from '@icons/Trash'
import { Button } from '@ui/Button/Button'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Toggle, ToggleSize } from '@ui/Toggle/Toggle'
import { BankTransactionCategoryComboBox } from '@components/BankTransactionCategoryComboBox/BankTransactionCategoryComboBox'
import { useBankTransactionCustomerVendorVisibility } from '@components/BankTransactionCustomerVendorSelector/BankTransactionCustomerVendorVisibilityProvider'
import { BankTransactionFormFields } from '@components/BankTransactionFormFields/BankTransactionFormFields'
import { BankTransactionReceiptsWithProvider } from '@components/BankTransactionReceipts/BankTransactionReceipts'
import { useBankTransactionTagVisibility } from '@components/BankTransactionTagSelector/BankTransactionTagVisibilityProvider'
import { TextButton } from '@components/Button/TextButton'
import { CustomerVendorSelector } from '@components/CustomerVendorSelector/CustomerVendorSelector'
import { AmountInput } from '@components/Input/AmountInput'
import { Input } from '@components/Input/Input'
import { MatchForm } from '@components/MatchForm/MatchForm'
import { Separator } from '@components/Separator/Separator'
import { TagDimensionsGroup } from '@components/Tags/TagDimensionsGroup/TagDimensionsGroup'
import { ErrorText } from '@components/Typography/ErrorText'

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

type TaxCodeOption = {
  label: string
  value: string
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
  const { t } = useTranslation()
  const { formatCurrencyFromCents } = useIntlFormatter()
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

  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabledContext()

  const taxCodeOptions = useMemo<TaxCodeOption[]>(
    () => bankTransaction.tax_options?.canada.map(taxOption => ({
      label: taxOption.display_name,
      value: taxOption.code,
    })) ?? [],
    [bankTransaction.tax_options?.canada],
  )

  const showTaxCodeSelector = taxCodeOptions.length > 0

  const getSelectedTaxCodeOption = useCallback(
    (taxCode: string | null): TaxCodeOption | null => {
      if (!taxCode) {
        return null
      }

      return taxCodeOptions.find(option => option.value === taxCode) ?? null
    },
    [taxCodeOptions],
  )

  const toggleOptions = useMemo(() => [
    {
      value: 'categorize',
      label: t('common:action.categorize', 'Categorize'),
    },
    {
      value: 'match',
      label: t('bankTransactions:label.match', 'Match'),
      disabled: !hasMatch(bankTransaction),
      disabledMessage: t('bankTransactions:error.matching_transactions_not_found', 'We could not find matching transactions'),
    },
  ], [t, bankTransaction])

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
                      ariaLabel={t('bankTransactions:label.transaction_action', 'Transaction action')}
                      size={ToggleSize.small}
                      options={toggleOptions}
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
                          setMatchFormError(!suggestedMatch ? t('bankTransactions:error.select_option_match_transaction', 'Select an option to match the transaction') : undefined)
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
                        {effectiveSplits.map((split, index) => {
                          const isTaxCodeSelectorDisabled = !isCategorizationEnabled
                            || split.category === null
                            || split.category.classification?.type === 'Exclusion'

                          return (
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
                              {showTaxCodeSelector && (
                                <ComboBox<TaxCodeOption>
                                  selectedValue={getSelectedTaxCodeOption(split.taxCode)}
                                  onSelectedValueChange={(option) => {
                                    updateSplitAtIndex(index, currentSplit => ({
                                      ...currentSplit,
                                      taxCode: option?.value ?? null,
                                    }))
                                  }}
                                  options={taxCodeOptions}
                                  isDisabled={isTaxCodeSelectorDisabled}
                                  isSearchable={false}
                                  isClearable
                                  placeholder={t('bankTransactions:action.select_tax_code', 'Select tax code')}
                                  className={`${className}__table-cell--split-entry__tax-code`}
                                />
                              )}
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
                                    placeholder={t('customerVendor:action.set_customer_vendor', 'Set customer or vendor')}
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
                          )
                        })}
                      </div>
                      {splitFormError && <HStack pb='sm'><ErrorText>{splitFormError}</ErrorText></HStack>}
                      <div className={`${className}__total-and-btns`}>
                        {effectiveSplits.length > 1 && (
                          <Input
                            disabled={true}
                            leftText={t('common:label.total', 'Total')}
                            inputMode='numeric'
                            value={formatCurrencyFromCents(effectiveSplits.reduce((x, { amount }) => x + amount, 0))}
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
                                    {t('bankTransactions:action.add_new_split', 'Add new split')}
                                  </TextButton>
                                )
                                : (
                                  <Button
                                    onClick={addSplit}
                                    variant='outlined'
                                  >
                                    <Scissors size={14} />
                                    {t('bankTransactions:action.split_label', 'Split')}
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
