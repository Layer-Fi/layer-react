import { Clock, Link as LinkIcon, Milestone, Users, Video } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type CallBooking as CallBookingData, CallBookingPurpose, CallBookingType } from '@schemas/callBooking'
import { DateFormat } from '@utils/i18n/date/patterns'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Button } from '@ui/Button/Button'
import { LinkButton } from '@ui/Button/LinkButton'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { AddToCalendar } from '@components/AddToCalendar/AddToCalendar'
import { Container } from '@components/Container/Container'
import { Separator } from '@components/Separator/Separator'

import './callBooking.scss'

export interface CallBookingProps {
  callBooking?: CallBookingData
  onBookCall?: () => void
}

const EmptyState = ({ onBookCall }: { onBookCall?: () => void }) => {
  const { t } = useTranslation()

  return (
    <VStack gap='md' align='center' className='Layer__call-booking-state' pb='md'>
      <Heading size='sm'>{t('callBookings:prompt.ready_to_get_started', 'Ready to get started?')}</Heading>
      <Span variant='subtle'>
        {t('callBookings:label.book_call_with_bookkeeper', 'Book a call with your bookkeeper')}
      </Span>
      <Button variant='solid' onClick={onBookCall}>
        {t('callBookings:action.book_call', 'Book a call')}
      </Button>
    </VStack>
  )
}

export const CallBooking = ({ callBooking, onBookCall }: CallBookingProps) => {
  const { t } = useTranslation()
  const { formatDate } = useIntlFormatter()

  if (callBooking == null) {
    return (
      <Container name='call-booking'>
        <EmptyState onBookCall={onBookCall} />
      </Container>
    )
  }

  const purpose = callBooking.purpose === CallBookingPurpose.BOOKKEEPING_ONBOARDING
    ? t('callBookings:label.onboarding_call', 'Onboarding call')
    : t('callBookings:label.ad_hoc_call', 'Ad hoc call')
  const callPlatform = callBooking.callType === CallBookingType.ZOOM ? 'Zoom' : 'Google Meet'
  const callLink = callBooking.callLink.toString()

  return (
    <Container name='call-booking'>
      <VStack gap='md' align='center' className='Layer__call-booking-scheduled'>
        <VStack gap='xs' align='center'>
          <div className='Layer__call-booking-icon'>
            <Users size={24} strokeWidth={1.5} />
          </div>
          <Heading size='sm'>{t('callBookings:label.upcoming_call', 'Upcoming Call')}</Heading>
          <Span variant='subtle' size='sm'>
            {t('callBookings:label.meet_bookkeeping_team', 'Meet with our bookkeeping team')}
          </Span>
        </VStack>
        <Separator mbs='2xs' mbe='2xs' />
        <VStack align='start' className='Layer__call-booking-details' gap='sm'>
          <HStack align='center' gap='sm' className='Layer__call-booking-detail-row'>
            <Milestone size={16} className='Layer__call-booking-detail-icon' />
            <Span variant='subtle' size='sm' className='Layer__call-booking-detail-label'>
              {t('callBookings:label.purpose', 'Purpose')}
            </Span>
            <Span size='sm'>{purpose}</Span>
          </HStack>
          <HStack align='center' gap='sm' className='Layer__call-booking-detail-row'>
            <Video size={16} className='Layer__call-booking-detail-icon' />
            <Span variant='subtle' size='sm' className='Layer__call-booking-detail-label'>
              {t('callBookings:label.location', 'Location')}
            </Span>
            <Span size='sm'>{callPlatform}</Span>
          </HStack>
          <HStack align='center' gap='sm' className='Layer__call-booking-detail-row'>
            <Clock size={16} className='Layer__call-booking-detail-icon' />
            <Span variant='subtle' size='sm' className='Layer__call-booking-detail-label'>
              {t('callBookings:label.date', 'Date')}
            </Span>
            <Span size='sm'>
              {formatDate(callBooking.eventStartAt, DateFormat.DateWithTimeReadableWithTimezone)}
            </Span>
          </HStack>
        </VStack>
        <HStack gap='sm' align='center' className='Layer__call-booking-actions'>
          <AddToCalendar
            title={purpose}
            description={callPlatform}
            location={callLink}
            startDate={callBooking.eventStartAt}
            endDate={callBooking.eventEndAt}
            organizer={{ name: callBooking.bookkeeperName, email: callBooking.bookkeeperEmail }}
          />
          <LinkButton href={callLink} external variant='outlined'>
            <LinkIcon size={16} />
            {t('callBookings:action.join_call', 'Join call')}
          </LinkButton>
        </HStack>
      </VStack>
    </Container>
  )
}
