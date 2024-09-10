import React, { useContext } from 'react'
import { PlatformOnboardingContext } from '../../contexts/PlatformOnboardingContext'
import Link from '../../icons/Link'
import PlaidIcon from '../../icons/PlaidIcon'
import { Button } from '../Button'
import { Heading, HeadingSize, TextSize, Text } from '../Typography'

export const PlatformOnboardingAccounts = () => {
  const { nextStep } = useContext(PlatformOnboardingContext)
  return (
    <div className='Layer__platform__onboarding__accounts-wrapper'>
      <div className='Layer__platform__onboarding__header'>
        <Heading size={HeadingSize.secondary}>
          Let’s connect the bank accounts and credit cards you use for your
          business.
        </Heading>
      </div>
      <div className='Layer__platform__onboarding__connect-accounts'>
        <div className='Layer__platform__onboarding__connect-account-icon'>
          <PlaidIcon />
        </div>
        <div className='Layer__platform__onboarding__connect-account-content'>
          <Text as='h2'>Connect accounts</Text>
          <Text size={TextSize.sm}>
            Import data with one simple integration.
          </Text>
        </div>
        <div className='Layer__platform__onboarding__connect-account-button'>
          <Button onClick={nextStep} rightIcon={<Link size={12} />}>
            Connect
          </Button>
        </div>
      </div>
    </div>
  )
}
