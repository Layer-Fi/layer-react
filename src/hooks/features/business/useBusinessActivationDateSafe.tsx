import { useContext, useMemo } from 'react'

import { getActivationDate } from '@utils/features/business/business'
import type { UseActivationDate } from '@providers/common/DateStore/createScopedDateStore'
import { LayerContext } from '@providers/global/LayerContext/LayerContext'

/**
 * Unlike `useBusinessActivationDate`, tolerates a missing `LayerContext` — the global date
 * store is mounted above `BusinessProvider`, so there is no business to read there.
 */
export const useBusinessActivationDateSafe: UseActivationDate = () => {
  const context = useContext(LayerContext)
  const business = context?.business

  const activationDate = useMemo(() => getActivationDate(business), [business])

  return useMemo(
    () => ({ activationDate, hasBusinessContext: context !== undefined }),
    [activationDate, context],
  )
}
