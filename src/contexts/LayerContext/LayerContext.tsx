import { createContext } from 'react'
import { LayerConfig } from '../../types'

export const LayerContext = createContext<LayerConfig>({
  auth: undefined,
  businessId: '',
  categories: [],
})
