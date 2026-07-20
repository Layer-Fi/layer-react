import { useMemo } from 'react'

import type { BankTransaction } from '@internal-types/bankTransactions'
import { makeTagFromTransactionTag, type Tag } from '@schemas/tag'
import { useRemoveTagFromBankTransaction } from '@hooks/api/businesses/[business-id]/bank-transactions/tags/useRemoveTagFromBankTransaction'
import { useTagBankTransaction } from '@hooks/api/businesses/[business-id]/bank-transactions/tags/useTagBankTransaction'
import { BankTransactionsFeature, useIsBankTransactionsFeatureEnabled } from '@providers/BankTransactionsFeatureVisibility/BankTransactionsFeatureVisibilityProvider'
import { useBankTransactionsIsCategorizationEnabledContext } from '@contexts/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import { VStack } from '@ui/Stack/Stack'
import { BankTransactionCustomerVendorSelector } from '@components/BankTransactionCustomerVendorSelector/BankTransactionCustomerVendorSelector'
import { BankTransactionMemo } from '@components/BankTransactions/BankTransactionMemo/BankTransactionMemo'
import { TagDimensionsGroup } from '@components/Tags/TagDimensionsGroup/TagDimensionsGroup'

type BankTransactionFormFieldProps = {
  bankTransaction: Pick<
    BankTransaction,
    'id' | 'transactionTags' | 'customer' | 'vendor' | 'memo'
  >
  hideTags?: boolean
  hideCustomerVendor?: boolean
  isMobile?: boolean
}

export function BankTransactionFormFields({
  bankTransaction,
  hideTags = false,
  hideCustomerVendor = false,
  isMobile = false,
}: BankTransactionFormFieldProps) {
  const showTags = useIsBankTransactionsFeatureEnabled(BankTransactionsFeature.Tags)
  const showCustomerVendor = useIsBankTransactionsFeatureEnabled(BankTransactionsFeature.CustomerVendor)
  const showDescriptions = useIsBankTransactionsFeatureEnabled(BankTransactionsFeature.Descriptions)

  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabledContext()

  // Hooks for auto-saving tags
  const { trigger: tagBankTransaction } = useTagBankTransaction({ bankTransactionId: bankTransaction.id })
  const { trigger: removeTagFromBankTransaction } = useRemoveTagFromBankTransaction({ bankTransactionId: bankTransaction.id })

  const selectedTags = useMemo(
    () => bankTransaction.transactionTags.map(makeTagFromTransactionTag),
    [bankTransaction.transactionTags],
  )

  const handleTagsChange = (newTags: readonly Tag[]) => {
    const oldTags = selectedTags

    // Find tags that were added
    const addedTags = newTags.filter(newTag =>
      !oldTags.some(oldTag => oldTag.key === newTag.key && oldTag.value === newTag.value),
    )

    // Find tags that were removed
    const removedTags = oldTags.filter(oldTag =>
      !newTags.some(newTag => newTag.key === oldTag.key && newTag.value === oldTag.value),
    )

    // Trigger API calls for added tags
    addedTags.forEach((tag) => {
      void tagBankTransaction({
        key: tag.key,
        value: tag.value,
        dimensionDisplayName: tag.dimensionDisplayName,
        valueDisplayName: tag.valueDisplayName,
      })
    })

    // Trigger API calls for removed tags
    removedTags.forEach((tag) => {
      void removeTagFromBankTransaction({
        tagId: tag.id,
      })
    })
  }

  if (!showTags && !showCustomerVendor && !showDescriptions) {
    return null
  }

  return (
    <VStack gap='md'>
      {showCustomerVendor && !hideCustomerVendor
        && <BankTransactionCustomerVendorSelector bankTransaction={bankTransaction} />}
      {showTags && !hideTags
        && (
          <TagDimensionsGroup
            value={selectedTags}
            onChange={handleTagsChange}
            showLabels={true}
            isReadOnly={!isCategorizationEnabled}
          />
        )}
      {showDescriptions
        && (
          <VStack gap='sm'>
            <BankTransactionMemo bankTransactionId={bankTransaction.id} memo={bankTransaction.memo} isMobile={isMobile} />
          </VStack>
        )}
    </VStack>
  )
}
