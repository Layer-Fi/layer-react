import { useMemo } from 'react'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { getActivationDate } from '@utils/business'

export const useBusinessActivationDate = () => {
  const { business } = useLayerContext()
  return useMemo(() => getActivationDate(business), [business])
}
