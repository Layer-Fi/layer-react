import { useMemo } from 'react'

import { getActivationDate } from '@utils/features/business/business'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'

export const useBusinessActivationDate = () => {
  const { business } = useLayerContext()
  return useMemo(() => getActivationDate(business), [business])
}
