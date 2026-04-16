import { useEffect, useMemo, useState } from 'react'

export function useElapsedSeconds(startedAt: Date | null | undefined): number {
  const [now, setNow] = useState(() => Date.now())
  const startedAtMs = startedAt?.getTime()

  useEffect(() => {
    if (startedAtMs === undefined) {
      return
    }

    setNow(Date.now())

    const intervalId = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [startedAtMs])

  return useMemo(() => {
    if (startedAtMs === undefined) {
      return 0
    }

    return Math.max(0, Math.floor((now - startedAtMs) / 1000))
  }, [now, startedAtMs])
}
