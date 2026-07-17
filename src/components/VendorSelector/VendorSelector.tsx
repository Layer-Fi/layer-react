import { useCallback, useId, useMemo } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { type Vendor } from '@schemas/vendor'
import { getVendorName } from '@utils/vendor'
import { useListVendors } from '@hooks/api/businesses/[business-id]/vendors/useListVendors'
import { useDebouncedSearchInput } from '@hooks/utils/debouncing/useDebouncedSearchQuery'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { VStack } from '@ui/Stack/Stack'
import { Label, P } from '@ui/Typography/Text'
import { VendorAsOption } from '@components/VendorSelector/VendorAsOption'

import './vendorSelector.scss'

type VendorSelectorProps = {
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

export function VendorSelector({
  selectedVendor,
  onSelectedVendorChange,
  label,
  placeholder,
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

  return (
    <VStack className={combinedClassName}>
      {showLabel && <Label htmlFor={inputId} size='sm'>{resolvedLabel}</Label>}
      <ComboBox
        options={options}
        selectedValue={selectedVendorForComboBox}
        onSelectedValueChange={handleSelectionChange}
        onInputValueChange={handleInputChange}
        inputId={inputId}
        placeholder={placeholder}
        isDisabled={isLoadingWithoutFallback || isError}
        isError={isError}
        isInvalid={isInvalid}
        isLoading={isLoadingWithoutFallback}
        isReadOnly={isReadOnly}
        isClearable
        slots={{
          EmptyMessage: <P variant='subtle'>{t('customerVendor:empty.matching_vendors', 'No matching vendors')}</P>,
          ErrorMessage: t('customerVendor:error.load_vendors', 'An error occurred while loading vendors.'),
        }}
        aria-label={showLabel ? undefined : resolvedLabel}
      />
    </VStack>
  )
}
