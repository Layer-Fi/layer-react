import { useEffect, useRef, useState } from 'react'

export function useDelayedVisibility({
  delay,
  initialVisibility = false,
}: {
  delay: number
  initialVisibility?: boolean
}) {
  const delayValueRef = useRef(delay)
  const [isVisible, setIsVisible] = useState(initialVisibility)

  useEffect(
    () => {
      const timer = setTimeout(
        () => { setIsVisible(true) },
        delayValueRef.current,
      )

      return () => clearTimeout(timer)
    },
    [],
  )

  return { isVisible }
}
