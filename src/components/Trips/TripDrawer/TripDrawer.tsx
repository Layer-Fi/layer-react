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

export const TripDrawer = ({ isOpen, onOpenChange, trip, onDeleteTrip, onSuccess }: TripDrawerProps) => {
  const { isMobile, isTablet } = useSizeClass()
  const [isEditMode, setIsEditMode] = useState(false)
  const isReadOnly = !isEditMode && !!trip && (isMobile || isTablet)

  const handleOpenChange = useCallback((nextIsOpen: boolean) => {
    if (!nextIsOpen) {
      setIsEditMode(false)
    }
    onOpenChange(nextIsOpen)
  }, [onOpenChange])

  const title = trip ? 'Trip details' : 'Record trip'

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      isDismissable
      variant={isMobile ? 'mobile-drawer' : 'drawer'}
      flexBlock={isMobile}
      aria-label={title}
      MobileHeader={
        isMobile
          ? ({ close }) => (
            <VStack pi='md'>
              <ModalTitleWithClose
                heading={<ModalHeading size='md'>{title}</ModalHeading>}
                onClose={close}
              />
            </VStack>
          )
          : undefined
      }
    >
      {({ close }) => {
        const content = (
          <>
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
          </>
        )

        if (isMobile) {
          return (
            <VStack gap='md' pb='lg'>
              {content}
            </VStack>
          )
        }

        return (
          <VStack pb='lg'>
            <VStack pi='md'>
              <ModalTitleWithClose
                heading={<ModalHeading size='md'>{title}</ModalHeading>}
                onClose={close}
              />
            </VStack>
            <VStack gap='md'>
              {content}
            </VStack>
          </VStack>
        )
      }}
    </Drawer>
  )
}
