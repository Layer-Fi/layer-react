import { useCallback, useEffect } from 'react'
import { InlineWidget } from 'react-calendly'
import { useTranslation } from 'react-i18next'

import { CallBookingPurpose, CallBookingType } from '@schemas/callBooking'
import { useCreateCallBooking } from '@hooks/api/businesses/[business-id]/call-bookings/useCreateCallBooking'
import {
  type CalendlyPayload,
  createCalendlyMessageHandler,
} from '@hooks/features/calendly/useCalendly'
import { VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { Container } from '@components/Container/Container'

import './embeddedOnboarding.scss'

export interface EmbeddedOnboardingProps {
  onboardingCallUrl: string
  onEventScheduled?: () => void
}

export const EmbeddedOnboarding = ({ onboardingCallUrl, onEventScheduled }: EmbeddedOnboardingProps) => {
  const { t } = useTranslation()

  const { trigger: createCallBooking } = useCreateCallBooking()

  const handleEventScheduled = useCallback((payload?: CalendlyPayload) => {
    onEventScheduled?.()

    if (!payload?.event.uri) {
      return
    }

    let externalId: string | undefined
    try {
      const segments = new URL(payload.event.uri).pathname.split('/').filter(Boolean)
      externalId = segments.at(-1)
    }
    catch (_) {
      return
    }

    if (!externalId) {
      return
    }

    createCallBooking({
      external_id: externalId,
      purpose: CallBookingPurpose.BOOKKEEPING_ONBOARDING,
      call_type: CallBookingType.GOOGLE_MEET,
    })
      .catch((error: unknown) => {
        console.error('Failed to record onboarding call booking', error)
      })
  }, [createCallBooking, onEventScheduled])

  useEffect(() => {
    const handleCalendlyMessage = createCalendlyMessageHandler({
      onEventScheduled: handleEventScheduled,
    })

    window.addEventListener('message', handleCalendlyMessage)

    return () => {
      window.removeEventListener('message', handleCalendlyMessage)
    }
  }, [handleEventScheduled])

  return (
    <VStack className='Layer__embedded-onboarding' gap='lg'>
      <Container
        name='embedded-onboarding'
        className='Layer__embedded-onboarding__card'
      >
        <VStack className='Layer__embedded-onboarding__state'>
          <VStack className='Layer__embedded-onboarding__copy' gap='2xs'>
            <Heading size='md'>
              {t(
                'callBookings:prompt.schedule_onboarding_headline',
                'Schedule a call with our bookkeeping team to complete your onboarding.',
              )}
            </Heading>
            <Span variant='subtle'>
              {t(
                'callBookings:prompt.schedule_onboarding_description',
                'During this call, we\'ll review your financial activity and connect your business accounts to get you set up on bookkeeping!',
              )}
            </Span>
          </VStack>
          <InlineWidget
            url={onboardingCallUrl}
            className='calendly-inline-widget Layer__embedded-onboarding__widget'
            styles={{ minWidth: '100%' }}
          />
        </VStack>
      </Container>
    </VStack>
  )
}
