import { Heading } from '@ui/Typography/Heading'
import { Button } from '@ui/Button/Button'
import { InlineWidget as CalendlyInlineWidget, PopupModal } from 'react-calendly'
import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { useCalendly } from '@hooks/useCalendly/useCalendly'
import classNames from 'classnames'
import { VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { useCallback, useState } from 'react'
import { useCreateCallBooking } from '@features/callBookings/api/useCreateCallBookings'
import { useBookkeepingConfiguration } from '@hooks/useBookkeepingConfiguration/useBookkeepingConfiguration'
import { CallBookingPurpose, CallBookingType } from '@schemas/callBookings'
import './bookOnboardingCallStep.scss'

interface CalendlyPayload {
  event: {
    uri: string
  }
  invitee: {
    uri: string
  }
}

type BookOnboardingCallStepProps = {
  onNext: () => void
  title?: string
  description?: string
  stepsEnabled?: string[]
}

enum BookOnboardingCallStepState {
  INITIAL = 'initial',
  ERROR = 'error',
  RECORDING = 'recording',
  RETRYING = 'retrying',
  SUCCESS = 'success',
}

const defaultTitle = 'Schedule an onboarding call with our bookkeeping team to finish your onboarding'
const defaultDescription = 'During this call we will review your information, answer any questions you have, then get you live on bookkeeping.'

export const BookOnboardingCallStep = ({ title = defaultTitle, description = defaultDescription, onNext }: BookOnboardingCallStepProps) => {
  const { isMobile, isTablet, isDesktop } = useSizeClass()
  const { trigger: createCallBooking } = useCreateCallBooking()
  const { data: bookkeepingConfiguration } = useBookkeepingConfiguration()

  const [state, setState] = useState(BookOnboardingCallStepState.INITIAL)
  const [externalId, setExternalId] = useState<string | null>(null)

  const calendlyUrl = bookkeepingConfiguration?.onboardingCallUrl

  const createCallBookingAndGoToNextStep = useCallback(async (externalId: string, isRetrying: boolean) => {
    setState(isRetrying ? BookOnboardingCallStepState.RETRYING : BookOnboardingCallStepState.RECORDING)

    await createCallBooking({ external_id: externalId, purpose: CallBookingPurpose.BOOKKEEPING_ONBOARDING, call_type: CallBookingType.GOOGLE_MEET })
      .then(() => onNext())
      .catch((error) => {
        setState(BookOnboardingCallStepState.ERROR)
        console.error('Failed to create call booking.', error)
      })
  }, [createCallBooking, onNext])

  const handleEventScheduled = useCallback((payload?: CalendlyPayload) => {
    setState(BookOnboardingCallStepState.RECORDING)
    if (!payload?.event?.uri) {
      console.error('No event URI provided from Calendly')
      setState(BookOnboardingCallStepState.ERROR)
      return
    }

    const uuid = payload.event.uri.split('/').pop()
    setExternalId(uuid ?? null)
    if (!uuid) {
      console.error('No UUID provided from Calendly')
      setState(BookOnboardingCallStepState.ERROR)
      return
    }

    void createCallBookingAndGoToNextStep(uuid, false)
  }, [createCallBookingAndGoToNextStep])

  const { isCalendlyVisible, calendlyLink, openCalendly, closeCalendly } = useCalendly({
    onEventScheduled: handleEventScheduled,
  })

  const retry = useCallback(() => {
    if (!externalId) {
      console.error('No external ID provided')
      setState(BookOnboardingCallStepState.ERROR)
      return
    }

    void createCallBookingAndGoToNextStep(externalId, true)
  }, [createCallBookingAndGoToNextStep, externalId])

  const className = classNames('Layer__platform-onboarding__book-onboarding-call', {
    'is-mobile': isMobile,
    'is-tablet': isTablet,
    'is-desktop': isDesktop,
  })

  if (!calendlyUrl) {
    onNext()
    return null
  }

  const calendlyWidgetClassName = classNames('Layer__calendly-inline-widget', {
    'Layer__calendly-inline-widget--success': state !== BookOnboardingCallStepState.INITIAL,
  })

  return (
    <VStack gap='md' className={className}>
      <Heading size={isDesktop ? 'lg' : 'md'} className='Layer__platform-onboarding__heading'>{title}</Heading>
      <Span variant='subtle'>{description}</Span>
      {(state === BookOnboardingCallStepState.ERROR || state === BookOnboardingCallStepState.RETRYING)
        && (
          <VStack
            gap='sm'
            className='Layer__platform-onboarding__error'
          >
            <Span>Your call was booked successfully, but we encountered some issues recording it on our system. Please try again.</Span>
            <Button variant='solid' style={{ width: 'fit-content' }} onClick={retry}>Retry</Button>
          </VStack>
        )}
      {(!isDesktop && state === BookOnboardingCallStepState.INITIAL)
        && <Button variant='branded' style={{ width: 'fit-content' }} onClick={() => openCalendly(calendlyUrl)}>Book a call</Button>}

      {(isDesktop && state === BookOnboardingCallStepState.INITIAL)
        && (
          <CalendlyInlineWidget
            url={calendlyUrl}
            className={calendlyWidgetClassName}
          />
        )}

      {isCalendlyVisible && (
        <PopupModal
          url={calendlyLink}
          onModalClose={closeCalendly}
          open={isCalendlyVisible}
          rootElement={document.body}
          LoadingSpinner={() => <></>}
        />
      )}

    </VStack>
  )
}
