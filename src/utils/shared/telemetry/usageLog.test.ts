import { beforeEach, describe, expect, it, vi } from 'vitest'

import { type ComponentUsageReport } from '@internal-types/shared/componentUsage'
import {
  drainComponentUsage,
  enqueueComponentUsage,
  isWithinSample,
  recordSampleRate,
  resetUsageLog,
  subscribeToComponentUsage,
} from '@utils/shared/telemetry/usageLog'

const BUSINESS_ID = 'business-one'
const OTHER_BUSINESS_ID = 'business-two'

const report = (overrides: Partial<ComponentUsageReport> = {}): ComponentUsageReport => ({
  businessId: BUSINESS_ID,
  component: 'BankTransactions',
  parentComponent: null,
  props: [{ name: 'showTitle', kind: 'boolean', booleanValue: false }],
  ...overrides,
})

describe('usageLog', () => {
  beforeEach(() => resetUsageLog())

  it('queues a report for the business that made it', () => {
    enqueueComponentUsage(report())

    expect(drainComponentUsage(BUSINESS_ID)).toEqual([report()])
  })

  it('empties the queue once drained', () => {
    enqueueComponentUsage(report())
    drainComponentUsage(BUSINESS_ID)

    expect(drainComponentUsage(BUSINESS_ID)).toEqual([])
  })

  it('keeps one business from draining another provider\'s reports', () => {
    enqueueComponentUsage(report())
    enqueueComponentUsage(report({ businessId: OTHER_BUSINESS_ID }))

    expect(drainComponentUsage(BUSINESS_ID)).toEqual([report()])
    expect(drainComponentUsage(OTHER_BUSINESS_ID)).toEqual([report({ businessId: OTHER_BUSINESS_ID })])
  })

  it('queues a repeated combination once, even after it was drained', () => {
    enqueueComponentUsage(report())
    drainComponentUsage(BUSINESS_ID)
    enqueueComponentUsage(report())

    expect(drainComponentUsage(BUSINESS_ID)).toEqual([])
  })

  it('queues the same combination separately for each business', () => {
    enqueueComponentUsage(report())
    enqueueComponentUsage(report({ businessId: OTHER_BUSINESS_ID }))

    expect(drainComponentUsage(OTHER_BUSINESS_ID)).toHaveLength(1)
  })

  it('distinguishes combinations by prop value, parent, and component', () => {
    enqueueComponentUsage(report())
    enqueueComponentUsage(report({ props: [{ name: 'showTitle', kind: 'boolean', booleanValue: true }] }))
    enqueueComponentUsage(report({ parentComponent: 'BankTransactionsWithLinkedAccounts' }))
    enqueueComponentUsage(report({ component: 'Tasks' }))

    expect(drainComponentUsage(BUSINESS_ID)).toHaveLength(4)
  })

  it('wakes subscribers when a report is queued, and stops on unsubscribe', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeToComponentUsage(listener)

    enqueueComponentUsage(report())
    expect(listener).toHaveBeenCalledTimes(1)

    unsubscribe()
    enqueueComponentUsage(report({ component: 'Tasks' }))
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('does not wake subscribers for a combination it has already queued', () => {
    const listener = vi.fn()
    subscribeToComponentUsage(listener)

    enqueueComponentUsage(report())
    enqueueComponentUsage(report())

    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('sends everything until the backend asks for a share', () => {
    expect(isWithinSample(BUSINESS_ID)).toBe(true)
  })

  it('sends nothing more once the backend asks for none of it', () => {
    recordSampleRate(BUSINESS_ID, 0)

    expect(isWithinSample(BUSINESS_ID)).toBe(false)
  })

  it('applies a rate only to the business it was learned for', () => {
    recordSampleRate(BUSINESS_ID, 0)

    expect(isWithinSample(OTHER_BUSINESS_ID)).toBe(true)
  })
})
