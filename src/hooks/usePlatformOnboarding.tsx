import { useState } from 'react'

export const usePlatformOnboarding = () => {
  const [currentStep, setCurrentStep] = useState<number>(2)

  const nextStep = () => setCurrentStep(prevStep => prevStep + 1)
  const prevStep = () => setCurrentStep(prevStep => Math.max(prevStep - 1, 0))

  return {
    currentStep,
    nextStep,
    prevStep,
  }
}
