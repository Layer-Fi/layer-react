import { useCallback, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type Vehicle } from '@schemas/vehicle'
import { useListVehicles } from '@hooks/api/businesses/[business-id]/mileage/vehicles/useListVehicles'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useTripsNavigation } from '@providers/TripsRouteStore/TripsRouteStoreProvider'
import BackArrow from '@icons/BackArrow'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { Switch } from '@ui/Switch/Switch'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { BaseDetailView } from '@components/BaseDetailView/BaseDetailView'
import { VehicleDrawer } from '@components/VehicleManagement/VehicleDrawer/VehicleDrawer'
import { VehicleManagementGrid } from '@components/VehicleManagement/VehicleManagementGrid'

interface VehicleManagementDetailHeaderProps {
  onAddVehicle: () => void
  showArchived: boolean
  onShowArchivedChange: (value: boolean) => void
  showArchivedToggle: boolean
}

const MobileVehicleManagementDetailHeader = ({
  onAddVehicle,
}: VehicleManagementDetailHeaderProps) => {
  const { t } = useTranslation()
  return (
    <HStack justify='space-between' align='center' fluid pie='md' pb='md'>
      <Heading size='sm'>{t('vehicles:action.manage_vehicles', 'Manage vehicles')}</Heading>
      <Button variant='solid' onPress={onAddVehicle}>
        {t('common:action.add_label', 'Add')}
        <Plus size={14} />
      </Button>
    </HStack>
  )
}

const DesktopVehicleManagementDetailHeader = ({
  onAddVehicle,
  showArchived,
  onShowArchivedChange,
  showArchivedToggle,
}: VehicleManagementDetailHeaderProps) => {
  const { t } = useTranslation()
  return (
    <HStack justify='space-between' align='center' fluid pie='md' gap='3xl'>
      <Heading size='sm'>{t('vehicles:action.manage_vehicles', 'Manage vehicles')}</Heading>
      <HStack gap='md' align='center'>
        {showArchivedToggle && (
          <Switch isSelected={showArchived} onChange={onShowArchivedChange}>
            <Span size='sm' noWrap>{t('common:action.show_archived', 'Show archived')}</Span>
          </Switch>
        )}
        <Button variant='solid' onPress={onAddVehicle}>
          {t('vehicles:action.add_vehicle', 'Add Vehicle')}
          <Plus size={14} />
        </Button>
      </HStack>
    </HStack>
  )
}

export const VehicleManagementDetail = () => {
  const { t } = useTranslation()
  const { toTripsTable } = useTripsNavigation()
  const [isVehicleDrawerOpen, setIsVehicleDrawerOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | undefined>(undefined)
  const [showArchived, setShowArchived] = useState(false)
  const { isDesktop } = useSizeClass()
  const { data: allVehicles } = useListVehicles({ allowArchived: true })
  const hasArchivedVehicles = allVehicles?.some(vehicle => vehicle.archivedAt != null) ?? false

  const isMobileVariant = !isDesktop

  const handleAddVehicle = useCallback(() => {
    setSelectedVehicle(undefined)
    setIsVehicleDrawerOpen(true)
  }, [])

  const handleEditVehicle = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setIsVehicleDrawerOpen(true)
  }, [])

  const handleVehicleSuccess = useCallback((_vehicle: Vehicle) => {
    setIsVehicleDrawerOpen(false)
    setSelectedVehicle(undefined)
  }, [])

  // Use a ref to store the latest state values for the Header component
  const stateRef = useRef({ showArchived, setShowArchived, handleAddVehicle, isMobileVariant, hasArchivedVehicles })
  stateRef.current = { showArchived, setShowArchived, handleAddVehicle, isMobileVariant, hasArchivedVehicles }

  // Header component is stable and reads from ref
  const HeaderRef = useRef(() => {
    const {
      showArchived: currentShowArchived,
      setShowArchived: currentSetShowArchived,
      handleAddVehicle: currentHandleAddVehicle,
      isMobileVariant: currentIsMobileVariant,
      hasArchivedVehicles: currentHasArchivedVehicles,
    } = stateRef.current

    if (currentIsMobileVariant) {
      return (
        <MobileVehicleManagementDetailHeader
          onAddVehicle={currentHandleAddVehicle}
          showArchived={currentShowArchived}
          onShowArchivedChange={currentSetShowArchived}
          showArchivedToggle={currentHasArchivedVehicles}
        />
      )
    }

    return (
      <DesktopVehicleManagementDetailHeader
        onAddVehicle={currentHandleAddVehicle}
        showArchived={currentShowArchived}
        onShowArchivedChange={currentSetShowArchived}
        showArchivedToggle={currentHasArchivedVehicles}
      />
    )
  })

  const Header = HeaderRef.current

  return (
    <>
      <BaseDetailView
        slots={{ Header, BackIcon: BackArrow }}
        name='VehicleManagementDetail'
        onGoBack={toTripsTable}
      >
        {isMobileVariant && hasArchivedVehicles && (
          <HStack
            justify='end'
            align='center'
            fluid
            pie='md'
            pbs='md'
          >
            <Switch isSelected={showArchived} onChange={setShowArchived}>
              <Span size='sm' noWrap>{t('common:action.show_archived', 'Show archived')}</Span>
            </Switch>
          </HStack>
        )}
        <VehicleManagementGrid onEditVehicle={handleEditVehicle} showArchived={showArchived} />
      </BaseDetailView>
      <VehicleDrawer
        isOpen={isVehicleDrawerOpen}
        onOpenChange={setIsVehicleDrawerOpen}
        vehicle={selectedVehicle}
        onSuccess={handleVehicleSuccess}
      />
    </>
  )
}
