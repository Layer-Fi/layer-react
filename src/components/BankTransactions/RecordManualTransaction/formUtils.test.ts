import { describe, expect, it } from 'vitest'

import { makeAccountId, makeStableName } from '@schemas/accountIdentifier'
import { makeExclusion, type NestedCategorization } from '@schemas/categorization'
import { matchCategoryClassification } from '@components/BankTransactions/RecordManualTransaction/formUtils'

const CATEGORIES: NestedCategorization[] = [
  { type: 'AccountNested', id: 'account-cash', stableName: 'CASH', category: 'CASH', displayName: 'Cash', subCategories: null },
  { type: 'OptionalAccountNested', stableName: 'WEBSITE', category: 'WEBSITE', displayName: 'Website', subCategories: null },
  { type: 'ExclusionNested', id: 'DUPLICATE_TRANSACTION', category: 'DUPLICATE_TRANSACTION', displayName: 'Duplicate transaction', subCategories: null },
]

describe('matchCategoryClassification', () => {
  it('matches an id-keyed account leaf by id', () => {
    const result = matchCategoryClassification(
      { type: 'Account', id: 'account-cash', stableName: 'CASH', category: 'CASH', displayName: 'Cash' },
      CATEGORIES,
    )

    expect(result).toEqual(makeAccountId('account-cash'))
  })

  it('matches a stableName-keyed leaf when the categorization carries a concrete id', () => {
    const result = matchCategoryClassification(
      { type: 'Account', id: 'd2338987-2886-4b68-afcb-1757702a2998', stableName: 'WEBSITE', category: 'WEBSITE', displayName: 'Website' },
      CATEGORIES,
    )

    expect(result).toEqual(makeStableName('WEBSITE'))
  })

  it('matches an exclusion leaf by category', () => {
    const result = matchCategoryClassification(
      { type: 'Exclusion', id: 'exclusion-duplicate_transaction', category: 'DUPLICATE_TRANSACTION', displayName: 'Duplicate transaction' },
      CATEGORIES,
    )

    expect(result).toEqual(makeExclusion('DUPLICATE_TRANSACTION'))
  })
})
