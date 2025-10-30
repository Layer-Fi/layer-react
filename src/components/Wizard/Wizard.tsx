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
import { VStack } from '../ui/Stack/Stack'

function useWizardStep({
  steps,
  onStepChange,
  onComplete,
}: {
  steps: ReadonlyArray<ReactNode>
  onStepChange?: (stepIndex: number) => void
  onComplete?: () => Awaitable<void>
}) {
  const stepCount = steps.length
  const [activeStepIndex, setActiveStepIndex] = useState(0)

  const goToStep = useCallback((stepIndex: number) => {
    setActiveStepIndex(stepIndex)
    onStepChange?.(stepIndex)
  }, [onStepChange])

  const next = useCallback(async () => {
    if (activeStepIndex === stepCount - 1) {
      await onComplete?.()
      return
    }

    const nextIdx = activeStepIndex + 1
    if (nextIdx <= stepCount - 1) {
      setActiveStepIndex(nextIdx)
      onStepChange?.(nextIdx)
    }
  }, [activeStepIndex, stepCount, onComplete, onStepChange])

  const previous = useCallback(() => {
    const prevIdx = activeStepIndex - 1
    if (prevIdx >= 0) {
      setActiveStepIndex(prevIdx)
      onStepChange?.(prevIdx)
    }
  }, [activeStepIndex, onStepChange])

  const effectiveStepIndex = Math.min(activeStepIndex, stepCount - 1)
  const currentStep = steps.at(effectiveStepIndex)

  return { currentStep, next, previous, goToStep }
}

const WizardContext = createContext<{
  next: () => Awaitable<void>
  previous: () => void
  goToStep: (stepIndex: number) => void
}>({
      next: async () => {},
      previous: () => {},
      goToStep: () => {},
    })

export function useWizard() {
  return useContext(WizardContext)
}

type WizardProps = PropsWithChildren<{
  Header: ReactNode
  Footer: ReactNode
  onComplete?: () => Awaitable<void>
  onStepChange?: (stepIndex: number) => void
}>

export function Wizard({
  Header,
  Footer,
  onComplete,
  onStepChange,
  children,
}: WizardProps) {
  const childrenArray = Children.toArray(children)

  const { currentStep, next, previous, goToStep } = useWizardStep({
    steps: childrenArray,
    onComplete,
    onStepChange,
  })

  const contextValue = useMemo(() => ({ next, previous, goToStep }), [next, previous, goToStep])

  return (
    <WizardContext.Provider value={contextValue}>
      <VStack gap='md'>
        {Header}
        {currentStep}
        {Footer}
      </VStack>
    </WizardContext.Provider>
  )
}
