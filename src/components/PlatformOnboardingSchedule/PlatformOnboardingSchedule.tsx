import React, { useContext } from 'react'
import { PlatformOnboardingContext } from '../../contexts/PlatformOnboardingContext'
import { Button } from '../Button'
import { Heading, HeadingSize, Text } from '../Typography'

export const PlatformOnboardingSchedule = () => {
  const { nextStep } = useContext(PlatformOnboardingContext)

  return (
    <div className='Layer__platform__onboarding__schedule-wrapper'>
      <div className='Layer__platform__onboarding__header'>
        <Heading size={HeadingSize.secondary}>
          Schedule an onboarding call with our bookkeeping team to finish your
          onboarding.
        </Heading>
        <Text>
          During this call, we’ll review all of your information, answer any
          questions you have, and then get you live on bookkeeping!
        </Text>
      </div>
      <Button onClick={nextStep}>Schedule</Button>
    </div>
  )
}
