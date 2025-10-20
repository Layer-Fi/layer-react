import { useState, useMemo } from 'react'
import { LinkAccounts } from './LinkAccounts'
import { ProgressSteps } from '../ProgressSteps/ProgressSteps'
import { Button, ButtonVariant } from '../Button/Button'
import { WelcomeStep, WelcomeStepFooter } from './Steps/WelcomeStep'
import { SummaryStep } from './Steps/SummaryStep'
import { BusinessInfoStep } from './Steps/BusinessInfoStep'
import { BookOnboardingCallStep } from './Steps/BookOnboardingCallStep'
import { useBookkeepingConfiguration } from '../../hooks/useBookkeepingConfiguration'

enum PlatformOnboardingStep {
  WELCOME = 'welcome',
  BUSINESS_INFO = 'business-info',
  LINK_ACCOUNTS = 'link-accounts',
  BOOK_ONBOARDING_CALL = 'book-onboarding-call',
  SUMMARY = 'summary',
}

const ALL_PLATFORM_ONBOARDING_STEPS: { id: PlatformOnboardingStep, label: string }[] = [
  {
    id: PlatformOnboardingStep.WELCOME,
    label: 'Get started',
  },
  {
    id: PlatformOnboardingStep.BUSINESS_INFO,
    label: 'Confirm your information',
  },
  {
    id: PlatformOnboardingStep.LINK_ACCOUNTS,
    label: 'Connect accounts',
  },
  {
    id: PlatformOnboardingStep.BOOK_ONBOARDING_CALL,
    label: 'Book onboarding call',
  },
  {
    id: PlatformOnboardingStep.SUMMARY,
    label: 'Summary',
  },
] as const

type PlatformOnboardingProps = {
  onComplete?: () => void
}

export const PlatformOnboarding = ({ onComplete }: PlatformOnboardingProps) => {
  const { data: bookkeepingConfiguration } = useBookkeepingConfiguration()

  const platformOnboardingSteps = useMemo(() => {
    const hasOnboardingCallUrl = !!bookkeepingConfiguration?.onboardingCallUrl
    return ALL_PLATFORM_ONBOARDING_STEPS.filter((step) => {
      if (step.id === PlatformOnboardingStep.BOOK_ONBOARDING_CALL) {
        return hasOnboardingCallUrl
      }
      return true
    })
  }, [bookkeepingConfiguration?.onboardingCallUrl])

  const [step, setStep] = useState<PlatformOnboardingStep>(platformOnboardingSteps[0].id)

  const isFirstStep = platformOnboardingSteps[0].id === step

  const nextStep = () => {
    const currentStepIndex = platformOnboardingSteps.findIndex(s => s.id === step)
    if (currentStepIndex === platformOnboardingSteps.length - 1) {
      onComplete?.()
      return
    }

    const nextStep = platformOnboardingSteps[currentStepIndex + 1]
    if (nextStep) {
      setStep(nextStep.id)
    }
  }

  const previousStep = () => {
    const currentStepIndex = platformOnboardingSteps.findIndex(s => s.id === step)
    const previousStep = platformOnboardingSteps[currentStepIndex - 1]
    if (previousStep) {
      setStep(previousStep.id)
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case PlatformOnboardingStep.WELCOME:
        return <WelcomeStep onNext={nextStep} stepsEnabled={platformOnboardingSteps.map(s => s.id)} />
      case PlatformOnboardingStep.BUSINESS_INFO:
        return <BusinessInfoStep onNext={nextStep} />
      case PlatformOnboardingStep.LINK_ACCOUNTS:
        return <LinkAccounts onComplete={nextStep} />
      case PlatformOnboardingStep.BOOK_ONBOARDING_CALL:
        return <BookOnboardingCallStep onNext={nextStep} />
      case PlatformOnboardingStep.SUMMARY:
        return <SummaryStep onNext={nextStep} />
    }
  }

  const renderStepFooter = () => {
    if (step === PlatformOnboardingStep.WELCOME) {
      return <WelcomeStepFooter />
    }
  }

  return (
    <div className='Layer__component Layer__platform-onboarding'>
      <div className='Layer__platform-onboarding-layout'>
        {!isFirstStep && (
          <div className='Layer__platform-onboarding__back-button-container'>
            <Button
              onClick={previousStep}
              variant={ButtonVariant.secondary}
            >
              Back
            </Button>
          </div>
        )}
        <div className='Layer__platfom-onboarding-layout__box'>
          {platformOnboardingSteps.length > 1 && (
            <ProgressSteps
              steps={platformOnboardingSteps.map(step => step.label)}
              currentStep={step === PlatformOnboardingStep.SUMMARY ? platformOnboardingSteps.length : platformOnboardingSteps.findIndex(s => s.id === step)}
            />
          )}
          <div className='Layer__platform-onboarding-layout__content'>
            {renderStepContent()}
          </div>
        </div>
        <div className='Layer__platform-onboarding-layout__footer'>
          {renderStepFooter()}
        </div>
      </div>
    </div>
  )
}
