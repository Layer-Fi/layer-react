import { Clock, Link as LinkIcon, Users, Video } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type CallBooking as CallBookingData, CallBookingPurpose, CallBookingType } from '@schemas/callBooking'
import { DateFormat } from '@utils/i18n/date/patterns'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Button } from '@ui/Button/Button'
import { LinkButton } from '@ui/Button/LinkButton'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { Container } from '@components/Container/Container'

import './callBooking.scss'

export interface CallBookingProps {
  callBooking?: CallBookingData
  onBookCall?: () => void
}

const EmptyState = ({ onBookCall }: { onBookCall?: () => void }) => {
  const { t } = useTranslation()

  return (
    <VStack gap='md' align='center' pi='lg' pb='lg'>
      <Heading size='sm' align='center'>
        {t('callBookings:prompt.ready_to_get_started', 'Ready to get started?')}
      </Heading>
      <Span variant='subtle' align='center'>
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
      <Container name='CallBooking'>
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
    <Container name='CallBooking'>
      <VStack gap='lg' align='center' pi='lg' pb='lg'>
        <HStack
          className='Layer__CallBooking__DetailsSideBySide'
          align='center'
          gap='lg'
        >
          <VStack
            gap='xs'
            align='center'
            className='Layer__CallBooking__HeaderColumn'
          >
            <div className='Layer__CallBooking__Icon'>
              <Users size={24} strokeWidth={1.5} />
            </div>
            <Heading size='sm' align='center'>
              {purpose}
            </Heading>
            <Span variant='subtle' size='sm' align='center'>
              {t('callBookings:label.meet_bookkeeping_team', 'Meet with our bookkeeping team')}
            </Span>
          </VStack>
          <VStack
            className='Layer__CallBooking__MetaColumn'
            align='center'
            gap='md'
          >
            <HStack className='Layer__CallBooking__DetailRow'>
              <Video size={16} color='var(--color-base-500)' />
              <Span variant='subtle' size='sm' noWrap>
                {t('callBookings:label.location', 'Location')}
              </Span>
              <Span size='sm'>{callPlatform}</Span>
            </HStack>
            <HStack className='Layer__CallBooking__DetailRow'>
              <Clock size={16} color='var(--color-base-500)' />
              <Span variant='subtle' size='sm' noWrap>
                {t('callBookings:label.date', 'Date')}
              </Span>
              <Span size='sm'>
                {formatDate(callBooking.eventStartAt, DateFormat.DateWithTimeReadableWithTimezone)}
              </Span>
            </HStack>
          </VStack>
        </HStack>
        <HStack
          gap='sm'
          align='center'
          justify='center'
          className='Layer__CallBooking__Actions'
        >
          <LinkButton href={callLink} external variant='outlined'>
            <LinkIcon size={16} />
            {t('callBookings:action.join_call', 'Join call')}
          </LinkButton>
        </HStack>
      </VStack>
    </Container>
  )
}
