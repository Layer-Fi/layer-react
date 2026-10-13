import { useCallback, useEffect, useMemo, useState } from 'react'

import { LayerEventComponent, LayerEventType } from '@schemas/common/layerEvents'
import { useEmitLayerEvent } from '@hooks/utils/events/useEmitLayerEvent'
import { COLLAPSE_EXIT_MS } from '@components/utility/AnimatedPresenceElement/variants'

type UseTasksListItemOpenStateProps = {
  taskId: string
  defaultOpen: boolean
  onExpandTask?: (isOpen: boolean) => void
}

export const useTasksListItemOpenState = ({ taskId, defaultOpen, onExpandTask }: UseTasksListItemOpenStateProps) => {
  const emitLayerEvent = useEmitLayerEvent(LayerEventComponent.Tasks)
  const [isOpen, setIsOpen] = useState(defaultOpen)

  // A task becomes the default once the one above it completes; opening it only after that row
  // finishes collapsing keeps the two from moving the list at the same time.
  useEffect(() => {
    if (!defaultOpen) {
      setIsOpen(false)
      return
    }

    const timeout = setTimeout(() => setIsOpen(true), COLLAPSE_EXIT_MS)
    return () => clearTimeout(timeout)
  }, [defaultOpen])

  const toggle = useCallback(() => {
    emitLayerEvent({
      type: LayerEventType.TaskClicked,
      version: 1,
      payload: { taskId },
    })
    setIsOpen(!isOpen)
    onExpandTask?.(!isOpen)
  }, [emitLayerEvent, isOpen, onExpandTask, taskId])

  const close = useCallback(() => setIsOpen(false), [])

  return useMemo(() => ({ isOpen, toggle, close }), [close, isOpen, toggle])
}
