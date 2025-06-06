import { useContext, useEffect, useState } from 'react'
import { useLayerContext } from '../../contexts/LayerContext'
import { LinkedAccountsContext } from '../../contexts/LinkedAccountsContext'
import { LinkedAccountsProvider } from '../../providers/LinkedAccountsProvider'
import { OnboardingStep } from '../../types/layer_context'
import { Container } from '../Container'
import { ConnectAccount } from './ConnectAccount'
import { AccountConfirmationStoreProvider } from '../../providers/AccountConfirmationStoreProvider'

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
  onboardingStepOverride?: OnboardingStep
}

export const Onboarding = (props: OnboardingProps) => (
  <AccountConfirmationStoreProvider>
    <LinkedAccountsProvider>
      <OnboardingContent {...props} />
    </LinkedAccountsProvider>
  </AccountConfirmationStoreProvider>
)

export const OnboardingContent = ({
  onTransactionsToReviewClick,
  onboardingStepOverride = undefined,
}: OnboardingProps) => {
  const { onboardingStep, setOnboardingStep } = useLayerContext()

  useEffect(() => {
    setOnboardingStep(onboardingStepOverride)
  }, [onboardingStepOverride])

  const [style, setStyle] = useState(
    onboardingStep ? EXPANDED_STYLE : COLLAPSED_STYLE,
  )
  const { data, loadingStatus } = useContext(LinkedAccountsContext)

  useEffect(() => {
    if (
      data
      && data?.length === 0
      && loadingStatus === 'complete'
      && !onboardingStep
    ) {
      setOnboardingStep('connectAccount')
      return
    }

    if (
      data
      && data.length > 0
      && loadingStatus === 'complete'
      && onboardingStep === 'connectAccount'
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
