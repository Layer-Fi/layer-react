import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { type Vehicle } from '@schemas/vehicle'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { Drawer } from '@ui/Modal/Modal'
import { ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { VStack } from '@ui/Stack/Stack'
import { VehicleForm } from '@components/VehicleManagement/VehicleForm/VehicleForm'

interface VehicleDrawerProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  vehicle?: Vehicle
  onSuccess: (vehicle: Vehicle) => void
}

const VehicleDrawerHeader = ({ title, close, isMobile }: { title: string, close: () => void, isMobile?: boolean }) => (
  <ModalTitleWithClose
    heading={<ModalHeading size='md'>{title}</ModalHeading>}
    onClose={close}
    hideBottomPadding={isMobile}
  />
)

export const VehicleDrawer = ({ isOpen, onOpenChange, vehicle, onSuccess }: VehicleDrawerProps) => {
  const { t } = useTranslation()
  const { isMobile } = useSizeClass()
  const title = vehicle ? t('vehicles:editVehicle', 'Edit vehicle') : t('vehicles:addVehicleLabel', 'Add vehicle')

  const Header = useCallback(({ close }: { close: () => void }) => (
    <VehicleDrawerHeader title={title} close={close} isMobile={isMobile} />
  ), [title, isMobile])

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      aria-label={title}
      variant={isMobile ? 'mobile-drawer' : 'drawer'}
      flexBlock={isMobile}
      slots={{ Header }}
    >
      <VStack pb='lg' pi='md'>
        <VehicleForm vehicle={vehicle} onSuccess={onSuccess} />
      </VStack>
    </Drawer>
  )
}
