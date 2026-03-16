import { Trans } from 'react-i18next'

import { type Trip } from '@schemas/trip'
import { VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

export const TripsAddressCell = ({ trip }: { trip: Trip }) => {
  return (
    <VStack gap='3xs' overflow='auto'>
      {trip.startAddress && (
        <Span ellipsis size='sm' withTooltip>
          <Trans
            i18nKey='trips.tripStartAddress'
            defaults='<bold>Start:</bold> {{address}}'
            values={{ address: trip.startAddress }}
            components={{ bold: <strong /> }}
          />
        </Span>
      )}
      {trip.endAddress && (
        <Span ellipsis size='sm' withTooltip>
          <Trans
            i18nKey='trips.tripEndAddress'
            defaults='<bold>End:</bold> {{address}}'
            values={{ address: trip.endAddress }}
            components={{ bold: <strong /> }}
          />
        </Span>
      )}
    </VStack>
  )
}
