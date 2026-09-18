import { useEffect, useState } from 'react'

const DEFAULT_INTERVAL_MS = 5 * 60 * 1000

export function usePeriodicNow(intervalMs: number = DEFAULT_INTERVAL_MS): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date())
    }, intervalMs)

    return () => window.clearInterval(intervalId)
  }, [intervalMs])

  return now
}
