// Page-lifetime record of what has already been reported, so a prop combination is sent at most once
// however often its component remounts.
const attemptedSignatures = new Set<string>()

// Sampling rate per business, learned from the endpoint's own responses. Customers differ in user
// count by orders of magnitude, so the backend — which can see the volume — decides how much of a
// business's traffic it wants, and the client honours it without needing a release.
const sampleRatesByBusiness = new Map<string, number>()

export const hasAttempted = (signature: string) => attemptedSignatures.has(signature)

export const markAttempted = (signature: string) => {
  attemptedSignatures.add(signature)
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
  attemptedSignatures.clear()
  sampleRatesByBusiness.clear()
}
