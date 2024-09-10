import React, { useContext } from 'react'
import { PlatformOnboardingContext } from '../../contexts/PlatformOnboardingContext'
import { PlatformOnboardingViewProps } from '../../views/PlatformOnboardingView/PlatformOnboardingView'
import { Button } from '../Button'
import { Heading, Text, TextSize } from '../Typography'

export const PlatformOnboardingGetStarted = ({
  stringOverrides,
}: PlatformOnboardingViewProps) => {
  const { nextStep } = useContext(PlatformOnboardingContext)
  return (
    <div className='Layer__platform__onboarding__header'>
      <Heading>Welcome to {stringOverrides?.header}</Heading>
      <Text size={TextSize.md}>
        In this flow we’ll confirm your business information, connect your
        financial accounts, and schedule a call with a member of our bookkeeping
        onboarding team to complete your setup.
      </Text>
      <Button onClick={() => nextStep()}>Get Started</Button>
    </div>
  )
}
