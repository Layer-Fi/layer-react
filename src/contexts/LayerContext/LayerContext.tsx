import { createContext, useContext } from 'react'

import {
  type LayerContextDateRange,
  type LayerContextHelpers,
  type LayerContextValues,
} from '@internal-types/layer_context'

type LayerContextShape = LayerContextValues & LayerContextHelpers & LayerContextDateRange

export const LayerContext = createContext<LayerContextShape | undefined>(undefined)

export const useLayerContext = () => {
  const ctx = useContext(LayerContext)
  if (!ctx) throw new Error('useLayerContext must be used within LayerProvider')
  return ctx
}
