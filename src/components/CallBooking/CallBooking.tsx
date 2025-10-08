import { ReactNode, useCallback } from 'react'
import { Button, ButtonVariant } from '../Button/Button'
import { Container } from '../Container'
import { HStack, VStack } from '../ui/Stack/Stack'
import { Heading } from '../ui/Typography/Heading'
import { Span } from '../ui/Typography/Text'
import { Separator } from '../Separator/Separator'
import { Clock, Link, Milestone, Users, Video } from 'lucide-react'
import { type CallBooking as CallBookingData } from '../../schemas/callBookings'
import { format as formatTime } from 'date-fns'
import { DATE_FORMAT_WITH_TIME } from '../../config/general'

export interface ScheduledCall {
  id: string
  title: string
  date: Date
  duration: number
  meetingLink?: string
  description?: string
}

const EmptyState = ({ onBookCall }: { onBookCall?: () => void }) => (
  <VStack className='Layer__call-booking-state'>
    <Heading size='sm'>Have any questions?</Heading>
    <Span variant='subtle'>
      Book a call with your bookkeeper
    </Span>
    <VStack gap='xs'>
      <Button variant={ButtonVariant.primary} onClick={onBookCall}>Book a call</Button>
    </VStack>
  </VStack>
)

const ScheduledCallState = ({
  callBooking,
  onAddToCalendar: onAdd,
}: {
  callBooking: CallBookingData
  onAddToCalendar: (callBooking: CallBookingData) => void
}) => {
  const onAddToCalendar = useCallback(() => {
    onAdd(callBooking)
  }, [callBooking, onAdd])

  return (
    <VStack className='Layer__call-booking-state'>
      <Users size={36} strokeWidth={1.5} />
      <Heading size='sm'>Confirmed</Heading>
      <Span variant='subtle'>
        Your call with our bookkeeping team
      </Span>
      <Separator />
      <VStack align='start' className='Layer__call-booking-details' gap='xs'>
        <HStack align='center' gap='sm'>
          <Milestone size={20} />
          <Span size='lg' weight='bold'>Onboarding call</Span>
        </HStack>
        <HStack align='center' gap='sm'>
          <Video size={20} />
          <Span size='md'>Zoom</Span>
        </HStack>
        <HStack align='center' gap='sm'>
          <Clock size={20} />
          <Span size='md'>{callBooking.eventStartAt && formatTime(callBooking.eventStartAt, DATE_FORMAT_WITH_TIME)}</Span>
        </HStack>
        <HStack align='center' gap='sm'>
          <Link size={20} />
          <Span size='md'>https://meet.google.com/abc123</Span>
        </HStack>
      </VStack>
      <VStack gap='xs' className='Layer__call-booking-actions'>
        <Button variant={ButtonVariant.primary} onClick={onAddToCalendar}>Add to your calendar</Button>
      </VStack>
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
  const renderState = (): ReactNode => {
    if (onAddToCalendar && callBooking) {
      return (
        <ScheduledCallState callBooking={callBooking} onAddToCalendar={onAddToCalendar} />
      )
    }

    return <EmptyState onBookCall={onBookCall} />
  }

  return (
    <Container name='call-booking'>
      {renderState()}
    </Container>
  )
}
