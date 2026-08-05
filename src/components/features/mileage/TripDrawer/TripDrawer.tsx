import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { Trip } from '@schemas/features/mileage/trip'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { Drawer } from '@ui/Modal/Modal'
import { ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { VStack } from '@ui/Stack/Stack'
import { TripForm } from '@features/mileage/TripForm/TripForm'

interface TripDrawerProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  trip: Trip | null
  onSuccess: () => void
}

const TripDrawerHeader = ({ title, close, isMobile }: { title: string, close: () => void, isMobile?: boolean }) => (
  <ModalTitleWithClose
    heading={<ModalHeading size='md'>{title}</ModalHeading>}
    onClose={close}
    hideBottomPadding={isMobile}
  />
)

export const TripDrawer = ({ isOpen, onOpenChange, trip, onSuccess }: TripDrawerProps) => {
  const { t } = useTranslation()
  const { isMobile } = useSizeClass()
  const title = trip ? t('trips:action.edit_trip', 'Edit Trip') : t('trips:action.record_trip', 'Record trip')

  const Header = useCallback(({ close }: { close: () => void }) => (
    <TripDrawerHeader title={title} close={close} isMobile={isMobile} />
  ), [title, isMobile])

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable
      variant={isMobile ? 'mobile-drawer' : 'drawer'}
      flexBlock={isMobile}
      aria-label={title}
      slots={{ Header }}
    >
      {({ close }) => (
        <VStack pb='lg'>
          <TripForm
            trip={trip ?? undefined}
            onSuccess={() => {
              onSuccess()
              close()
            }}
          />
        </VStack>
      )}
    </Drawer>
  )
}
