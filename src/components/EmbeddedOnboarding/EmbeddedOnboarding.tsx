import { useState } from 'react'
import { InlineWidget, useCalendlyEventListener } from 'react-calendly'
import { useTranslation } from 'react-i18next'

import { CallBookingPurpose, CallBookingType } from '@schemas/callBooking'
import { useBookkeepingStatusGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bookkeeping/status/useBookkeepingStatus'
import { useCreateCallBooking } from '@hooks/api/businesses/[business-id]/call-bookings/useCreateCallBooking'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { Container } from '@components/Container/Container'

import './embeddedOnboarding.scss'

export interface EmbeddedOnboardingProps {
  onboardingCallUrl: string
  onContinueToBookkeeping: () => void
}

export const EmbeddedOnboarding = (props: EmbeddedOnboardingProps) => (
  <EmbeddedOnboardingContent key={props.onboardingCallUrl} {...props} />
)

const EmbeddedOnboardingContent = ({ onboardingCallUrl, onContinueToBookkeeping }: EmbeddedOnboardingProps) => {
  const { t } = useTranslation()

  const [isCalendlyEventScheduled, setIsCalendlyEventScheduled] = useState(false)

  const { forceReloadBookkeepingStatus } = useBookkeepingStatusGlobalCacheActions()
  const { trigger: createCallBooking } = useCreateCallBooking()

  useCalendlyEventListener({
    onEventScheduled: (e) => {
      setIsCalendlyEventScheduled(true)

      const eventUri = e.data.payload.event.uri
      if (!eventUri) {
        return
      }

      let externalId: string | undefined
      try {
        const segments = new URL(eventUri).pathname.split('/').filter(Boolean)
        externalId = segments.at(-1)
      }
      catch (_) {
        return
      }

      if (!externalId) {
        return
      }

      void createCallBooking({
        external_id: externalId,
        purpose: CallBookingPurpose.BOOKKEEPING_ONBOARDING,
        call_type: CallBookingType.GOOGLE_MEET,
      }).catch((error: unknown) => {
        console.error('Failed to record onboarding call booking', error)
      })
    },
  })

  return (
    <VStack className='Layer__embedded-onboarding' gap='lg'>
      <Container
        name='embedded-onboarding'
        className='Layer__embedded-onboarding__card'
      >
        <VStack className='Layer__embedded-onboarding__state'>
          <VStack className='Layer__embedded-onboarding__copy' gap='2xs'>
            <HStack align='start' justify='space-between' gap='md' className='Layer__embedded-onboarding__header'>
              <Heading size='md' className='Layer__embedded-onboarding__headline'>
                {t(
                  'callBookings:prompt.schedule_onboarding_headline',
                  'Schedule a call with our bookkeeping team to complete your onboarding.',
                )}
              </Heading>
              {isCalendlyEventScheduled && (
                <HStack align='center' className='Layer__embedded-onboarding__header-continue'>
                  <Button
                    variant='solid'
                    onPress={() => {
                      void forceReloadBookkeepingStatus()
                      onContinueToBookkeeping()
                    }}
                  >
                    {t('callBookings:action.continue_to_bookkeeping', 'Continue to bookkeeping')}
                  </Button>
                </HStack>
              )}
            </HStack>
            <Span variant='subtle'>
              {t(
                'callBookings:prompt.schedule_onboarding_description',
                'During this call, we\'ll review your financial activity and connect your business accounts to get you set up on bookkeeping!',
              )}
            </Span>
          </VStack>
          <InlineWidget
            url={onboardingCallUrl}
            className='Layer__embedded-onboarding__widget'
          />
        </VStack>
      </Container>
    </VStack>
  )
}
