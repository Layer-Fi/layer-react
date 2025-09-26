import { createContext, useContext } from 'react'
import {
  LayerContextValues,
  LayerContextHelpers,
  type LayerContextDateRange,
} from '../../types/layer_context'

type LayerContextShape = LayerContextValues & LayerContextHelpers & LayerContextDateRange

export const LayerContext = createContext<LayerContextShape | undefined>(undefined)

export const useLayerContext = () => {
  const ctx = useContext(LayerContext)
  if (!ctx) throw new Error('useLayerContext must be used within LayerProvider')
  return ctx
}
