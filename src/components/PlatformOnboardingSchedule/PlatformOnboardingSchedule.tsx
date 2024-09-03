import React from 'react'
import { Heading, HeadingSize, Text } from '../Typography'

export const PlatformOnboardingSchedule = () => {
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
    </div>
  )
}
