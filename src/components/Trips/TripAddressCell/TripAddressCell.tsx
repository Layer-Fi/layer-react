import { type Trip } from '@schemas/trip'
import { VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

export const TripsAddressCell = ({ trip }: { trip: Trip }) => {
  return (
    <VStack gap='3xs'>
      {trip.startAddress && (
        <Span ellipsis size='sm' withTooltip>
          <strong>Start:</strong>
          {' '}
          {trip.startAddress}
        </Span>
      )}
      {trip.endAddress && (
        <Span ellipsis size='sm' withTooltip>
          <strong>End:</strong>
          {' '}
          {trip.endAddress}
        </Span>
      )}
    </VStack>
  )
}
