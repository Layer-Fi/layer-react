import { Check, Clock3, Video } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type CallBooking as CallBookingData, CallBookingPurpose, CallBookingType } from '@schemas/callBooking'
import { DateFormat } from '@utils/i18n/date/patterns'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Button } from '@ui/Button/Button'
import { LinkButton } from '@ui/Button/LinkButton'
import { DateTile } from '@ui/DateTile/DateTile'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { Container } from '@components/Container/Container'

import './callBooking.scss'

import { useCallBookingCountdownLabel } from './useCallBookingCountdownLabel'

const ONBOARDING_CALL_COVERAGE_ITEMS = [
  {
    key: 'business_and_books',
    translationKey: 'callBookings:label.cover_business_and_books',
    defaultLabel: 'Walk through your business and books',
  },
  {
    key: 'accounts_and_documents',
    translationKey: 'callBookings:label.cover_accounts_and_documents',
    defaultLabel: 'Connect your accounts and documents',
  },
  {
    key: 'first_month_expectations',
    translationKey: 'callBookings:label.cover_first_month_expectations',
    defaultLabel: 'Set expectations for our first month',
  },
] as const

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

const OnboardingCallCoverage = () => {
  const { t } = useTranslation()

  return (
    <>
      <Span nonAria className='Layer__CallBooking__Divider' />

      <VStack pbe='md'>
        <Span
          nonAria
          size='2xs'
          variant='subtle'
          weight='bold'
          pbe='sm'
          className='Layer__CallBooking__CoverageHeading'
        >
          {t('callBookings:label.what_well_cover', 'What we\'ll cover')}
        </Span>
        <VStack role='list' gap='xs'>
          {ONBOARDING_CALL_COVERAGE_ITEMS.map(({ key, translationKey, defaultLabel }) => (
            <HStack
              key={key}
              className='Layer__CallBooking__CoverageItem'
              align='start'
              gap='sm'
              role='listitem'
            >
              <HStack
                className='Layer__CallBooking__CoverageBadge'
                align='center'
                justify='center'
              >
                <Check size={12} strokeWidth={2.5} />
              </HStack>
              <Span size='sm'>
                {t(translationKey, defaultLabel)}
              </Span>
            </HStack>
          ))}
        </VStack>
      </VStack>
    </>
  )
}

export const CallBooking = ({ callBooking, onBookCall }: CallBookingProps) => {
  const { t } = useTranslation()
  const { formatDate } = useIntlFormatter()
  const countdownLabel = useCallBookingCountdownLabel(callBooking?.eventStartAt)

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
  const timeLabel = formatDate(callBooking.eventStartAt, DateFormat.MonthDayWithTimeReadable)

  return (
    <Container name='CallBooking'>
      <VStack pi='lg' pb='lg'>
        <HStack className='Layer__CallBooking__HeaderRow' align='start' gap='xl'>
          <DateTile date={callBooking.eventStartAt} />
          <VStack className='Layer__CallBooking__HeaderDetails' fluid pbs='3xs'>
            <HStack className='Layer__CallBooking__TitleRow' align='baseline' gap='xs'>
              <Heading size='sm'>
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
            <Span size='sm' variant='subtle' pbs='3xs'>
              {subtitle}
            </Span>
            <VStack gap='xs' align='start' pbs='sm'>
              <HStack
                className='Layer__CallBooking__LocationRow'
                align='center'
                gap='sm'
                pb='xs'
                pi='sm'
              >
                <Video size={14} />
                <Span size='sm' weight='bold' variant='placeholder'>
                  {callPlatform}
                </Span>
              </HStack>
            </VStack>
          </VStack>
        </HStack>

        <HStack className='Layer__CallBooking__DateTimeRow' align='center' gap='sm' pbs='md'>
          <Clock3 size={16} strokeWidth={2} />
          <Span nonAria noWrap size='lg' weight='bold'>
            {timeLabel}
          </Span>
        </HStack>

        {isOnboardingCall && <OnboardingCallCoverage />}

        <HStack align='center' gap='xs'>
          <HStack className='Layer__CallBooking__JoinAction'>
            <LinkButton href={callLink} external variant='solid' fullWidth>
              <Video size={15} />
              {t('callBookings:action.join_call', 'Join call')}
            </LinkButton>
          </HStack>
        </HStack>
      </VStack>
    </Container>
  )
}
