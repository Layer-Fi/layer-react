import { useCallback, useId, useMemo } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { type Vendor } from '@schemas/vendor'
import { getVendorName } from '@utils/vendor'
import { useListVendors } from '@hooks/api/businesses/[business-id]/vendors/useListVendors'
import { useDebouncedSearchInput } from '@hooks/utils/debouncing/useDebouncedSearchQuery'
import { MaybeCreatableComboBox } from '@ui/ComboBox/MaybeCreatableComboBox'
import { VStack } from '@ui/Stack/Stack'
import { Label, P } from '@ui/Typography/Text'
import { VendorAsOption } from '@components/VendorSelector/VendorAsOption'

import './vendorSelector.scss'

type VendorSelectorBaseProps = {
  selectedVendor: Vendor | null
  onSelectedVendorChange: (vendor: Vendor | null) => void

  label?: string
  placeholder?: string
  showLabel?: boolean

  isReadOnly?: boolean
  isInvalid?: boolean
  inline?: boolean

  className?: string
}

type VendorSelectorProps = VendorSelectorBaseProps & (
  | { isCreatable: true, onCreateVendor: (name: string) => void }
  | { isCreatable?: false, onCreateVendor?: (name: string) => void }
)

export function VendorSelector({
  selectedVendor,
  onSelectedVendorChange,
  label,
  placeholder,
  isCreatable,
  onCreateVendor,
  isReadOnly,
  isInvalid,
  inline,
  className,
  showLabel = true,
}: VendorSelectorProps) {
  const { t } = useTranslation()
  const resolvedLabel = label ?? t('customerVendor:label.vendor', 'Vendor')
  const combinedClassName = classNames(
    'Layer__VendorSelector',
    inline && 'Layer__VendorSelector--inline',
    className,
  )

  const { searchQuery, handleInputChange } = useDebouncedSearchInput({
    initialInputState: () => '',
  })

  const effectiveSearchQuery = searchQuery === '' ? undefined : searchQuery

  const { flattenedData, isLoading, isError } = useListVendors({ query: effectiveSearchQuery })

  const options = useMemo(() =>
    flattenedData?.map(vendor => new VendorAsOption(vendor)) ?? [],
  [flattenedData])

  const selectedVendorForComboBox = useMemo(
    () => selectedVendor === null
      ? null
      : { label: getVendorName(selectedVendor), value: selectedVendor.id },
    [selectedVendor],
  )

  const handleSelectionChange = useCallback(
    (selectedOption: { value: string } | null) => {
      handleInputChange('')

      if (selectedOption === null) {
        if (selectedVendor) onSelectedVendorChange(null)
        return
      }

      const selected = options.find(({ id }) => id === selectedOption.value)
      if (selected && selected.id !== selectedVendor?.id) {
        onSelectedVendorChange(selected.original)
      }
    },
    [options, handleInputChange, selectedVendor, onSelectedVendorChange],
  )

  const inputId = useId()
  const isLoadingWithoutFallback = isLoading && !flattenedData

  const slots = useMemo(() => ({
    EmptyMessage: (
      <P variant='subtle'>
        {isCreatable
          ? t('customerVendor:empty.type_to_add_vendor', 'Type a name to add a vendor')
          : t('customerVendor:empty.matching_vendors', 'No matching vendors')}
      </P>
    ),
    ErrorMessage: t('customerVendor:error.load_vendors', 'An error occurred while loading vendors.'),
  }), [t, isCreatable])

  const sharedProps = {
    selectedValue: selectedVendorForComboBox,
    onSelectedValueChange: handleSelectionChange,
    onInputValueChange: handleInputChange,
    inputId,
    placeholder,
    slots,
    isDisabled: isLoadingWithoutFallback || isError,
    isError,
    isInvalid,
    isLoading: isLoadingWithoutFallback,
    isReadOnly,
    isClearable: true,
    ['aria-label']: showLabel ? undefined : resolvedLabel,
  }

  const formatCreateLabel = useCallback((inputValue: string) =>
    inputValue
      ? t('customerVendor:action.create_named', 'Create "{{inputValue}}"', { inputValue })
      : t('customerVendor:action.create_unnamed', 'Create new'),
  [t],
  )

  const groups = useMemo(
    () => [{ label: t('customerVendor:label.vendors', 'Vendors'), options }],
    [t, options],
  )

  const isValidNewOption = useCallback((inputValue: string) => inputValue.trim().length > 0, [])

  const creatableProps = useMemo(
    () => isCreatable
      ? ({ isCreatable: true as const, onCreateOption: onCreateVendor, formatCreateLabel, isValidNewOption, groups })
      : ({ isCreatable: false as const, options }),
    [isCreatable, onCreateVendor, formatCreateLabel, isValidNewOption, groups, options],
  )

  return (
    <VStack className={combinedClassName}>
      {showLabel && <Label htmlFor={inputId} size='sm'>{resolvedLabel}</Label>}
      <MaybeCreatableComboBox {...sharedProps} {...creatableProps} />
    </VStack>
  )
}
