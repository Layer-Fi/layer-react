import { useMemo } from 'react'
import { useLayerContext } from '../../contexts/LayerContext/LayerContext'
import { getActivationDate } from '../../utils/business'
import { startOfDay } from 'date-fns/startOfDay'

export const useBusinessActivationDate = () => {
  const { business } = useLayerContext()
  const activationDate = useMemo(() => {
    const rawActivationDate = getActivationDate(business)
    if (!rawActivationDate) return null

    return startOfDay(rawActivationDate)
  }, [business])

  return activationDate
}
