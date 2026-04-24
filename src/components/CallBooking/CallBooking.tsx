import { Check, Clock3, Video } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type CallBooking as CallBookingData, CallBookingPurpose, CallBookingType } from '@schemas/callBooking'
import { DateFormat } from '@utils/i18n/date/patterns'
import { tPlural } from '@utils/i18n/plural'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Button } from '@ui/Button/Button'
import { LinkButton } from '@ui/Button/LinkButton'
import { DateTile } from '@ui/DateTile/DateTile'
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
  | { kind: 'startingSoon' | 'none' }

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

const getCountdownDescriptor = (now: number, startAt: Date): CountdownDescriptor => {
  const startTime = startAt.getTime()

  if (now >= startTime) {
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
    value: Math.floor(millisecondsUntilStart / (24 * 60 * 60 * 1000)),
  }
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

  const isOnboardingCall = callBooking.purpose === CallBookingPurpose.BOOKKEEPING_ONBOARDING
  const purpose = isOnboardingCall
    ? t('callBookings:label.onboarding_call', 'Onboarding call')
    : t('callBookings:label.ad_hoc_call', 'Ad hoc call')
  const subtitle = t('callBookings:label.meet_bookkeeping_team', 'Meet with our bookkeeping team')
  const callPlatform = callBooking.callType === CallBookingType.ZOOM ? 'Zoom' : 'Google Meet'
  const callLink = callBooking.callLink.toString()
  const countdownDescriptor = getCountdownDescriptor(Date.now(), callBooking.eventStartAt)
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
      case 'none':
        return ''
    }
  })()
  const timeLabel = formatDate(callBooking.eventStartAt, DateFormat.MonthDayWithTimeReadable)
  const whatWeWillCoverItems: Array<[string, string]> = [
    ['business_and_books', t('callBookings:label.cover_business_and_books', 'Walk through your business and books')],
    ['accounts_and_documents', t('callBookings:label.cover_accounts_and_documents', 'Connect your accounts and documents')],
    ['first_month_expectations', t('callBookings:label.cover_first_month_expectations', 'Set expectations for our first month')],
  ]

  return (
    <Container name='CallBooking'>
      <VStack pi='lg' pb='lg'>
        <HStack className='Layer__CallBooking__HeaderRow' align='start' gap='xl'>
          <VStack className='Layer__CallBooking__DateColumn'>
            <DateTile date={callBooking.eventStartAt} />
          </VStack>
          <VStack className='Layer__CallBooking__HeaderDetails' fluid pbs='3xs'>
            <HStack className='Layer__CallBooking__TitleRow' align='baseline' gap='xs'>
              <Heading size='xs' className='Layer__CallBooking__Title'>
                {purpose}
              </Heading>
              {countdownLabel && (
                <Span nonAria size='xs' variant='subtle'>
                  ·
                  {' '}
                  {countdownLabel}
                </Span>
              )}
            </HStack>
            <Span size='sm' variant='subtle' className='Layer__CallBooking__Subtitle'>
              {subtitle}
            </Span>
            <VStack gap='xs' pbs='sm'>
              <HStack className='Layer__CallBooking__LocationRow' align='center' gap='sm'>
                <Video size={14} />
                <Span size='sm' className='Layer__CallBooking__LocationLabel'>
                  {callPlatform}
                </Span>
              </HStack>
            </VStack>
          </VStack>
        </HStack>

        <HStack className='Layer__CallBooking__DateTimeRow' align='center' gap='sm' pbs='md'>
          <Clock3 size={16} strokeWidth={2} />
          <Span nonAria noWrap className='Layer__CallBooking__TimeLabel'>
            {timeLabel}
          </Span>
        </HStack>

        {isOnboardingCall && (
          <>
            <Span nonAria className='Layer__CallBooking__Divider' />

            <VStack pbe='md'>
              <Span
                nonAria
                size='2xs'
                variant='subtle'
                pbe='sm'
                className='Layer__CallBooking__CoverageEyebrow'
              >
                {t('callBookings:label.what_well_cover', 'What we\'ll cover')}
              </Span>
              <VStack role='list' gap='xs'>
                {whatWeWillCoverItems.map(([key, label]) => (
                  <HStack
                    key={key}
                    className='Layer__CallBooking__CoverageItem'
                    align='start'
                    gap='sm'
                    role='listitem'
                  >
                    <Span nonAria className='Layer__CallBooking__CoverageBadge'>
                      <Check size={12} strokeWidth={2.5} />
                    </Span>
                    <Span size='sm' className='Layer__CallBooking__CoverageText'>
                      {label}
                    </Span>
                  </HStack>
                ))}
              </VStack>
            </VStack>
          </>
        )}

        <HStack className='Layer__CallBooking__ActionRow' align='center' gap='xs'>
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
