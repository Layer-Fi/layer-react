import { Category } from '../../types'
import { get } from './authenticated_http'

export const getCategories = get<{
  data: {
    type: 'Category_List'
    categories: Category[]
  }
}>(
  ({ businessId }) =>
    `https://sandbox.layerfi.com/v1/businesses/${businessId}/categories`,
)
