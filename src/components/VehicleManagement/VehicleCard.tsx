import { Car } from 'lucide-react'

import { type Vehicle } from '@schemas/vehicle'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { Card } from '@components/Card/Card'
import { getVehicleDisplayName } from '@features/vehicles/util'

import './vehicleCard.scss'

interface VehicleCardProps {
  vehicle: Vehicle
  onEdit: (vehicle: Vehicle) => void
}

const VEHICLE_CARD_FIELDS = [
  { label: 'Make', key: 'make' as const },
  { label: 'Model', key: 'model' as const },
  { label: 'Year', key: 'year' as const },
  { label: 'License plate', key: 'licensePlate' as const },
  { label: 'VIN', key: 'vin' as const },
  { label: 'Description', key: 'description' as const },
]

export const VehicleCard = ({ vehicle, onEdit }: VehicleCardProps) => {
  return (
    <Card className='Layer__VehicleCard'>
      <VStack gap='md' pi='md' pb='md'>
        <HStack justify='space-between' align='center' gap='md'>
          <Heading size='sm' ellipsis>{getVehicleDisplayName(vehicle)}</Heading>
          <Car size={20} className='Layer__VehicleCard__icon' />
        </HStack>
        <VStack gap='xs'>
          {VEHICLE_CARD_FIELDS.map(({ label, key }) => (
            <HStack key={key} justify='space-between' gap='md'>
              <Span size='sm' variant='subtle'>{label}</Span>
              <Span size='sm' weight='bold' withTooltip>{vehicle[key] || '-'}</Span>
            </HStack>
          ))}
        </VStack>
        <Button variant='text' onPress={() => onEdit(vehicle)}>
          Edit vehicle
        </Button>
      </VStack>
    </Card>
  )
}
