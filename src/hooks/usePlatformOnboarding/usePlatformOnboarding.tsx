import { useState } from 'react'
import { BaseSelectOption } from '../../types/general'

export interface FormDataTypes {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  dba?: string
  country: string
  entity?: BaseSelectOption
  state?: BaseSelectOption
  taxId: string
}

export const usePlatformOnboarding = () => {
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [formData, setFormData] = useState<Record<string, any>>({})

  const nextStep = () => setCurrentStep(prevStep => prevStep + 1)
  const prevStep = () => setCurrentStep(prevStep => Math.max(prevStep - 1, 0))
  const updateFormData = (
    fieldName: string,
    value: string | BaseSelectOption | undefined,
  ) => {
    setFormData(prevFormData => ({ ...prevFormData, [fieldName]: value }))
  }

  return {
    currentStep,
    formData,
    nextStep,
    prevStep,
    updateFormData,
  }
}
