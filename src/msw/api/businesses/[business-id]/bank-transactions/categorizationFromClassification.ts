import {
  type AccountCategorizationSchema,
  type Classification,
  type ExclusionCategorizationSchema,
} from '@schemas/categorization'
import { type SingleChartAccountType } from '@schemas/generalLedger/ledgerAccount'
import { humanizeEnum } from '@utils/format'

import { ledgerAccountStore } from '@msw/api/businesses/[business-id]/ledger/accounts/store'

type AccountCategorization = typeof AccountCategorizationSchema.Type
type ExclusionCategorization = typeof ExclusionCategorizationSchema.Type

const toAccountCategorization = (account: SingleChartAccountType): AccountCategorization => ({
  type: 'Account',
  id: account.accountId,
  stableName: account.stableName ?? null,
  category: account.stableName ?? account.accountId,
  displayName: account.name,
})

export const categorizationFromClassification = (
  classification: Classification,
): AccountCategorization | ExclusionCategorization => {
  if (classification.type === 'Exclusion') {
    return {
      type: 'Exclusion',
      id: `exclusion-${classification.exclusionType.toLowerCase()}`,
      category: classification.exclusionType,
      displayName: humanizeEnum(classification.exclusionType),
    }
  }

  // Resolve against the same account pool the mocked /categories endpoint
  // serves, so the echoed categorization carries the account's display name.
  const accounts = ledgerAccountStore.all()

  if (classification.type === 'StableName') {
    const known = accounts.find(account => account.stableName === classification.stableName)
    if (known) return toAccountCategorization(known)

    return {
      type: 'Account',
      id: `category-${classification.stableName.toLowerCase().replaceAll('_', '-')}`,
      stableName: classification.stableName,
      category: classification.stableName,
      displayName: humanizeEnum(classification.stableName),
    }
  }

  const known = accounts.find(account => account.accountId === classification.id)
  if (known) return toAccountCategorization(known)

  return {
    type: 'Account',
    id: classification.id,
    stableName: null,
    category: classification.id,
    displayName: classification.id,
  }
}
