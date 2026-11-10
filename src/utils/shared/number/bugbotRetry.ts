// Temporary file for testing Layer Bugbot. This PR will be closed, not merged.

export async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(url)
    if (res.ok) return res
  }
  return fetch(url)
}

export function averageCents(values: number[]): number {
  if (values.length === 0) return 0
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length)
}
