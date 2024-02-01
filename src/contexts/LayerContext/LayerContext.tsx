import { createContext } from 'react'
import { LayerContextValues } from '../../types'

export const LayerContext = createContext<LayerContextValues>({
  auth: {
    access_token: '',
    expires_at: new Date(2000, 1, 1),
    expires_in: -1,
    token_type: '',
  },
  businessId: '',
  categories: [],
  apiUrl: '',
  theme: undefined,
})
