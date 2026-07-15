import { Schema } from 'effect'

import { CategoryListSchema, type NestedCategorization } from '@schemas/categorization'
import { type SingleChartAccountType } from '@schemas/generalLedger/ledgerAccount'

import { accountCategorizationFields } from '@msw/api/businesses/[business-id]/ledger/accounts/accountCategorizationFields'
import { groupByParentAccountId, ledgerAccountStore } from '@msw/api/businesses/[business-id]/ledger/accounts/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeCategoryList = Schema.encodeSync(CategoryListSchema)

const FOOTER_CATEGORIES: NestedCategorization[] = [
  { type: 'OptionalAccountNested', stableName: 'PERSONAL_EXPENSES', category: 'PERSONAL_EXPENSES', displayName: 'Personal Transaction' },
  { type: 'OptionalAccountNested', stableName: 'PERSONAL_EXPENSES', category: 'PERSONAL_EXPENSES', displayName: 'Paying Myself' },
  { type: 'OptionalAccountNested', stableName: 'CONTRIBUTIONS', category: 'CONTRIBUTIONS', displayName: 'Personal Income Sources' },
  { type: 'ExclusionNested', id: 'DUPLICATE_TRANSACTION', category: 'DUPLICATE_TRANSACTION', displayName: 'Duplicate transaction' },
]

// EXPENSES/REVENUE modes list these children first, matching the API's ordering.
const CHILD_ORDER_BY_MODE: Record<string, { root: string, first: readonly string[] }> = {
  EXPENSES: { root: 'EXPENSES', first: ['COST_OF_GOODS_SOLD', 'OPERATING_EXPENSES', 'TAXES'] },
  REVENUE: { root: 'REVENUE', first: ['SALES', 'RETURNS_AND_ALLOWANCES', 'UNCATEGORIZED_REVENUE'] },
}

const buildCategoryTree = () => {
  const childrenByParentId = groupByParentAccountId(ledgerAccountStore.all())

  const toNode = (account: SingleChartAccountType): NestedCategorization => {
    const children = childrenByParentId.get(account.accountId) ?? []

    return {
      type: 'AccountNested',
      ...accountCategorizationFields(account),
      subCategories: children.length > 0 ? children.map(toNode) : null,
    }
  }

  return (childrenByParentId.get(null) ?? []).map(toNode)
}

const sortChildrenFirst = (node: NestedCategorization, first: readonly string[]): NestedCategorization => ({
  ...node,
  subCategories: node.subCategories == null
    ? node.subCategories
    : [...node.subCategories].sort((a, b) => {
      const rank = (child: NestedCategorization) => {
        const index = first.indexOf(child.category)
        return index === -1 ? first.length : index
      }

      return rank(a) - rank(b)
    }),
})

const toCategories = (mode: string | null): NestedCategorization[] => {
  const tree = buildCategoryTree()
  const subtree = CHILD_ORDER_BY_MODE[mode ?? '']

  if (subtree) {
    const root = tree.find(node => node.category === subtree.root)

    return root ? [sortChildrenFirst(root, subtree.first)] : []
  }

  return [...tree, ...FOOTER_CATEGORIES]
}

export const toCategoriesResponse = (categories: NestedCategorization[]) =>
  apiData(encodeCategoryList({ type: 'Category_List', categories }))

export const get = createMockEndpoint<NestedCategorization[], ReturnType<typeof toCategoriesResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/categories',
  resolve: ({ override, request }) =>
    toCategoriesResponse(override ?? toCategories(new URL(request.url).searchParams.get('mode'))),
})
