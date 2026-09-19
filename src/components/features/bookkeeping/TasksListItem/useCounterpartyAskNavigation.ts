import { useCallback, useMemo, useState } from 'react'

import { type SlidingPanesDirection } from '@components/utility/SlidingPanes/SlidingPanes'

export type CounterpartyAskView = 'picker' | 'freeText' | 'itemised' | 'remember'

type NavigationState = {
  view: CounterpartyAskView
  history: CounterpartyAskView[]
  direction: SlidingPanesDirection
}

const AT_PICKER: NavigationState = { view: 'picker', history: [], direction: 'back' }

/** Back returns to wherever the current pane was entered from, so the remember step unwinds to the itemised sheet when it came from there. */
export const useCounterpartyAskNavigation = () => {
  const [{ view, history, direction }, setState] = useState<NavigationState>(AT_PICKER)

  const goForward = useCallback((next: CounterpartyAskView) => {
    setState(current => ({ view: next, history: [...current.history, current.view], direction: 'forward' }))
  }, [])

  const goBack = useCallback(() => {
    setState((current) => {
      const previous = current.history.at(-1) ?? 'picker'

      return { view: previous, history: current.history.slice(0, -1), direction: 'back' }
    })
  }, [])

  const returnToPicker = useCallback(() => setState(AT_PICKER), [])

  return useMemo(() => ({
    view,
    direction,
    canGoBack: history.length > 0,
    goForward,
    goBack,
    returnToPicker,
  }), [direction, goBack, goForward, history.length, returnToPicker, view])
}
