import { format as formatTime } from 'date-fns'
import { Link as LinkIcon } from 'lucide-react'
import { Clock, Milestone, Users, Video } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type CallBooking as CallBookingData, CallBookingPurpose, CallBookingType } from '@schemas/callBooking'
import { DATE_FORMAT_WITH_TIME_READABLE } from '@utils/time/timeFormats'
import { getTimezoneDisplay } from '@utils/time/timezoneUtils'
import { Button } from '@ui/Button/Button'
import { LinkButton } from '@ui/Button/LinkButton'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { AddToCalendar } from '@components/AddToCalendar/AddToCalendar'
import { Container } from '@components/Container/Container'
import { Separator } from '@components/Separator/Separator'

import './callBooking.scss'

const EmptyState = ({ onBookCall }: { onBookCall?: () => void }) => {
  const { t } = useTranslation()
  return (
    <VStack gap='md' align='center'>
      <Heading size='sm'>{t('callBookings.haveAnyQuestions', 'Have any questions?')}</Heading>
      <Span variant='subtle'>
        {t('callBookings.bookACallWithYourBookkeeper', 'Book a call with your bookkeeper')}
      </Span>
      <VStack gap='xs'>
        <Button variant='solid' onClick={onBookCall}>{t('callBookings.bookACall', 'Book a call')}</Button>
      </VStack>
    </VStack>
  )
}

const ScheduledCallState = ({
  callBooking,
}: {
  callBooking: CallBookingData
}) => {
  const { t } = useTranslation()
  const purpose = callBooking.purpose === CallBookingPurpose.BOOKKEEPING_ONBOARDING ? t('callBookings.onboardingCall', 'Onboarding call') : t('callBookings.adHocCall', 'Ad hoc call')
  const callPlatform = callBooking.callType === CallBookingType.ZOOM ? 'Zoom' : 'Google Meet'

  return (
    <VStack gap='md' align='center'>
      <Users size={36} strokeWidth={1.5} />
      <Heading size='sm'>{t('callBookings.upcomingCall', 'Upcoming Call')}</Heading>
      <Span variant='subtle'>
        {t('callBookings.meetWithOurBookkeepingTeam', 'Meet with our bookkeeping team')}
      </Span>
      <Separator />
      <VStack align='start' className='Layer__call-booking-details' gap='xs'>
        <HStack align='center' gap='sm'>
          <Milestone size={16} />
          <Span>
            {t('callBookings.purpose', 'Purpose:')}
            {' '}
          </Span>
          <Span>{purpose}</Span>
        </HStack>
        <HStack align='center' gap='sm'>
          <Video size={16} />
          <Span>
            {t('callBookings.location', 'Location:')}
            {' '}
          </Span>
          <Span size='md'>{callPlatform}</Span>
        </HStack>
        <HStack align='center' gap='sm'>
          <Clock size={16} />
          <HStack gap='xs' align='center'>
            <Span>
              {t('callBookings.dateLabel', 'Date:')}
              {' '}
            </Span>
            <Span size='md'>
              {formatTime(callBooking.eventStartAt, DATE_FORMAT_WITH_TIME_READABLE)}
              {' '}
              <>{getTimezoneDisplay(callBooking.eventStartAt)}</>
            </Span>

          </HStack>
        </HStack>
      </VStack>
      <HStack gap='xs' align='start' justify='start' className='Layer__call-booking-actions'>
        <VStack>
          <AddToCalendar
            title={callBooking.purpose === CallBookingPurpose.BOOKKEEPING_ONBOARDING ? t('callBookings.onboardingCall', 'Onboarding call') : t('callBookings.adhocCall', 'Adhoc call')}
            description={callPlatform}
            location={callBooking.callLink.toString()}
            startDate={callBooking.eventStartAt}
            endDate={callBooking.eventEndAt}
            organizer={{ name: callBooking.bookkeeperName, email: callBooking.bookkeeperEmail }}
          />
        </VStack>

        <LinkButton href={callBooking.callLink.toString()} external variant='outlined'>
          <LinkIcon size={16} />
          {t('callBookings.joinCall', 'Join call')}
        </LinkButton>

      </HStack>
    </VStack>
  )
}

export interface CallBookingProps {
  callBooking?: CallBookingData
  onBookCall?: () => void
}

export const CallBooking = ({
  callBooking,
  onBookCall,
}: CallBookingProps) => {
  return (
    <Container name='call-booking'>
      {callBooking
        ? (
          <ScheduledCallState callBooking={callBooking} />
        )
        : (
          <EmptyState onBookCall={onBookCall} />
        )}
    </Container>
  )
}
