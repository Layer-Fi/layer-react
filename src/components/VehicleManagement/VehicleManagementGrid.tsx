import { useMemo } from 'react'
import { Car } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type Vehicle } from '@schemas/vehicle'
import { asMutable } from '@utils/asMutable'
import { useListVehicles } from '@hooks/api/businesses/[business-id]/mileage/vehicles/useListVehicles'
import { HStack, VStack } from '@ui/Stack/Stack'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { Loader } from '@components/Loader/Loader'
import { VehicleCard } from '@components/VehicleManagement/VehicleCard'

import './vehicleManagementGrid.scss'

interface VehicleManagementGridProps {
  onEditVehicle: (vehicle: Vehicle) => void
  showArchived: boolean
}

export const VehicleManagementGrid = ({ onEditVehicle, showArchived }: VehicleManagementGridProps) => {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useListVehicles({ allowArchived: showArchived })
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
        title={t('weCouldntLoadYourVehicles', 'We couldn\'t load your vehicles')}
        description={t('anErrorOccurredWhileLoadingYourVehiclesPleaseCheckYourConnectionAndTryAgain', 'An error occurred while loading your vehicles. Please check your connection and try again.')}
        spacing
      />
    )
  }

  if (!vehicles || vehicles.length === 0) {
    return (
      <DataState
        status={DataStateStatus.allDone}
        title={t('noVehiclesYet', 'No vehicles yet')}
        description={t('addYourFirstVehicleToStartTrackingTrips', 'Add your first vehicle to start tracking trips.')}
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
