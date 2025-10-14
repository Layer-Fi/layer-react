import { useState } from 'react'
import { LinkAccounts } from './LinkAccounts'
import { ProgressSteps } from '../ProgressSteps/ProgressSteps'
import { Button, ButtonVariant } from '../Button/Button'
import { WelcomeStep, WelcomeStepFooter } from './Steps/WelcomeStep'
import { SummaryStep } from './Steps/SummaryStep'
import { BusinessInfoStep } from './Steps/BusinessInfoStep'
import { BookOnboardingCallStep } from './Steps/BookOnboardingCallStep'

const PLATFORM_ONBOARDING_STEPS = [
  {
    id: 'welcome',
    label: 'Get started',
  },
  {
    id: 'business-info',
    label: 'Confirm your information',
  },
  {
    id: 'link-accounts',
    label: 'Connect accounts',
  },
  {
    id: 'book-onboarding-call',
    label: 'Book onboarding call',
  },
  {
    id: 'summary',
    label: 'Summary',
  },
]

type PlatformOnboardingStepKey = typeof PLATFORM_ONBOARDING_STEPS[number]['id']

type PlatformOnboardingProps = {
  onComplete?: () => void
}

export const PlatformOnboarding = ({ onComplete }: PlatformOnboardingProps) => {
  const [step, setStep] = useState<PlatformOnboardingStepKey>(PLATFORM_ONBOARDING_STEPS[3].id)

  const isFirstStep = PLATFORM_ONBOARDING_STEPS[0].id === step

  const nextStep = () => {
    const currentStepIndex = PLATFORM_ONBOARDING_STEPS.findIndex(s => s.id === step)
    if (currentStepIndex === PLATFORM_ONBOARDING_STEPS.length - 1) {
      onComplete?.()
      return
    }

    const nextStep = PLATFORM_ONBOARDING_STEPS[currentStepIndex + 1]
    if (nextStep) {
      setStep(nextStep.id)
    }
  }

  const previousStep = () => {
    const currentStepIndex = PLATFORM_ONBOARDING_STEPS.findIndex(s => s.id === step)
    const previousStep = PLATFORM_ONBOARDING_STEPS[currentStepIndex - 1]
    if (previousStep) {
      setStep(previousStep.id)
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 'welcome':
        return <WelcomeStep onNext={nextStep} stepsEnabled={PLATFORM_ONBOARDING_STEPS.map(s => s.id)} />
      case 'business-info':
        return <BusinessInfoStep onNext={nextStep} />
      case 'link-accounts':
        return <LinkAccounts onComplete={nextStep} />
      case 'book-onboarding-call':
        return <BookOnboardingCallStep onNext={nextStep} />
      case 'summary':
        return <SummaryStep onNext={nextStep} />
    }
  }

  const renderStepFooter = () => {
    if (step === 'welcome') {
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
          {PLATFORM_ONBOARDING_STEPS.length > 1 && (
            <ProgressSteps
              steps={PLATFORM_ONBOARDING_STEPS.map(step => step.label)}
              currentStep={step === 'summary' ? PLATFORM_ONBOARDING_STEPS.length : PLATFORM_ONBOARDING_STEPS.findIndex(s => s.id === step)}
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
