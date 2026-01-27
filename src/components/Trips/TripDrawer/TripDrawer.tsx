import { useCallback, useState } from 'react'
import { Edit, Trash2 } from 'lucide-react'

import type { Trip } from '@schemas/trip'
import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { Button } from '@ui/Button/Button'
import { Drawer } from '@ui/Modal/Modal'
import { ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { HStack, VStack } from '@ui/Stack/Stack'
import { TripForm } from '@components/Trips/TripForm/TripForm'

interface TripDrawerProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  trip: Trip | null
  onSuccess: () => void
  onDeleteTrip: (trip: Trip) => void
}

const TripDrawerHeader = ({ title, close, isMobile }: { title: string, close: () => void, isMobile?: boolean }) => (
  <ModalTitleWithClose
    heading={<ModalHeading size='md'>{title}</ModalHeading>}
    onClose={close}
    hideBottomPadding={isMobile}
  />
)

export const TripDrawer = ({ isOpen, onOpenChange, trip, onDeleteTrip, onSuccess }: TripDrawerProps) => {
  const { isMobile, isTablet } = useSizeClass()
  const [isEditMode, setIsEditMode] = useState(false)
  const isReadOnly = !isEditMode && !!trip && (isMobile || isTablet)
  const title = trip ? 'Trip details' : 'Record trip'

  const handleOpenChange = useCallback((nextIsOpen: boolean) => {
    if (!nextIsOpen) {
      setIsEditMode(false)
    }
    onOpenChange(nextIsOpen)
  }, [onOpenChange])

  const Header = useCallback(({ close }: { close: () => void }) => (
    <TripDrawerHeader title={title} close={close} isMobile={isMobile} />
  ), [title, isMobile])

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      isDismissable
      variant={isMobile ? 'mobile-drawer' : 'drawer'}
      flexBlock={isMobile}
      aria-label={title}
      slots={{ Header }}
    >
      {({ close }) => {
        return (
          <VStack pb='lg'>
            <VStack gap='md'>
              <TripForm
                isReadOnly={isReadOnly}
                trip={trip ?? undefined}
                onSuccess={() => {
                  onSuccess()
                  close()
                }}
              />
              {isReadOnly && (
                <HStack pie='lg' gap='xs' justify='end' pbs='sm'>
                  <Button variant='outlined' onPress={() => onDeleteTrip(trip)}>
                    <Trash2 size={16} />
                    Delete Trip
                  </Button>
                  <Button onPress={() => setIsEditMode(true)}>
                    <Edit size={16} />
                    Edit Trip
                  </Button>
                </HStack>
              )}
            </VStack>
          </VStack>
        )
      }}
    </Drawer>
  )
}
