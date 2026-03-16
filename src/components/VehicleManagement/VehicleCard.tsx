import { useMemo, useState } from 'react'
import { Archive, Car, Edit, RotateCcw, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type Vehicle } from '@schemas/vehicle'
import { translationKey } from '@utils/i18n/translationKey'
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

const VEHICLE_CARD_FIELDS_CONFIG = [
  { fieldKey: 'makeAndModel' as const, ...translationKey('vehicles:makeAndModel', 'Make and model') },
  { fieldKey: 'year' as const, ...translationKey('date:year', 'Year') },
  { fieldKey: 'licensePlate' as const, ...translationKey('vehicles:licensePlate', 'License plate') },
  { fieldKey: 'vin' as const, ...translationKey('vehicles:vin', 'VIN') },
  { fieldKey: 'description' as const, ...translationKey('common:description', 'Description') },
]

export const VehicleCard = ({ vehicle, onEdit }: VehicleCardProps) => {
  const { t } = useTranslation()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false)
  const [isReactivateModalOpen, setIsReactivateModalOpen] = useState(false)
  const { isMobile } = useSizeClass()

  const vehicleCardFields = useMemo(
    () => VEHICLE_CARD_FIELDS_CONFIG.map(opt => ({
      label: t(opt.i18nKey, opt.defaultValue),
      key: opt.fieldKey,
    })),
    [t],
  )

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
                    {t('common:primary', 'Primary')}
                  </Badge>
                )}
                {isArchived && (
                  <Badge size={BadgeSize.SMALL} variant={BadgeVariant.WARNING}>
                    {t('common:archived', 'Archived')}
                  </Badge>
                )}
              </HStack>
              <Car size={20} className='Layer__VehicleCard__Icon' />
            </HStack>
            <VStack gap='xs'>
              {vehicleCardFields.map(({ label, key }) => (
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
                {t('common:edit', 'Edit')}
              </Button>
            )}
            {isArchived
              ? (
                <Button variant='ghost' onPress={() => setIsReactivateModalOpen(true)}>
                  <RotateCcw size={16} />
                  {t('common:reactivate', 'Reactivate')}
                </Button>
              )
              : vehicle.isEligibleForDeletion
                ? (
                  <Button variant='ghost' onPress={() => setIsDeleteModalOpen(true)}>
                    <Trash2 size={16} />
                    {t('common:delete', 'Delete')}
                  </Button>
                )
                : (
                  <Button variant='ghost' onPress={() => setIsArchiveModalOpen(true)}>
                    <Archive size={16} />
                    {t('common:archive', 'Archive')}
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
