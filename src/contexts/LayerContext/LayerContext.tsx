import { createContext } from 'react'
import { LayerContextValues } from '../../types'

export const LayerContext = createContext<LayerContextValues>({
  auth: { access_token: '', expires_in: -1, token_type: '' },
  businessId: '',
  categories: [],
})
