import { InlineWidget as CalendlyInlineWidget, PopupModal } from 'react-calendly'
import { useSizeClass } from '../../../hooks/useWindowSize'
import { useCalendly } from '../../../hooks/useCalendly/useCalendly'
import { Button } from '../../ui/Button/Button'
import classNames from 'classnames'
import { VStack } from '../../ui/Stack/Stack'
import { Heading } from '../../ui/Typography/Heading'
import { Span } from '../../ui/Typography/Text'
import { useCallback, useState } from 'react'
import { useCreateCallBooking } from '../../../features/callBookings/api/useCreateCallBookings'
import { LoadingSpinner } from '../../ui/Loading/LoadingSpinner'
import { useBookkeepingConfiguration } from '../../../hooks/useBookkeepingConfiguration'
import { useLayerContext } from '../../../contexts/LayerContext'
import { CallBookingPurpose, CallBookingType } from '../../../schemas/callBookings'

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

const defaultTitle = 'Schedule an onboarding call with our bookkeeping team to finish your onboarding.'
const defaultDescription = 'During this call, we will review all of your information, answer any questions you have, and then get you live on bookkeeping!'

export const BookOnboardingCallStep = ({ title = defaultTitle, description = defaultDescription, onNext }: BookOnboardingCallStepProps) => {
  const { isMobile, isTablet, isDesktop } = useSizeClass()
  const { trigger: createCallBooking } = useCreateCallBooking()
  const { businessId } = useLayerContext()
  const { data: bookkeepingConfiguration } = useBookkeepingConfiguration({ businessId })

  const [state, setState] = useState(BookOnboardingCallStepState.INITIAL)
  const [externalId, setExternalId] = useState<string | null>(null)

  const calendlyUrl = bookkeepingConfiguration?.onboardingCallUrl

  const createCallBookingAndNext = useCallback(async (externalId: string, isRetrying: boolean) => {
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

    void createCallBookingAndNext(uuid, false)
  }, [createCallBookingAndNext])

  const { isCalendlyVisible, calendlyLink, openCalendly, closeCalendly } = useCalendly({
    onEventScheduled: handleEventScheduled,
  })

  const retry = useCallback(() => {
    if (!externalId) {
      console.error('No external ID provided')
      setState(BookOnboardingCallStepState.ERROR)
      return
    }

    void createCallBookingAndNext(externalId, true)
  }, [createCallBookingAndNext, externalId])

  const className = classNames('Layer__platform-onboarding__book-onboarding-call', {
    'is-mobile': isMobile,
    'is-tablet': isTablet,
    'is-desktop': isDesktop,
  })

  if (!calendlyUrl) {
    onNext()
    return null
  }

  return (
    <VStack gap='md' className={className}>
      <Heading size={isDesktop ? 'lg' : 'md'} className='Layer__platform-onboarding__heading'>{title}</Heading>
      <Span variant='subtle'>{description}</Span>
      <VStack gap='sm' className='Layer__platform-onboarding__error'>
        {state === BookOnboardingCallStepState.ERROR && (
          <>
            <Span>Your call was booked successfully, but we encountered some issues recording it on our system. Please try again.</Span>
            <Button variant='solid' style={{ width: 'fit-content' }} onClick={retry}>Retry</Button>
          </>
        )}
        {state === BookOnboardingCallStepState.RETRYING && (
          <>
            <LoadingSpinner size={16} />
            <Span>Recording your scheduled call...</Span>
          </>
        )}
      </VStack>

      {(!isDesktop && state === BookOnboardingCallStepState.INITIAL)
        && <Button variant='branded' style={{ width: 'fit-content' }} onClick={() => openCalendly(calendlyUrl)}>Book a call</Button>}

      {(isDesktop && state === BookOnboardingCallStepState.INITIAL)
        && <CalendlyInlineWidget url={calendlyUrl} className={state !== BookOnboardingCallStepState.INITIAL ? 'calendly-inline-widget-success' : 'calendly-inline-widget'} />}

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
