import { useCallback, useEffect, useMemo, useState } from 'react'

import { LayerEventComponent, LayerEventType } from '@schemas/common/layerEvents'
import { useEmitLayerEvent } from '@hooks/utils/events/useEmitLayerEvent'

type UseTasksListItemOpenStateProps = {
  taskId: string
  defaultOpen: boolean
  onExpandTask?: (isOpen: boolean) => void
}

export const useTasksListItemOpenState = ({ taskId, defaultOpen, onExpandTask }: UseTasksListItemOpenStateProps) => {
  const emitLayerEvent = useEmitLayerEvent(LayerEventComponent.Tasks)
  const [isOpen, setIsOpen] = useState(defaultOpen)

  useEffect(() => {
    setIsOpen(defaultOpen)
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
