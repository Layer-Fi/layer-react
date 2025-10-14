import { Container } from '../Container'
import { HStack, VStack } from '../ui/Stack/Stack'
import { Heading } from '../ui/Typography/Heading'
import { Span } from '../ui/Typography/Text'
import { Separator } from '../Separator/Separator'
import { Clock, Link, Milestone, Users, Video } from 'lucide-react'
import { CallBookingPurpose, CallBookingType, type CallBooking as CallBookingData } from '../../schemas/callBookings'
import { format as formatTime } from 'date-fns'
import { DATE_FORMAT_WITH_TIME } from '../../config/general'
import { AddToCalendar } from '../AddToCalendar/AddToCalendar'
import { getTimezoneDisplay } from '../../utils/time/timezoneUtils'
import { Button } from '../ui/Button/Button'

const EmptyState = ({ onBookCall }: { onBookCall?: () => void }) => (
  <VStack gap='md' align='center'>
    <Heading size='sm'>Have any questions?</Heading>
    <Span variant='subtle'>
      Book a call with your bookkeeper
    </Span>
    <VStack gap='xs'>
      <Button variant='solid' onClick={onBookCall}>Book a call</Button>
    </VStack>
  </VStack>
)

const ScheduledCallState = ({
  callBooking,
}: {
  callBooking: CallBookingData
}) => {
  const purpose = callBooking.purpose === CallBookingPurpose.BOOKKEEPING_ONBOARDING ? 'Onboarding call' : 'Adhoc call'

  return (
    <VStack gap='md' align='center'>
      <Users size={36} strokeWidth={1.5} />
      <Heading size='sm'>Confirmed</Heading>
      <Span variant='subtle'>
        Your call with our bookkeeping team
      </Span>
      <Separator />
      <VStack align='start' className='Layer__call-booking-details' gap='xs'>
        <HStack align='center' gap='sm'>
          <Milestone size={20} />
          <Span size='lg' weight='bold'>{purpose}</Span>
        </HStack>
        <HStack align='center' gap='sm'>
          <Video size={20} />
          <Span size='md'>{callBooking.callType === CallBookingType.ZOOM ? 'Zoom' : 'Google Meet'}</Span>
        </HStack>
        <HStack align='center' gap='sm'>
          <Clock size={20} />
          <HStack gap='xs' align='center'>
            <Span size='md'>{callBooking.eventStartAt && formatTime(callBooking.eventStartAt, DATE_FORMAT_WITH_TIME)}</Span>
            {callBooking.eventStartAt && (
              <Span size='md'>
                {getTimezoneDisplay(callBooking.eventStartAt)}
              </Span>
            )}
          </HStack>
        </HStack>
      </VStack>
      <HStack gap='xs' align='start' justify='start' className='Layer__call-booking-actions'>
        <VStack>
          <AddToCalendar
            title={callBooking.purpose === CallBookingPurpose.BOOKKEEPING_ONBOARDING ? 'Onboarding call' : 'Adhoc call'}
            description={callBooking.callType === CallBookingType.ZOOM ? 'Zoom' : 'Google Meet'}
            location={callBooking.callLink.toString()}
            startDate={callBooking.eventStartAt}
            organizer={{ name: callBooking.bookkeeperName, email: callBooking.bookkeeperEmail }}
          />
        </VStack>
        <a href={callBooking.callLink.toString()} className='Layer__call-booking-link Layer__text-btn' target='_blank' rel='noopener noreferrer'>
          <Button variant='outlined'>
            <Link size={16} />
            Join call
          </Button>
        </a>
      </HStack>
    </VStack>
  )
}

export interface CallBookingProps {
  callBooking?: CallBookingData
  onBookCall?: () => void
  onAddToCalendar?: (callBooking: CallBookingData) => void
}

export const CallBooking = ({
  callBooking,
  onBookCall,
  onAddToCalendar,
}: CallBookingProps) => {
  return (
    <Container name='call-booking'>
      {onAddToCalendar && callBooking
        ? (
          <ScheduledCallState callBooking={callBooking} />
        )
        : (
          <EmptyState onBookCall={onBookCall} />
        )}
    </Container>
  )
}
