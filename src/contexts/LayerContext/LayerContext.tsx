import { createContext } from 'react'
import { LayerExecutionContext } from '../../types'

export const LayerContext = createContext<LayerExecutionContext>({
  auth: undefined,
  businessId: '',
})
