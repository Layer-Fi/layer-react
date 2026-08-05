import { useCallback, useMemo } from 'react'
import { type TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import { type Vehicle } from '@schemas/mileage/vehicle'
import { getVehicleDisplayName } from '@utils/features/mileage/vehicles'
import { useGetVehicles } from '@api/businesses/[business-id]/mileage/vehicles/get'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { P } from '@ui/Typography/Text'
import { ComboBoxField } from '@blocks/Form/ComboBoxField'

class VehicleAsOption {
  private internalVehicle: Vehicle
  private t: TFunction

  constructor(vehicle: Vehicle, t: TFunction) {
    this.internalVehicle = vehicle
    this.t = t
  }

  get original() {
    return this.internalVehicle
  }

  get label() {
    return getVehicleDisplayName(this.internalVehicle, this.t)
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

  const { data, isLoading, isError } = useGetVehicles()

  const options = useMemo(() => {
    return data?.map(vehicle => new VehicleAsOption(vehicle, t)) || []
  }, [data, t])

  const onSelectedValueChange = useCallback((option: VehicleAsOption | null) => {
    onSelectedVehicleChange(option?.original || null)
  }, [onSelectedVehicleChange])

  const selectedVehicleForComboBox = useMemo(
    () => {
      if (selectedVehicle === null) {
        return null
      }

      return new VehicleAsOption(selectedVehicle, t)
    },
    [selectedVehicle, t],
  )

  const EmptyMessage = useMemo(
    () => (
      <P variant='subtle'>
        {t('vehicles:empty.matching_vehicle', 'No matching vehicle')}
      </P>
    ),
    [t],
  )

  const ErrorMessage = t('vehicles:error.load_vehicles', 'An error occurred while loading vehicles.')

  const isLoadingWithoutFallback = isLoading && !data
  const shouldDisableComboBox = isLoadingWithoutFallback || isError

  return (
    <ComboBoxField
      label={t('vehicles:label.vehicle', 'Vehicle')}
      className={containerClassName}
      inline={inline}
      showLabel={showLabel}
    >
      {controlProps => (
        <ComboBox
          {...controlProps}
          selectedValue={selectedVehicleForComboBox}
          onSelectedValueChange={onSelectedValueChange}

          options={options}

          placeholder={placeholder}
          slots={{ EmptyMessage, ErrorMessage }}

          isDisabled={shouldDisableComboBox}
          isError={isError}
          isLoading={isLoadingWithoutFallback}
          isReadOnly={isReadOnly}
          isSearchable
          className={className}
        />
      )}
    </ComboBoxField>
  )
}
