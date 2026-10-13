import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'

import { LayerEventComponent, LayerEventType } from '@schemas/common/layerEvents'
import { useEmitLayerEvent } from '@hooks/utils/events/useEmitLayerEvent'
import { COLLAPSE_EXIT_MS } from '@components/utility/AnimatedPresenceElement/variants'

const PAUSE_BEFORE_OPEN_MS = 200

type UseTasksListItemOpenStateProps = {
  taskId: string
  defaultOpen: boolean
  onExpandTask?: (isOpen: boolean) => void
}

export const useTasksListItemOpenState = ({ taskId, defaultOpen, onExpandTask }: UseTasksListItemOpenStateProps) => {
  const emitLayerEvent = useEmitLayerEvent(LayerEventComponent.Tasks)
  const shouldReduceMotion = useReducedMotion()
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const wasDefaultOpen = useRef(defaultOpen)
  const pendingOpen = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelPendingOpen = useCallback(() => {
    if (pendingOpen.current !== null) clearTimeout(pendingOpen.current)
    pendingOpen.current = null
  }, [])

  useEffect(() => {
    const becameDefault = defaultOpen && !wasDefaultOpen.current
    wasDefaultOpen.current = defaultOpen

    if (!defaultOpen) {
      setIsOpen(false)
      return
    }
    if (!becameDefault) return
    if (shouldReduceMotion) {
      setIsOpen(true)
      return
    }

    // Waits for the completed row above to finish collapsing, then pauses, so the list never moves twice at once.
    pendingOpen.current = setTimeout(() => setIsOpen(true), COLLAPSE_EXIT_MS + PAUSE_BEFORE_OPEN_MS)
    return cancelPendingOpen
  }, [cancelPendingOpen, defaultOpen, shouldReduceMotion])

  const toggle = useCallback(() => {
    emitLayerEvent({
      type: LayerEventType.TaskClicked,
      version: 1,
      payload: { taskId },
    })
    cancelPendingOpen()
    setIsOpen(!isOpen)
    onExpandTask?.(!isOpen)
  }, [cancelPendingOpen, emitLayerEvent, isOpen, onExpandTask, taskId])

  const close = useCallback(() => {
    cancelPendingOpen()
    setIsOpen(false)
  }, [cancelPendingOpen])

  return useMemo(() => ({ isOpen, toggle, close }), [close, isOpen, toggle])
}
