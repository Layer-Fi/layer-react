import { useCallback, useEffect, useMemo, useState } from 'react'
import { useReducedMotionConfig } from 'motion/react'

import { LayerEventComponent, LayerEventType } from '@schemas/common/layerEvents'
import { useDelayedValue } from '@hooks/utils/debouncing/useDelayedValue'
import { useEmitLayerEvent } from '@hooks/utils/events/useEmitLayerEvent'
import { COLLAPSE_EXIT_MS } from '@components/utility/AnimatedPresenceElement/variants'

// Waits for the completed row above to finish collapsing, then pauses, so the list never moves twice at once.
const DEFAULT_OPEN_DELAY_MS = COLLAPSE_EXIT_MS + 200

type UseTasksListItemOpenStateProps = {
  taskId: string
  defaultOpen: boolean
  onExpandTask?: (isOpen: boolean) => void
}

export const useTasksListItemOpenState = ({ taskId, defaultOpen, onExpandTask }: UseTasksListItemOpenStateProps) => {
  const emitLayerEvent = useEmitLayerEvent(LayerEventComponent.Tasks)
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const shouldReduceMotion = useReducedMotionConfig()
  const delayedDefaultOpen = useDelayedValue(defaultOpen, shouldReduceMotion ? 0 : DEFAULT_OPEN_DELAY_MS)

  useEffect(() => {
    setIsOpen(delayedDefaultOpen)
  }, [delayedDefaultOpen])

  const toggle = useCallback(() => {
    emitLayerEvent({
      type: LayerEventType.TaskClicked,
      version: 1,
      payload: { taskId },
    })
    setIsOpen(!isOpen)
    onExpandTask?.(!isOpen)
  }, [emitLayerEvent, isOpen, onExpandTask, taskId])

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  return useMemo(() => ({ isOpen, toggle, open, close }), [open, close, isOpen, toggle])
}
