import { useState } from 'react'
import { useLayerContext } from '../contexts/LayerContext'
import { useEnvironment } from '../providers/Environment/EnvironmentInputProvider'
import { useAuth } from './useAuth'
import { Layer } from '../api/layer'
import useSWR from 'swr'
import { Vendor } from '../types/vendors'
import { VENDORS_MOCK } from './useVendorsMOCK'

type UseVendors = () => {
  data: Vendor[]
}

export const useVendors: UseVendors = () => {
  /**
   * @TODO Uncomment when API is ready
   */
  // const queryKey =
  //   businessId
  //   && auth?.access_token
  //   && `vendors-${businessId}`

  // const { data, isLoading, isValidating, error, mutate } = useSWR(
  //   queryKey,
  //   Layer.getVendors(apiUrl, auth?.access_token, {
  //     params: {
  //       businessId,
  //     },
  //   }),
  // )

  const data: Vendor[] = VENDORS_MOCK

  return { data }
}
