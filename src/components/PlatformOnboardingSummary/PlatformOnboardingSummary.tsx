import React from 'react'
import { Link } from '../Button'
import { Heading, HeadingSize, Text } from '../Typography'

export const PlatformOnboardingSummary = () => {
  return (
    <div className='Layer__platform__onboarding__schedule-wrapper'>
      <div className='Layer__platform__onboarding__header'>
        <Heading size={HeadingSize.secondary}>You’re all set!</Heading>
        <Text>
          Ahead of your onboarding call, you can start checking out your
          business data from within your bookkeeping dashboard.
        </Text>
      </div>
      <Link target='_self' href='/'>
        Go to dashboard
      </Link>
    </div>
  )
}
