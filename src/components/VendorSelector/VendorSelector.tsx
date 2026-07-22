import { useCallback, useId, useMemo } from 'react'
import classNames from 'classnames'
import { Schema } from 'effect'
import { useTranslation } from 'react-i18next'

import { UpsertVendorSchema, type Vendor } from '@schemas/vendor'
import { getVendorName } from '@utils/vendor'
import { useListVendors } from '@hooks/api/businesses/[business-id]/vendors/useListVendors'
import { UpsertVendorMode, useUpsertVendor } from '@hooks/api/businesses/[business-id]/vendors/useUpsertVendor'
import { useDebouncedSearchInput } from '@hooks/utils/debouncing/useDebouncedSearchQuery'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { MaybeCreatableComboBox } from '@ui/ComboBox/MaybeCreatableComboBox'
import { VStack } from '@ui/Stack/Stack'
import { Label, P } from '@ui/Typography/Text'
import { VendorAsOption } from '@components/VendorSelector/VendorAsOption'

import './vendorSelector.scss'

const encodeUpsertVendor = Schema.encodeSync(UpsertVendorSchema)

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

  isCreatable?: boolean
  // When creatable and provided, called with the typed text so the consumer can run its own create flow.
  // When omitted, the selector creates the vendor itself from the typed name.
  onCreateVendor?: (name: string) => void
}

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

  const { accountingConfiguration } = useLayerContext()
  const canCreate = isCreatable === true && accountingConfiguration?.enableVendorManagement === true
  // The create mutation's SWR state is shared with other consumers of the hook, so only
  // surface it when the selector owns creation.
  const isSelfCreate = canCreate && onCreateVendor === undefined
  const {
    trigger: createVendor,
    isError: isCreateError,
    isMutating: isCreatingVendor,
    reset: resetCreateError,
  } = useUpsertVendor({ mode: UpsertVendorMode.Create })
  const showCreateError = isSelfCreate && isCreateError
  const isCreating = isSelfCreate && isCreatingVendor

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
      resetCreateError()

      if (selectedOption === null) {
        if (selectedVendor) onSelectedVendorChange(null)
        return
      }

      const selected = options.find(({ id }) => id === selectedOption.value)
      if (selected && selected.id !== selectedVendor?.id) {
        onSelectedVendorChange(selected.original)
      }
    },
    [options, handleInputChange, selectedVendor, onSelectedVendorChange, resetCreateError],
  )

  const handleCreate = useCallback(async (name: string) => {
    if (onCreateVendor) {
      onCreateVendor(name)
      return
    }

    const companyName = name.trim()
    if (!companyName) return

    const created = await createVendor(encodeUpsertVendor({ companyName }), { throwOnError: false })
    if (created) onSelectedVendorChange(created)
  }, [onCreateVendor, createVendor, onSelectedVendorChange])

  const inputId = useId()
  const isLoadingWithoutFallback = isLoading && !flattenedData

  const slots = useMemo(() => ({
    EmptyMessage: (
      <P variant='subtle'>
        {isSelfCreate
          ? t('customerVendor:empty.type_to_add_vendor', 'Type a name to add a vendor')
          : t('customerVendor:empty.matching_vendors', 'No matching vendors')}
      </P>
    ),
    ErrorMessage: showCreateError
      ? t('customerVendor:error.create_vendor', 'Could not create vendor. Please try again.')
      : t('customerVendor:error.load_vendors', 'An error occurred while loading vendors.'),
  }), [t, isSelfCreate, showCreateError])

  const sharedProps = {
    selectedValue: selectedVendorForComboBox,
    onSelectedValueChange: handleSelectionChange,
    onInputValueChange: handleInputChange,
    inputId,
    placeholder,
    slots,
    isDisabled: isLoadingWithoutFallback || isError || isCreating,
    isError: isError || showCreateError,
    isInvalid,
    isLoading: isLoadingWithoutFallback,
    isMutating: isCreating,
    isReadOnly,
    isClearable: true,
    ['aria-label']: showLabel ? undefined : resolvedLabel,
  }

  const formatCreateLabel = useCallback((inputValue: string) =>
    inputValue
      ? t('customerVendor:action.create_named', 'Create "{{inputValue}}"', { inputValue })
      : t('customerVendor:action.create_new_vendor', 'Create new vendor'),
  [t],
  )

  const groups = useMemo(
    () => [{ label: t('customerVendor:label.vendors', 'Vendors'), options }],
    [t, options],
  )

  // External create flows (e.g. a drawer) may open with no typed name; self-create needs text.
  const isValidNewOption = useCallback(
    (inputValue: string) => onCreateVendor != null || inputValue.trim().length > 0,
    [onCreateVendor],
  )

  const creatableProps = useMemo(
    () => canCreate
      ? ({ isCreatable: true as const, onCreateOption: (name: string) => void handleCreate(name), formatCreateLabel, isValidNewOption, groups })
      : ({ isCreatable: false as const, options }),
    [canCreate, handleCreate, formatCreateLabel, isValidNewOption, groups, options],
  )

  return (
    <VStack className={combinedClassName}>
      {showLabel && <Label htmlFor={inputId} size='sm'>{resolvedLabel}</Label>}
      <MaybeCreatableComboBox {...sharedProps} {...creatableProps} />
    </VStack>
  )
}
