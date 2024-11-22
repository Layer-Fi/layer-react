import { useState } from 'react'
import { FormDataTypes } from '../components/PlatformOnboardingForm/types'

export const usePlatformOnboarding = () => {
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [formData, setFormData] = useState<Partial<FormDataTypes>>({})

  const nextStep = () => setCurrentStep(prevStep => prevStep + 1)
  const prevStep = () => setCurrentStep(prevStep => Math.max(prevStep - 1, 0))

  return {
    currentStep,
    nextStep,
    prevStep,
    formData,
    setFormData,
  }
}
