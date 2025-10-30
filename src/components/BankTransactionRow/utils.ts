import { CategoryUpdate } from '../../types/categories'
import { ClassificationEncoded } from '../../schemas/categorization'
import { makeTagKeyValueFromTag } from '../../features/tags/tagSchemas'
import { type Split } from '../../types/bank_transactions'
import { SplitAsOption } from '../../types/categorizationOption'

export const buildSplitCategorizationRequest = (selectedCategory: SplitAsOption): CategoryUpdate => {
  return {
    type: 'Split',
    entries: selectedCategory.original.map((split: Split) => ({
      category: split.category?.classificationEncoded as ClassificationEncoded,
      amount: split.amount,
      tags: split.tags.map(tag => makeTagKeyValueFromTag(tag)),
      customer_id: split.customerVendor?.customerVendorType === 'CUSTOMER' ? split.customerVendor.id : null,
      vendor_id: split.customerVendor?.customerVendorType === 'VENDOR' ? split.customerVendor.id : null,
    })),
  }
}
