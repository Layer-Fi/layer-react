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
      <Heading size='sm'>{t('callBookings:prompt.have_questions', 'Have any questions?')}</Heading>
      <Span variant='subtle'>
        {t('callBookings:label.book_call_with_bookkeeper', 'Book a call with your bookkeeper')}
      </Span>
      <VStack gap='xs'>
        <Button variant='solid' onClick={onBookCall}>{t('callBookings:action.book_call', 'Book a call')}</Button>
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
  const purpose = callBooking.purpose === CallBookingPurpose.BOOKKEEPING_ONBOARDING ? t('callBookings:label.onboarding_call', 'Onboarding call') : t('callBookings:label.ad_hoc_call', 'Ad hoc call')
  const callPlatform = callBooking.callType === CallBookingType.ZOOM ? 'Zoom' : 'Google Meet'

  return (
    <VStack gap='md' align='center'>
      <Users size={36} strokeWidth={1.5} />
      <Heading size='sm'>{t('callBookings:label.upcoming_call', 'Upcoming Call')}</Heading>
      <Span variant='subtle'>
        {t('callBookings:label.meet_bookkeeping_team', 'Meet with our bookkeeping team')}
      </Span>
      <Separator />
      <VStack align='start' className='Layer__call-booking-details' gap='xs'>
        <HStack align='center' gap='sm'>
          <Milestone size={16} />
          <Span>
            {t('callBookings:label.purpose_colon', 'Purpose:')}
            {' '}
          </Span>
          <Span>{purpose}</Span>
        </HStack>
        <HStack align='center' gap='sm'>
          <Video size={16} />
          <Span>
            {t('callBookings:label.location_colon', 'Location:')}
            {' '}
          </Span>
          <Span size='md'>{callPlatform}</Span>
        </HStack>
        <HStack align='center' gap='sm'>
          <Clock size={16} />
          <HStack gap='xs' align='center'>
            <Span>
              {t('callBookings:label.date_colon', 'Date:')}
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
            title={callBooking.purpose === CallBookingPurpose.BOOKKEEPING_ONBOARDING ? t('callBookings:label.onboarding_call', 'Onboarding call') : t('callBookings:label.ad_hoc_call', 'Ad hoc call')}
            description={callPlatform}
            location={callBooking.callLink.toString()}
            startDate={callBooking.eventStartAt}
            endDate={callBooking.eventEndAt}
            organizer={{ name: callBooking.bookkeeperName, email: callBooking.bookkeeperEmail }}
          />
        </VStack>

        <LinkButton href={callBooking.callLink.toString()} external variant='outlined'>
          <LinkIcon size={16} />
          {t('callBookings:action.join_call', 'Join call')}
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
