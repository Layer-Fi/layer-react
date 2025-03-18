import { useState } from 'react'
import { LinkAccounts } from './LinkAccounts'
import { ProgressSteps } from '../ProgressSteps/ProgressSteps'
import { Button, ButtonVariant } from '../Button/Button'
import { WelcomeStep, WelcomeStepFooter } from './Steps/WelcomeStep'
import { SummaryStep } from './Steps/SummaryStep'

const PLATFORM_ONBOARDING_STEPS = [
  {
    id: 'welcome',
    label: 'Get started',
  },
  //   {
  //     id: 'business-info',
  //     label: 'Confirm your informations',
  //   },
  {
    id: 'link-accounts',
    label: 'Connect accounts',
  },
  //   {
  //     id: 'schedule-onboarding',
  //     label: 'Schedule onboarding',
  //   },
  {
    id: 'summary',
    label: 'Summary',
    static: true,
  },
]

// const defaultEnabledSteps = ['welcome', 'link-accounts', 'summary']
const defaultEnabledSteps = ['link-accounts']

type PlatformOnboardingStepKey = typeof PLATFORM_ONBOARDING_STEPS[number]['id']

type PlatformOnboardingProps = {
  steps?: PlatformOnboardingStepKey[]
}

export const PlatformOnboarding = ({ steps = defaultEnabledSteps }: PlatformOnboardingProps) => {
  const stepsList = PLATFORM_ONBOARDING_STEPS.filter(step => steps.includes(step.id))
  const [step, setStep] = useState<PlatformOnboardingStepKey>(stepsList[0].id)

  const isFirstStep = stepsList[0].id === step

  const onOnboardingComplete = () => {
    /** @TODO - save onboarding as completed */
    alert('onboarding complete')
  }

  const nextStep = () => {
    const currentStepIndex = stepsList.findIndex(s => s.id === step)
    if (currentStepIndex === stepsList.length - 1) {
      onOnboardingComplete()
      return
    }

    const nextStep = stepsList[currentStepIndex + 1]
    if (nextStep) {
      setStep(nextStep.id)
    }
  }

  const previousStep = () => {
    const currentStepIndex = stepsList.findIndex(s => s.id === step)
    const previousStep = stepsList[currentStepIndex - 1]
    if (previousStep) {
      setStep(previousStep.id)
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 'welcome':
        return <WelcomeStep onNext={nextStep} stepsEnabled={stepsList.map(s => s.id)} />
      case 'link-accounts':
        return <LinkAccounts onComplete={nextStep} />
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
          {stepsList.length > 1 && (
            <ProgressSteps
              steps={stepsList.map(step => step.label)}
              currentStep={step === 'summary' ? stepsList.length : stepsList.findIndex(s => s.id === step)}
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
