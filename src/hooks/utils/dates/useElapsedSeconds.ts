import { useEffect, useMemo, useState } from 'react'

export function useElapsedSeconds(startedAt: Date | null | undefined): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!startedAt) {
      return
    }

    setNow(Date.now())

    const intervalId = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [startedAt])

  return useMemo(() => {
    if (!startedAt) {
      return 0
    }

    return Math.max(0, Math.floor((now - startedAt.getTime()) / 1000))
  }, [now, startedAt])
}
