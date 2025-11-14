import { useMemo } from 'react'
import { useListVehicles } from '@features/vehicles/api/useListVehicles'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { Car } from 'lucide-react'
import { type Vehicle } from '@schemas/vehicle'
import { VStack, HStack } from '@ui/Stack/Stack'
import { Card } from '@components/Card/Card'
import { Span } from '@ui/Typography/Text'
import { Heading } from '@ui/Typography/Heading'
import { getVehicleDisplayName } from '@features/vehicles/util'
import { asMutable } from '@utils/asMutable'
import { Loader } from '@components/Loader/Loader'
import './vehicleManagementGrid.scss'

interface VehicleCardProps {
  vehicle: Vehicle
}

const VehicleCard = ({ vehicle }: VehicleCardProps) => {
  return (
    <Card className='Layer__VehicleCard'>
      <VStack gap='md' pi='md' pb='md'>
        <HStack justify='space-between' align='center'>
          <Heading size='sm'>{getVehicleDisplayName(vehicle)}</Heading>
          <Car size={20} className='Layer__VehicleCard__icon' />
        </HStack>
        <VStack gap='xs'>
          <HStack justify='space-between'>
            <Span size='sm' variant='subtle'>Make</Span>
            <Span size='sm' weight='bold'>{vehicle.make || '—'}</Span>
          </HStack>
          <HStack justify='space-between'>
            <Span size='sm' variant='subtle'>Model</Span>
            <Span size='sm' weight='bold'>{vehicle.model || '—'}</Span>
          </HStack>
          <HStack justify='space-between'>
            <Span size='sm' variant='subtle'>Year</Span>
            <Span size='sm' weight='bold'>{vehicle.year || '—'}</Span>
          </HStack>
          {vehicle.licensePlate && (
            <HStack justify='space-between'>
              <Span size='sm' variant='subtle'>License Plate</Span>
              <Span size='sm' weight='bold'>{vehicle.licensePlate}</Span>
            </HStack>
          )}
        </VStack>
      </VStack>
    </Card>
  )
}

export const VehicleManagementGrid = () => {
  const { data, isLoading, isError } = useListVehicles()
  const vehicles = useMemo(() => data ? asMutable(data) : undefined, [data])

  if (isLoading) {
    return (
      <VStack align='center' justify='center' pi='lg' pb='lg'>
        <Loader />
      </VStack>
    )
  }

  if (isError) {
    return (
      <DataState
        status={DataStateStatus.failed}
        title="We couldn't load your vehicles"
        description='An error occurred while loading your vehicles. Please check your connection and try again.'
        spacing
      />
    )
  }

  if (!vehicles || vehicles.length === 0) {
    return (
      <DataState
        status={DataStateStatus.allDone}
        title='No vehicles yet'
        description='Add your first vehicle to start tracking trips.'
        icon={<Car />}
        spacing
      />
    )
  }

  return (
    <HStack className='Layer__VehicleManagementGrid'>
      {vehicles.map(vehicle => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </HStack>
  )
}
