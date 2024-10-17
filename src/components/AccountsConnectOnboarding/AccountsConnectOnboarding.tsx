import React from 'react'
import { Container } from '../Container'

export interface AccountsConnectOnboardingProps {
  onAllFinishedClick?: () => void
}

export const AccountsConnectOnboarding = ({
  onAllFinishedClick,
}: AccountsConnectOnboardingProps) => {
  return (
    <Container name='AccountsConnectOnboarding'>
      <div className='Layer__onboarding_connections__content'>
        <Text size={TextSize.lg} weight={TextWeight.bold}>
          Let’s connect the bank accounts and credit cards you use for your
          business.
        </Text>
      </div>
    </Container>
  )
}
