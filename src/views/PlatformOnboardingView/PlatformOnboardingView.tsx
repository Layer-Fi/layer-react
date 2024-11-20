import React, { useContext } from 'react'
import { Button, ButtonVariant } from '../../components/Button'
import { Container } from '../../components/Container'
import { OnboardingCalendar } from '../../components/OnboardingCall'
import { PlatformOnboardingForm } from '../../components/PlatformOnboardingForm'
import { PlatformOnboardingGetStarted } from '../../components/PlatformOnboardingGetStarted'
import { PlatformOnboardingGuide } from '../../components/PlatformOnboardingGuide'
import { PlatformOnboardingProgress } from '../../components/PlatformOnboardingProgress'
import { PlatformOnboardingSchedule } from '../../components/PlatformOnboardingSchedule'
import { PlatformOnboardingSummary } from '../../components/PlatformOnboardingSummary'
import { Text } from '../../components/Typography'
import { View } from '../../components/View'
import { PlatformOnboardingContext } from '../../contexts/PlatformOnboardingContext'
import { usePlatformOnboarding } from '../../hooks/usePlatformOnboarding'
import { LinkAccounts } from '../../components/LinkAccounts/LinkAccounts'

interface StringOverrides {
  header?: string
}

export interface PlatformOnboardingViewProps {
  stringOverrides?: StringOverrides
}

export const PlatformOnboardingView = (props: PlatformOnboardingViewProps) => {
  const platformOnboarding = usePlatformOnboarding()
  return (
    <PlatformOnboardingContext.Provider value={platformOnboarding}>
      <PlatformOnboarding {...props} />
    </PlatformOnboardingContext.Provider>
  )
}

const PlatformOnboarding = ({
  stringOverrides,
}: PlatformOnboardingViewProps) => {
  const { currentStep, prevStep, nextStep } = useContext(
    PlatformOnboardingContext,
  )

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <PlatformOnboardingGetStarted stringOverrides={stringOverrides} />
        )
      case 1:
        return <PlatformOnboardingForm />
      case 2:
        return <LinkAccounts onNext={nextStep} onBack={prevStep} />
      case 3:
        return <PlatformOnboardingSchedule />
      case 4:
        return <PlatformOnboardingSummary />
      default:
        return <></>
    }
  }

  return (
    <View
      viewClassName='Layer__platform__onboarding--view'
      headerControls={
        <Text>
          {stringOverrides?.header
            ? stringOverrides.header
            : 'Onboarding'}
        </Text>
      }
    >
      <div className='Layer__platform__onboarding--wrapper'>
        {currentStep > 0 && currentStep <= 4 && (
          <div className='Layer__platform__onboaring--back-button'>
            <Button variant={ButtonVariant.secondary} onClick={prevStep}>
              Back
            </Button>
          </div>
        )}
        <Container name='platform-onboarding'>
          <PlatformOnboardingProgress
            currentStep={currentStep}
            steps={[
              'Get started',
              'Confrm your information',
              'Connect accounts',
              'Schedule onboarding',
            ]}
          />
          {renderStep()}
        </Container>
      </div>
      {currentStep === 0 && <PlatformOnboardingGuide />}
      {currentStep === 3 && (
        <OnboardingCalendar
          calendarUrl='https://calendly.com/release-bookkeeping/information-call'
          onScheduled={nextStep}
        />
      )}
    </View>
  )
}
