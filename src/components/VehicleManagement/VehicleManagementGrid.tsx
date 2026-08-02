import { useMemo } from 'react'
import { Car } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type Vehicle } from '@schemas/vehicle'
import { asMutable } from '@utils/asMutable'
import { useGetVehicles } from '@api/businesses/[business-id]/mileage/vehicles/get'
import { DataState, DataStateStatus } from '@ui/DataState/DataState'
import { Loader } from '@ui/Loader/Loader'
import { HStack, VStack } from '@ui/Stack/Stack'
import { VehicleCard } from '@components/VehicleManagement/VehicleCard'

import './vehicleManagementGrid.scss'

interface VehicleManagementGridProps {
  onEditVehicle: (vehicle: Vehicle) => void
  showArchived: boolean
}

export const VehicleManagementGrid = ({ onEditVehicle, showArchived }: VehicleManagementGridProps) => {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useGetVehicles({ allowArchived: showArchived })
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
        title={t('vehicles:error.load_vehicle', 'We couldn\'t load your vehicles')}
        description={t('vehicles:error.load_vehicle_retry', 'An error occurred while loading your vehicles. Please check your connection and try again.')}
        spacing
      />
    )
  }

  if (!vehicles || vehicles.length === 0) {
    return (
      <DataState
        status={DataStateStatus.allDone}
        title={t('vehicles:empty.vehicles', 'No vehicles yet')}
        description={t('vehicles:empty.add_first_vehicle', 'Add your first vehicle to start tracking trips.')}
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
