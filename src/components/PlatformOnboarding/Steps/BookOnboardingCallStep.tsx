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

const defaultTitle = 'Schedule an onboarding call with our bookkeeping team to finish your onboarding.'
const defaultDescription = 'During this call, we will review all of your information, answer any questions you have, and then get you live on bookkeeping!'

const CALENDLY_URL = 'https://calendly.com/darren-layerfi/30min'

export const BookOnboardingCallStep = ({ title = defaultTitle, description = defaultDescription, onNext }: BookOnboardingCallStepProps) => {
  const { isMobile, isTablet, isDesktop } = useSizeClass()
  const { trigger: createCallBooking } = useCreateCallBooking()
  const [error, setError] = useState(false)

  const handleEventScheduled = useCallback((payload?: CalendlyPayload) => {
    setError(false)
    if (!payload?.event?.uri) {
      console.error('No event URI provided from Calendly')
      setError(true)
      return
    }

    const uuid = payload.event.uri.split('/').pop()
    if (!uuid) {
      console.error('No UUID provided from Calendly')
      setError(true)
      return
    }

    // Use void operator to explicitly discard the promise
    void (async () => {
      try {
        await createCallBooking({
          external_id: uuid,
          purpose: CallBookingPurpose.BOOKKEEPING_ONBOARDING,
          call_type: CallBookingType.GOOGLE_MEET,
        })

        onNext()
      }
      catch (error) {
        console.error('Failed to create call booking:', error)
        // Still proceed to next step even if API call fails
        onNext()
      }
    })()
  }, [createCallBooking, onNext])

  const { isCalendlyVisible, calendlyLink, openCalendly, closeCalendly } = useCalendly({
    onEventScheduled: handleEventScheduled,
  })

  const className = classNames('Layer__platform-onboarding__book-onboarding-call', {
    'is-mobile': isMobile,
    'is-tablet': isTablet,
    'is-desktop': isDesktop,
  })

  return (
    <VStack gap='md' className={className}>
      <Heading size={isDesktop ? 'lg' : 'md'} className='Layer__platform-onboarding__heading'>{title}</Heading>
      <Span variant='subtle'>{description}</Span>
      {error && <Span>There was an error booking your call. Please try again.</Span>}
      {isMobile || isTablet
        ? <Button variant='branded' style={{ width: 'fit-content' }} onClick={() => openCalendly(CALENDLY_URL)}>Book a call</Button>
        : <CalendlyInlineWidget url={CALENDLY_URL} />}

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
