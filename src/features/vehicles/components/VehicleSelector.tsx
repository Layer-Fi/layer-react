import { useCallback, useId, useMemo } from 'react'
import classNames from 'classnames'
import type { GroupBase, MenuListProps, MenuPlacement } from 'react-select'
import { components } from 'react-select'
import PlusIcon from '@icons/PlusIcon'

import { type Vehicle } from '@schemas/vehicle'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { COMBO_BOX_CLASS_NAMES } from '@ui/ComboBox/classnames'
import type { ComboBoxOption } from '@ui/ComboBox/types'
import { HStack, VStack } from '@ui/Stack/Stack'
import { P, Span } from '@ui/Typography/Text'
import { Label } from '@ui/Typography/Text'
import { useListVehicles } from '@features/vehicles/api/useListVehicles'
import { getVehicleDisplayName } from '@features/vehicles/utils'

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
  menuPlacement?: MenuPlacement
  onCreateVehicle?: () => void
}

function buildMenuListWithFooter<T extends ComboBoxOption>(
  onCreateVehicle?: () => void,
) {
  return function MenuListWithFooter(props: MenuListProps<T, false, GroupBase<T>>) {
    return (
      <>
        <components.MenuList
          {...props}
          className={COMBO_BOX_CLASS_NAMES.MENU_LIST}
        />
        {onCreateVehicle && !props.isLoading && (
          <div className='Layer__VehicleSelector__MenuFooter'>
            <button
              type='button'
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onCreateVehicle()
              }}
              className='Layer__VehicleSelector__AddButton'
            >
              <HStack gap='xs' align='center'>
                <PlusIcon size={14} />
                <Span size='sm'>Add vehicle</Span>
              </HStack>
            </button>
          </div>
        )}
      </>
    )
  }
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
  menuPlacement,
  onCreateVehicle,
}: VehicleSelectorProps) {
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
        No matching vehicle
      </P>
    ),
    [],
  )

  const ErrorMessage = useMemo(
    () => (
      <P
        size='xs'
        status='error'
      >
        An error occurred while loading vehicles.
      </P>
    ),
    [],
  )

  const inputId = useId()
  const additionalAriaProps = !showLabel && { 'aria-label': 'Vehicle' }

  const isLoadingWithoutFallback = isLoading && !data
  const shouldDisableComboBox = isLoadingWithoutFallback || isError

  const MenuListComponent = useMemo(
    () => buildMenuListWithFooter<VehicleAsOption>(onCreateVehicle),
    [onCreateVehicle],
  )

  return (
    <VStack className={combinedClassName}>
      {showLabel && <Label htmlFor={inputId} size='sm'>Vehicle</Label>}
      <ComboBox
        selectedValue={selectedVehicleForComboBox}
        onSelectedValueChange={onSelectedValueChange}

        options={options}

        inputId={inputId}
        placeholder={placeholder}
        slots={{
          EmptyMessage,
          ErrorMessage,
          MenuList: MenuListComponent,
        }}

        isDisabled={shouldDisableComboBox}
        isError={isError}
        isLoading={isLoadingWithoutFallback}
        isReadOnly={isReadOnly}
        isSearchable
        menuPlacement={menuPlacement}
        className={className}
        {...additionalAriaProps}
      />
    </VStack>
  )
}
