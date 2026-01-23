import { useCallback, useState } from 'react'
import { Edit, Trash2 } from 'lucide-react'

import type { Trip } from '@schemas/trip'
import type { Vehicle } from '@schemas/vehicle'
import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { Button } from '@ui/Button/Button'
import { Drawer } from '@ui/Modal/Modal'
import { ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { HStack, VStack } from '@ui/Stack/Stack'
import { TripForm } from '@components/Trips/TripForm/TripForm'
import { VehicleForm } from '@components/VehicleManagement/VehicleForm/VehicleForm'

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
  const [isVehicleDrawerOpen, setIsVehicleDrawerOpen] = useState(false)
  const [formRef, setFormRef] = useState<{ setVehicle: (vehicle: Vehicle | null) => void } | null>(null)
  const isReadOnly = !isEditMode && !!trip && (isMobile || isTablet)

  const handleOpenChange = useCallback((nextIsOpen: boolean) => {
    if (!nextIsOpen) {
      setIsEditMode(false)
    }
    onOpenChange(nextIsOpen)
  }, [onOpenChange])

  const handleCreateVehicle = useCallback(() => {
    setIsVehicleDrawerOpen(true)
  }, [])

  const handleVehicleSuccess = useCallback((vehicle: Vehicle) => {
    setIsVehicleDrawerOpen(false)
    if (formRef) {
      formRef.setVehicle(vehicle)
    }
  }, [formRef])

  const title = trip ? 'Trip details' : 'Record trip'

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        isDismissable
        variant={isMobile ? 'mobile-drawer' : 'drawer'}
        flexBlock={isMobile}
        aria-label={title}
        MobileHeader={
          isMobile
            ? () => (
              <VStack pi='md' pbs='sm'>
                <ModalTitleWithClose
                  bottomPadding={false}
                  heading={<ModalHeading>{title}</ModalHeading>}
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
                isMobileDrawer={isMobile}
                trip={trip ?? undefined}
                onSuccess={() => {
                  onSuccess()
                  close()
                }}
                onCreateVehicle={handleCreateVehicle}
                onFormRefReady={setFormRef}
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
              <VStack gap='md' pbs='sm' pbe='lg'>
                {content}
              </VStack>
            )
          }

          return (
            <VStack pb='lg'>
              <VStack pi='md'>
                <ModalTitleWithClose
                  heading={<ModalHeading>{title}</ModalHeading>}
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
      <Drawer
        isOpen={isVehicleDrawerOpen}
        onOpenChange={setIsVehicleDrawerOpen}
        aria-label='Add vehicle'
        variant={isMobile ? 'mobile-drawer' : 'drawer'}
        flexBlock={isMobile}
        MobileHeader={
          isMobile
            ? ({ close }) => (
              <VStack pi='md' pbs='sm'>
                <ModalTitleWithClose
                  bottomPadding={false}
                  heading={<ModalHeading size='md'>Add vehicle</ModalHeading>}
                  onClose={close}
                />
              </VStack>
            )
            : undefined
        }
      >
        {({ close }) => {
          if (isMobile) {
            return (
              <VStack pbs='sm' pbe='lg' pi='md'>
                <VehicleForm
                  onSuccess={(vehicle) => {
                    handleVehicleSuccess(vehicle)
                    close()
                  }}
                />
              </VStack>
            )
          }

          return (
            <VStack pb='lg'>
              <VStack pi='md'>
                <ModalTitleWithClose
                  heading={<ModalHeading size='md'>Add vehicle</ModalHeading>}
                  onClose={close}
                />
              </VStack>
              <VStack pi='md'>
                <VehicleForm
                  onSuccess={(vehicle) => {
                    handleVehicleSuccess(vehicle)
                    close()
                  }}
                />
              </VStack>
            </VStack>
          )
        }}
      </Drawer>
    </>
  )
}
