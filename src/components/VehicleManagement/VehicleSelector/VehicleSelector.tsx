import { useCallback, useId, useMemo } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { type Vehicle } from '@schemas/vehicle'
import { getVehicleDisplayName } from '@utils/vehicles'
import { useListVehicles } from '@hooks/api/businesses/[business-id]/mileage/vehicles/useListVehicles'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { VStack } from '@ui/Stack/Stack'
import { P } from '@ui/Typography/Text'
import { Label } from '@ui/Typography/Text'

import './vehicleSelector.scss'

class VehicleAsOption {
  private internalVehicle: Vehicle

  constructor(vehicle: Vehicle) {
    this.internalVehicle = vehicle
  }

  get original() {
    return this.internalVehicle
  }

  get label() {
    return getVehicleDisplayName(this.internalVehicle)
  }

  get id() {
    return this.internalVehicle.id
  }

  get value() {
    return this.internalVehicle.id
  }
}

export type VehicleSelectorProps = {
  selectedVehicle: Vehicle | null
  onSelectedVehicleChange: (vehicle: Vehicle | null) => void

  placeholder?: string

  isReadOnly?: boolean
  inline?: boolean

  className?: string
  containerClassName?: string
  showLabel?: boolean
}

export function VehicleSelector({
  selectedVehicle,
  onSelectedVehicleChange,

  placeholder,

  isReadOnly,

  inline,

  className,
  containerClassName,
  showLabel = true,
}: VehicleSelectorProps) {
  const { t } = useTranslation()
  const combinedClassName = classNames(
    'Layer__VehicleSelector',
    inline && 'Layer__VehicleSelector--inline',
    containerClassName,
  )

  const { data, isLoading, isError } = useListVehicles()

  const options = useMemo(() => {
    return data?.map(vehicle => new VehicleAsOption(vehicle)) || []
  }, [data])

  const onSelectedValueChange = useCallback((option: VehicleAsOption | null) => {
    onSelectedVehicleChange(option?.original || null)
  }, [onSelectedVehicleChange])

  const selectedVehicleForComboBox = useMemo(
    () => {
      if (selectedVehicle === null) {
        return null
      }

      return new VehicleAsOption(selectedVehicle)
    },
    [selectedVehicle],
  )

  const EmptyMessage = useMemo(
    () => (
      <P variant='subtle'>
        {t('vehicles:noMatchingVehicle', 'No matching vehicle')}
      </P>
    ),
    [t],
  )

  const ErrorMessage = useMemo(
    () => (
      <P
        size='xs'
        status='error'
      >
        {t('vehicles:anErrorOccurredWhileLoadingVehicles', 'An error occurred while loading vehicles.')}
      </P>
    ),
    [t],
  )

  const inputId = useId()
  const additionalAriaProps = !showLabel && { 'aria-label': t('vehicles:vehicle', 'Vehicle') }

  const isLoadingWithoutFallback = isLoading && !data
  const shouldDisableComboBox = isLoadingWithoutFallback || isError

  return (
    <VStack className={combinedClassName}>
      {showLabel && <Label htmlFor={inputId} size='sm'>{t('vehicles:vehicle', 'Vehicle')}</Label>}
      <ComboBox
        selectedValue={selectedVehicleForComboBox}
        onSelectedValueChange={onSelectedValueChange}

        options={options}

        inputId={inputId}
        placeholder={placeholder}
        slots={{ EmptyMessage, ErrorMessage }}

        isDisabled={shouldDisableComboBox}
        isError={isError}
        isLoading={isLoadingWithoutFallback}
        isReadOnly={isReadOnly}
        isSearchable
        className={className}
        {...additionalAriaProps}
      />
    </VStack>
  )
}
