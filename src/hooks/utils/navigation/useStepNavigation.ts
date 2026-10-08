import { useCallback, useMemo, useState } from 'react'

export type StepDirection = 'forward' | 'back'

type StepNavigationState<View> = {
  view: View
  history: ReadonlyArray<View>
  direction: StepDirection
}

/** Back returns to wherever the current step was entered from, not to a fixed previous step. */
export const useStepNavigation = <View>(initialView: View) => {
  const [{ view, history, direction }, setState] = useState<StepNavigationState<View>>(
    { view: initialView, history: [], direction: 'back' },
  )

  const goForward = useCallback((next: View) => {
    setState(current => ({ view: next, history: [...current.history, current.view], direction: 'forward' }))
  }, [])

  const goBack = useCallback(() => {
    setState((current) => {
      const previous = current.history.at(-1)

      return previous === undefined
        ? current
        : { view: previous, history: current.history.slice(0, -1), direction: 'back' }
    })
  }, [])

  const goTo = useCallback((next: View, nextHistory: ReadonlyArray<View>) => {
    setState({ view: next, history: nextHistory, direction: 'back' })
  }, [])

  const reset = useCallback(() => setState({ view: initialView, history: [], direction: 'back' }), [initialView])

  return useMemo(() => ({
    view,
    history,
    direction,
    canGoBack: history.length > 0,
    goForward,
    goBack,
    goTo,
    reset,
  }), [direction, goBack, goForward, goTo, history, reset, view])
}
