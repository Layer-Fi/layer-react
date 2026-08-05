import type { BankTransactionNonSuggestedMatchOption } from '@internal-types/bankTransactionMatchOption'
import { ApiCategorizationAsOption, SplitAsOption } from '@internal-types/categorizationOption'
import { type Categorization, isSplitCategorization } from '@schemas/features/categorization/categorization'
import { makeCustomerVendor } from '@schemas/features/customerVendor/customerVendor'
import { makeTagFromTransactionTag } from '@schemas/features/tags/tag'

export const convertApiCategorizationToCategoryOrSplitAsOption = (categorization: Categorization): BankTransactionNonSuggestedMatchOption => {
  if (isSplitCategorization(categorization)) {
    const splits = categorization.entries.map(splitEntry => ({
      amount: splitEntry.amount || 0,
      category: splitEntry.category ? new ApiCategorizationAsOption(splitEntry.category) : null,
      taxCode: splitEntry.taxCode ?? null,
      tags: splitEntry.tags?.map(makeTagFromTransactionTag) ?? [],
      customerVendor: makeCustomerVendor(splitEntry.customer, splitEntry.vendor),
    }))

    return new SplitAsOption(splits)
  }

  return new ApiCategorizationAsOption(categorization)
}
