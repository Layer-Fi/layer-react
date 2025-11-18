import { useMemo } from 'react'

import { getActivationDate } from '@utils/business'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const useBusinessActivationDate = () => {
  const { business } = useLayerContext()
  return useMemo(() => getActivationDate(business), [business])
}
