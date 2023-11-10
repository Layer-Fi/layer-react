import { createContext } from 'react'
import { LayerContextValues } from '../../types'

export const LayerContext = createContext<LayerContextValues>({
  auth: undefined,
  businessId: '',
  categories: [],
})
