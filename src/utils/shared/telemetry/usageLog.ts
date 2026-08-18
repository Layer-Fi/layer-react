import { type ComponentUsageReport } from '@internal-types/shared/componentUsage'

/**
 * The hand-off between a tracked component and the reporter that sends its props. Components enqueue
 * at mount; the reporter mounted inside `LayerProvider` drains. Keeping the network out of the
 * component's import graph is deliberate — the wrapper sits in front of every public component, and
 * reaching the data-loading layer from there would put `effect` and the SWR machinery into the bundle
 * of a consumer who imported one small component.
 */

// Page-lifetime, so a combination is reported at most once however often its component remounts. The
// businessId is in the key because a page may mount more than one LayerProvider.
const reportedKeys = new Set<string>()

// Sampling rate per business, learned from the endpoint's own responses. Customers differ in user
// count by orders of magnitude, so the backend decides how much of a business's traffic it wants.
const sampleRatesByBusiness = new Map<string, number>()

let pending: ComponentUsageReport[] = []
const listeners = new Set<() => void>()

const toKey = ({ businessId, component, parentComponent, props }: ComponentUsageReport) =>
  [
    businessId,
    component,
    parentComponent ?? '',
    props.map(({ name, kind, booleanValue, keys }) =>
      [name, kind, booleanValue ?? '', keys?.join(',') ?? ''].join(':'),
    ).join(';'),
  ].join('|')

/** Queues a report unless this business has already reported the same combination on this page. */
export const enqueueComponentUsage = (report: ComponentUsageReport) => {
  const key = toKey(report)
  if (reportedKeys.has(key)) return

  reportedKeys.add(key)
  pending = [...pending, report]
  listeners.forEach(listener => listener())
}

/** Takes the queued reports for one business, leaving any that belong to another LayerProvider. */
export const drainComponentUsage = (businessId: string) => {
  const mine = pending.filter(report => report.businessId === businessId)
  pending = pending.filter(report => report.businessId !== businessId)
  return mine
}

export const subscribeToComponentUsage = (listener: () => void) => {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export const recordSampleRate = (businessId: string, sampleRate: number) => {
  sampleRatesByBusiness.set(businessId, sampleRate)
}

export const isWithinSample = (businessId: string) => {
  const sampleRate = sampleRatesByBusiness.get(businessId)

  // The first report of a page load always goes out — it is what teaches us the rate, and it
  // guarantees at least one observation per session even for a heavily sampled business.
  if (sampleRate === undefined) return true

  return Math.random() < sampleRate
}

export const resetUsageLog = () => {
  reportedKeys.clear()
  sampleRatesByBusiness.clear()
  pending = []
  listeners.clear()
}
