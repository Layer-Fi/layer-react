import { useState } from 'react'
import i18next from 'i18next'
import { Archive, Car, Edit, RotateCcw, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type Vehicle } from '@schemas/vehicle'
import { getVehicleDisplayName } from '@utils/vehicles'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { Badge, BadgeSize, BadgeVariant } from '@components/Badge/Badge'
import { Card } from '@components/Card/Card'
import { Separator } from '@components/Separator/Separator'
import { VehicleArchiveConfirmationModal } from '@components/VehicleManagement/VehicleArchiveConfirmationModal'
import { VehicleDeleteConfirmationModal } from '@components/VehicleManagement/VehicleDeleteConfirmationModal'
import { VehicleReactivateConfirmationModal } from '@components/VehicleManagement/VehicleReactivateConfirmationModal'

import './vehicleCard.scss'

interface VehicleCardProps {
  vehicle: Vehicle
  onEdit: (vehicle: Vehicle) => void
}

const VEHICLE_CARD_FIELDS = [
  { label: i18next.t('makeAndModel', 'Make and model'), key: 'makeAndModel' as const },
  { label: i18next.t('year', 'Year'), key: 'year' as const },
  { label: i18next.t('licensePlate', 'License plate'), key: 'licensePlate' as const },
  { label: i18next.t('vin', 'VIN'), key: 'vin' as const },
  { label: i18next.t('description', 'Description'), key: 'description' as const },
]

export const VehicleCard = ({ vehicle, onEdit }: VehicleCardProps) => {
  const { t } = useTranslation()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false)
  const [isReactivateModalOpen, setIsReactivateModalOpen] = useState(false)
  const { isMobile } = useSizeClass()

  const vehicleName = getVehicleDisplayName(vehicle)
  const isArchived = vehicle.archivedAt !== null && vehicle.archivedAt !== undefined

  return (
    <>
      <Card className='Layer__VehicleCard'>
        <VStack pi='md' pbs='md' pbe='xs'>
          <VStack gap='md'>
            <HStack justify='space-between' align='center' gap='md'>
              <HStack gap='xs' className='Layer__VehicleCard__Header'>
                <Heading size='sm' ellipsis>{vehicleName}</Heading>
                {vehicle.isPrimary && (
                  <Badge size={BadgeSize.SMALL} variant={BadgeVariant.INFO}>
                    {t('primary', 'Primary')}
                  </Badge>
                )}
                {isArchived && (
                  <Badge size={BadgeSize.SMALL} variant={BadgeVariant.WARNING}>
                    {t('archived', 'Archived')}
                  </Badge>
                )}
              </HStack>
              <Car size={20} className='Layer__VehicleCard__Icon' />
            </HStack>
            <VStack gap='xs'>
              {VEHICLE_CARD_FIELDS.map(({ label, key }) => (
                <HStack key={key} justify='space-between' gap='md'>
                  <Span size='sm' variant='subtle'>{label}</Span>
                  <Span size='sm' weight='bold' withTooltip>{vehicle[key] || '-'}</Span>
                </HStack>
              ))}
            </VStack>
          </VStack>
          <VStack pbs='md' pbe='xs'>
            <Separator />
          </VStack>
          <HStack gap='3xs' justify='end'>
            {!isArchived && (
              <Button variant='ghost' onPress={() => onEdit(vehicle)}>
                <Edit size={16} />
                {t('edit', 'Edit')}
              </Button>
            )}
            {isArchived
              ? (
                <Button variant='ghost' onPress={() => setIsReactivateModalOpen(true)}>
                  <RotateCcw size={16} />
                  {t('reactivate', 'Reactivate')}
                </Button>
              )
              : vehicle.isEligibleForDeletion
                ? (
                  <Button variant='ghost' onPress={() => setIsDeleteModalOpen(true)}>
                    <Trash2 size={16} />
                    {t('delete', 'Delete')}
                  </Button>
                )
                : (
                  <Button variant='ghost' onPress={() => setIsArchiveModalOpen(true)}>
                    <Archive size={16} />
                    {t('archive', 'Archive')}
                  </Button>
                )}
          </HStack>
        </VStack>
      </Card>
      <VehicleDeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        vehicle={vehicle}
        useDrawer={isMobile}
      />
      <VehicleArchiveConfirmationModal
        isOpen={isArchiveModalOpen}
        onOpenChange={setIsArchiveModalOpen}
        vehicle={vehicle}
        useDrawer={isMobile}
      />
      <VehicleReactivateConfirmationModal
        isOpen={isReactivateModalOpen}
        onOpenChange={setIsReactivateModalOpen}
        vehicle={vehicle}
        useDrawer={isMobile}
      />
    </>
  )
}
