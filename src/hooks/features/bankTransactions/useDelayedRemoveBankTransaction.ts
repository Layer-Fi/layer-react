import { useEffect } from 'react'

const DELAY_MS = 300

type UseDelayedRemoveBankTransactionParams = {
  id: string
  isExiting: boolean
  onExitComplete: (id: string) => void
  onRemove?: () => void
}

/**
 * Removes a row once its CSS exit animation has run. The row is kept mounted (frozen
 * from its pre-categorization snapshot) while `isExiting` is true; after DELAY_MS —
 * matching the row's opacity transition — it is dropped via `onExitComplete`.
 */
export function useDelayedRemoveBankTransaction({
  id,
  isExiting,
  onExitComplete,
  onRemove,
}: UseDelayedRemoveBankTransactionParams) {
  useEffect(() => {
    if (!isExiting) return

    const timeout = setTimeout(() => {
      onExitComplete(id)
      onRemove?.()
    }, DELAY_MS)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isExiting])
}
