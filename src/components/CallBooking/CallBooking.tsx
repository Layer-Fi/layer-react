import { Check, Clock3, Video } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useIntl } from 'react-intl'

import { type CallBooking as CallBookingData, CallBookingPurpose, CallBookingType } from '@schemas/callBooking'
import { tPlural } from '@utils/i18n/plural'
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

type CountdownDescriptor =
  | { kind: 'days' | 'hours', value: number }
  | { kind: 'startingSoon' | 'inProgress' | 'none' }

const DEFAULT_CALL_DURATION_MS = 30 * 60 * 1000

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

const getEffectiveEndAt = (startAt: Date, endAt?: Date | null) => {
  return endAt ?? new Date(startAt.getTime() + DEFAULT_CALL_DURATION_MS)
}

const getCountdownDescriptor = (now: number, startAt: Date, endAt: Date): CountdownDescriptor => {
  const startTime = startAt.getTime()
  const endTime = endAt.getTime()

  if (now >= startTime && now <= endTime) {
    return { kind: 'inProgress' }
  }

  if (now > endTime) {
    return { kind: 'none' }
  }

  const millisecondsUntilStart = startTime - now

  if (millisecondsUntilStart < 60 * 60 * 1000) {
    return { kind: 'startingSoon' }
  }

  const hoursUntilStart = millisecondsUntilStart / (60 * 60 * 1000)

  if (hoursUntilStart < 24) {
    return { kind: 'hours', value: Math.floor(hoursUntilStart) }
  }

  return {
    kind: 'days',
    value: Math.ceil(millisecondsUntilStart / (24 * 60 * 60 * 1000)),
  }
}

export const CallBooking = ({ callBooking, onBookCall }: CallBookingProps) => {
  const { t } = useTranslation()
  const intl = useIntl()

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
  const subtitle = t('callBookings:label.meet_bookkeeping_team', 'Meet with our bookkeeping team')
  const callPlatform = callBooking.callType === CallBookingType.ZOOM ? 'Zoom' : 'Google Meet'
  const callLink = callBooking.callLink.toString()
  const eventEndAt = getEffectiveEndAt(callBooking.eventStartAt, callBooking.eventEndAt)
  const countdownDescriptor = getCountdownDescriptor(Date.now(), callBooking.eventStartAt, eventEndAt)
  const countdownLabel = (() => {
    switch (countdownDescriptor.kind) {
      case 'days':
        return tPlural(t, 'callBookings:state.call_in_count_days', {
          count: countdownDescriptor.value,
          displayCount: countdownDescriptor.value,
          one: 'in {{displayCount}} day',
          other: 'in {{displayCount}} days',
        })
      case 'hours':
        return tPlural(t, 'callBookings:state.call_in_count_hours', {
          count: countdownDescriptor.value,
          displayCount: countdownDescriptor.value,
          one: 'in {{displayCount}} hour',
          other: 'in {{displayCount}} hours',
        })
      case 'startingSoon':
        return t('callBookings:state.starting_soon', 'starting soon')
      case 'inProgress':
        return t('callBookings:state.in_progress', 'in progress')
      case 'none':
        return ''
    }
  })()
  const dateTileMonthLabel = new Intl.DateTimeFormat(intl.locale, {
    month: 'short',
    year: 'numeric',
  }).format(callBooking.eventStartAt).toUpperCase()
  const dateTileDayLabel = new Intl.DateTimeFormat(intl.locale, {
    day: 'numeric',
  }).format(callBooking.eventStartAt)
  const dateTileWeekdayLabel = new Intl.DateTimeFormat(intl.locale, {
    weekday: 'short',
  }).format(callBooking.eventStartAt).toUpperCase()
  const timeLabel = new Intl.DateTimeFormat(intl.locale, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(callBooking.eventStartAt)
  const whatWeWillCoverItems = [
    t('callBookings:label.cover_business_and_books', 'Walk through your business and books'),
    t('callBookings:label.cover_accounts_and_documents', 'Connect your accounts and documents'),
    t('callBookings:label.cover_first_month_expectations', 'Set expectations for our first month'),
  ]

  return (
    <Container name='CallBooking'>
      <VStack className='Layer__CallBooking__Content'>
        <HStack className='Layer__CallBooking__HeaderRow' align='start'>
          <VStack className='Layer__CallBooking__DateColumn'>
            <VStack className='Layer__CallBooking__DateTile'>
              <Span nonAria className='Layer__CallBooking__DateTileMonth'>
                {dateTileMonthLabel}
              </Span>
              <VStack className='Layer__CallBooking__DateTileBody'>
                <Span nonAria className='Layer__CallBooking__DateTileDay'>
                  {dateTileDayLabel}
                </Span>
                <Span nonAria className='Layer__CallBooking__DateTileWeekday'>
                  {dateTileWeekdayLabel}
                </Span>
              </VStack>
            </VStack>
            <HStack className='Layer__CallBooking__TimeRow' align='center'>
              <Clock3 size={16} strokeWidth={2} />
              <Span nonAria noWrap className='Layer__CallBooking__TimeLabel'>
                {timeLabel}
              </Span>
            </HStack>
          </VStack>
          <VStack className='Layer__CallBooking__HeaderDetails'>
            <HStack className='Layer__CallBooking__TitleRow' align='baseline'>
              <Heading size='xs' className='Layer__CallBooking__Title'>
                {purpose}
              </Heading>
              {countdownLabel && (
                <Span nonAria size='xs' className='Layer__CallBooking__Countdown'>
                  ·
                  {' '}
                  {countdownLabel}
                </Span>
              )}
            </HStack>
            <Span size='sm' className='Layer__CallBooking__Subtitle'>
              {subtitle}
            </Span>
            <VStack className='Layer__CallBooking__MetaList'>
              <HStack className='Layer__CallBooking__LocationRow' align='center'>
                <Video size={14} />
                <Span size='sm' className='Layer__CallBooking__LocationLabel'>
                  {callPlatform}
                </Span>
              </HStack>
            </VStack>
          </VStack>
        </HStack>

        <Span nonAria className='Layer__CallBooking__Divider' />

        <VStack className='Layer__CallBooking__CoverageSection'>
          <Span
            nonAria
            size='2xs'
            className='Layer__CallBooking__CoverageEyebrow'
          >
            {t('callBookings:label.what_well_cover', 'What we\'ll cover')}
          </Span>
          <VStack className='Layer__CallBooking__CoverageList' role='list'>
            {whatWeWillCoverItems.map(item => (
              <HStack
                key={item}
                className='Layer__CallBooking__CoverageItem'
                align='start'
                role='listitem'
              >
                <Span nonAria className='Layer__CallBooking__CoverageBadge'>
                  <Check size={12} strokeWidth={2.5} />
                </Span>
                <Span size='sm' className='Layer__CallBooking__CoverageText'>
                  {item}
                </Span>
              </HStack>
            ))}
          </VStack>
        </VStack>

        <HStack className='Layer__CallBooking__ActionRow' align='center'>
          <HStack className='Layer__CallBooking__JoinAction'>
            <LinkButton href={callLink} external variant='solid'>
              <Video size={15} />
              {t('callBookings:action.join_call', 'Join call')}
            </LinkButton>
          </HStack>
        </HStack>
      </VStack>
    </Container>
  )
}
