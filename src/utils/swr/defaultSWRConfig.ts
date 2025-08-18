import type { SWRConfiguration } from 'swr'
import { compareWithStableHash } from './compareWithStableHash'

export const DEFAULT_SWR_CONFIG = {
  refreshInterval: 10 * 60 * 1000, // 10 minutes
  revalidateIfStale: true,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  compare: compareWithStableHash,
} as const satisfies SWRConfiguration
