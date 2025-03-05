import {
  Children,
  type PropsWithChildren,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import type { Awaitable } from '../../types/utility/promises'

function useWizardStep({
  steps,
  onComplete,
}: {
  steps: ReadonlyArray<ReactNode>
  onComplete?: () => Awaitable<void>
}) {
  const stepCount = steps.length
  const [activeStepIndex, setActiveStepIndex] = useState(0)

  const next = useCallback(async () => {
    setActiveStepIndex(stepIndex => Math.min(stepIndex + 1, stepCount - 1))

    if (activeStepIndex === stepCount - 1 && onComplete) {
      await onComplete?.()
    }
  }, [stepCount, activeStepIndex, onComplete])

  const previous = useCallback(() => setActiveStepIndex(stepIndex => Math.max(stepIndex - 1, 0)), [])

  const effectiveStepIndex = Math.min(activeStepIndex, stepCount - 1)
  const currentStep = steps.at(effectiveStepIndex)

  return { currentStep, next, previous }
}

const WizardContext = createContext({
  next: (() => {}) as () => Promise<void>,
  previous: () => {},
})

export function useWizard() {
  return useContext(WizardContext)
}

type WizardProps = PropsWithChildren<{
  Header: ReactNode
  Footer: ReactNode
  onComplete?: () => Awaitable<void>
}>

export function Wizard({
  Header,
  Footer,
  onComplete,
  children,
}: WizardProps) {
  const childrenArray = Children.toArray(children)

  const { currentStep, next, previous } = useWizardStep({
    steps: childrenArray,
    onComplete,
  })

  const value = useMemo(() => ({ next, previous }), [next, previous])

  return (
    <WizardContext.Provider value={value}>
      {Header}
      {currentStep}
      {Footer}
    </WizardContext.Provider>
  )
}
