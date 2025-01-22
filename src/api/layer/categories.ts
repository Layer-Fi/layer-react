import { toDefinedSearchParameters } from '../../utils/request/toDefinedSearchParameters'
import { Category } from '../../types'
import { get } from './authenticated_http'

export const getCategories = get<
  {
    data: {
      type: 'Category_List'
      categories: Category[]
    }
  },
  {
    businessId: string
    mode?: 'ALL'
  }
>(({ businessId, mode }) => {
  const parameters = toDefinedSearchParameters({ mode })

  return `/v1/businesses/${businessId}/categories?${parameters}`
})
