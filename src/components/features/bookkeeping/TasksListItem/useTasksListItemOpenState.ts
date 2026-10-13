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

  // Waits for the completed row above to finish collapsing, so the list never moves twice at once.
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
