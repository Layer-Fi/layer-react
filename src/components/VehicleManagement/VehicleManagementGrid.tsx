import { useMemo } from 'react'
import { useListVehicles } from '@features/vehicles/api/useListVehicles'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { Car } from 'lucide-react'
import { type Vehicle } from '@schemas/vehicle'
import { VStack, HStack } from '@ui/Stack/Stack'
import { asMutable } from '@utils/asMutable'
import { Loader } from '@components/Loader/Loader'
import { VehicleCard } from './VehicleCard'
import './vehicleManagementGrid.scss'

interface VehicleManagementGridProps {
  onEditVehicle: (vehicle: Vehicle) => void
}

export const VehicleManagementGrid = ({ onEditVehicle }: VehicleManagementGridProps) => {
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
        <VehicleCard key={vehicle.id} vehicle={vehicle} onEdit={onEditVehicle} />
      ))}
    </HStack>
  )
}
