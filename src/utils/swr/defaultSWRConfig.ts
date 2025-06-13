import type { SWRConfiguration } from 'swr'

export const DEFAULT_SWR_CONFIG = {
  refreshInterval: 10 * 60 * 1000, // 10 minutes
  revalidateIfStale: true,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
} as const satisfies SWRConfiguration
