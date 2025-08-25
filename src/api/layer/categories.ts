import { toDefinedSearchParameters } from '../../utils/request/toDefinedSearchParameters'
import { get } from './authenticated_http'
import { CategoryList } from '../../schemas/categorization'

export type CategoriesListMode = 'ALL' | 'EXPENSES' | 'DEFAULT'

export const getCategories = get<
  {
    data: CategoryList
  },
  {
    businessId: string
    mode?: CategoriesListMode
  }
>(({ businessId, mode }) => {
  const parameters = toDefinedSearchParameters({ mode })

  return `/v1/businesses/${businessId}/categories?${parameters}`
})
