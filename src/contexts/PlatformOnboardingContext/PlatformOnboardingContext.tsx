import { createContext } from 'react'
import { usePlatformOnboarding } from '../../hooks/usePlatformOnboarding'

export type PlatformOnboardingContextType = ReturnType<
  typeof usePlatformOnboarding
>
export const PlatformOnboardingContext =
  createContext<PlatformOnboardingContextType>({
    currentStep: 0,
    formData: {},
    nextStep: () => {},
    prevStep: () => {},
    updateFormData: () => {},
  })
