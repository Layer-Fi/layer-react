import type { SWRConfiguration } from 'swr'

export const DEFAULT_SWR_CONFIG = {
  refreshInterval: 0,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateIfStale: false,
} as const satisfies SWRConfiguration
