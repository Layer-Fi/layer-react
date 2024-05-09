import React, { useContext, useEffect, useState } from 'react'
import { LinkedAccountsContext } from '../../contexts/LinkedAccountsContext'
import { useLayerContext } from '../../hooks/useLayerContext'
import { LinkedAccountsProvider } from '../../providers/LinkedAccountsProvider'
import { Container } from '../Container'
import { ConnectAccount } from './ConnectAccount'

const COLLAPSED_STYLE = {
  maxHeight: 0,
  opacity: 0.2,
  transform: 'scale(0.96)',
  overflow: 'hidden',
}

const EXPANDED_STYLE = {
  maxHeight: 1000,
  opacity: 1,
  transform: 'scale(1)',
  overflow: 'hidden',
}

export interface OnboardingProps {
  onTransactionsToReviewClick?: () => void
}

export const Onboarding = (props: OnboardingProps) => (
  <LinkedAccountsProvider>
    <OnboardingContent {...props} />
  </LinkedAccountsProvider>
)

export const OnboardingContent = ({
  onTransactionsToReviewClick,
}: OnboardingProps) => {
  const { onboardingStep, setOnboardingStep } = useLayerContext()

  const [style, setStyle] = useState(
    onboardingStep ? EXPANDED_STYLE : COLLAPSED_STYLE,
  )
  const { data, loadingStatus } = useContext(LinkedAccountsContext)

  useEffect(() => {
    if (
      data &&
      data?.length === 0 &&
      loadingStatus === 'complete' &&
      !onboardingStep
    ) {
      setOnboardingStep('connectAccount')
      return
    }

    if (
      data &&
      data.length > 0 &&
      loadingStatus === 'complete' &&
      onboardingStep === 'connectAccount'
    ) {
      setOnboardingStep('complete')
    }
  }, [data, loadingStatus])

  useEffect(() => {
    if (onboardingStep && style.maxHeight !== 1000) {
      setTimeout(() => {
        setStyle(EXPANDED_STYLE)
      }, 500)
    }
  }, [onboardingStep])

  if (!onboardingStep) {
    return null
  }

  return (
    <Container name='onboarding' style={style}>
      <div className='Layer__onboarding__content'>
        <ConnectAccount
          onboardingStep={onboardingStep}
          onTransactionsToReviewClick={onTransactionsToReviewClick}
        />
      </div>
    </Container>
  )
}
