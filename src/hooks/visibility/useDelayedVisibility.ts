import { useEffect, useState } from 'react'

export function useDelayedVisibility({
  delay,
  initialVisibility = false,
}: {
  delay: number
  initialVisibility?: boolean
}) {
  const [isVisible, setIsVisible] = useState(initialVisibility)

  useEffect(
    () => {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, delay)

      return () => clearTimeout(timer)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Intentionally run exactly once
    [],
  )

  return { isVisible }
}
