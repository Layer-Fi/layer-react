import { Schema } from 'effect'

import { NestedCategorizationSchema } from '@schemas/categorization/nestedCategorization'

export const CategoryListSchema = Schema.Struct({
  type: Schema.Literal('Category_List'),
  categories: Schema.mutable(Schema.Array(NestedCategorizationSchema)),
})

export enum CategoriesListMode {
  All = 'ALL',
  Expenses = 'EXPENSES',
  Revenue = 'REVENUE',
  Default = 'DEFAULT',
}
