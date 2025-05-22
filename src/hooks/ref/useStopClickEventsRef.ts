import { useCallback, useRef, type RefCallback } from 'react'

const noOp = () => {}

function useEffectRef<E extends HTMLElement = HTMLElement>(callback: RefCallback<E>) {
  const disposeRef = useRef<(() => void)>(noOp)

  return useCallback(
    (element: E | null) => {
      disposeRef.current()
      disposeRef.current = noOp

      if (element) {
        const dispose = callback(element)

        if (typeof dispose === 'function') {
          disposeRef.current = dispose
        }
      }
    },
    [callback],
  )
}

function stopClickEvent(event: Event) {
  event.preventDefault()
}

function addClickEventListeners(element: HTMLElement) {
  element.addEventListener('click', stopClickEvent)
  element.addEventListener('mousedown', stopClickEvent)
  element.addEventListener('mouseup', stopClickEvent)

  return () => {
    element.removeEventListener('click', stopClickEvent)
    element.removeEventListener('mousedown', stopClickEvent)
    element.removeEventListener('mouseup', stopClickEvent)
  }
}

export function useStopClickEventsRefCallback() {
  return useEffectRef(addClickEventListeners)
}
