import { describe, expect, it } from 'vitest'

import { compareWithStableHash } from '@utils/swr/compareWithStableHash'
import { DEFAULT_SWR_CONFIG } from '@utils/swr/defaultSWRConfig'

describe('DEFAULT_SWR_CONFIG', () => {
  it('refreshes every 10 minutes', () => {
    expect(DEFAULT_SWR_CONFIG.refreshInterval).toBe(10 * 60 * 1000)
  })

  it('revalidates stale data but not on focus or reconnect', () => {
    expect(DEFAULT_SWR_CONFIG.revalidateIfStale).toBe(true)
    expect(DEFAULT_SWR_CONFIG.revalidateOnFocus).toBe(false)
    expect(DEFAULT_SWR_CONFIG.revalidateOnReconnect).toBe(false)
  })

  it('compares cache values with the stable hash comparator', () => {
    expect(DEFAULT_SWR_CONFIG.compare).toBe(compareWithStableHash)
  })
})
