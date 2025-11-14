import { Heading } from '@ui/Typography/Heading'
import { useCallback } from 'react'
import { BaseDetailView } from '@components/BaseDetailView/BaseDetailView'
import { HStack } from '@ui/Stack/Stack'
import { useTripsNavigation } from '@providers/TripsRouteStore/TripsRouteStoreProvider'
import BackArrow from '@icons/BackArrow'
import { VehicleManagementGrid } from '@components/VehicleManagement/VehicleManagementGrid'
import './vehicleManagementDetail.scss'

const VehicleManagementDetailHeader = () => {
  return (
    <HStack justify='space-between' align='center' fluid pie='md'>
      <Heading size='sm'>Manage vehicles</Heading>
    </HStack>
  )
}

export const VehicleManagementDetail = () => {
  const { toTripsTable } = useTripsNavigation()

  const Header = useCallback(() => {
    return (
      <VehicleManagementDetailHeader />
    )
  }, [])

  return (
    <>
      <BaseDetailView
        slots={{ Header, BackIcon: BackArrow }}
        name='VehicleManagementDetail'
        onGoBack={toTripsTable}
      >
        <VehicleManagementGrid />
      </BaseDetailView>
    </>
  )
}
