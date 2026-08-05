import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { type Customer } from '@schemas/features/customerVendor/customer'
import { getCustomerName } from '@utils/features/customerVendor/customer'
import { ApiEnumErrorType, isAPIErrorOfType } from '@utils/shared/api/apiError'
import { useDebouncedSearchInput } from '@hooks/utils/debouncing/useDebouncedSearchQuery'
import { useGetListCustomers } from '@api/businesses/[business-id]/customers/get'
import { MaybeCreatableComboBox } from '@ui/ComboBox/MaybeCreatableComboBox'
import { P } from '@ui/Typography/Text'
import { ComboBoxField } from '@blocks/Form/ComboBoxField'
import { CustomerAsOption } from '@features/customerVendor/CustomerSelector/CustomerAsOption'

type CustomerSelectorBaseProps = {
  selectedCustomer: Customer | null
  onSelectedCustomerChange: (customer: Customer | null) => void

  label?: string
  placeholder?: string
  showLabel?: boolean

  isReadOnly?: boolean
  isInvalid?: boolean
  inline?: boolean

  className?: string
  hideSpecifiedIdNotFoundError?: boolean
}

type CustomerSelectorProps = CustomerSelectorBaseProps & (
  | { isCreatable: true, onCreateCustomer: (name: string) => void }
  | { isCreatable?: false, onCreateCustomer?: (name: string) => void }
)

export function CustomerSelector({
  selectedCustomer,
  onSelectedCustomerChange,
  label,
  placeholder,
  isCreatable,
  onCreateCustomer,
  isReadOnly,
  isInvalid,
  inline,
  className,
  hideSpecifiedIdNotFoundError,
  showLabel = true,
}: CustomerSelectorProps) {
  const { t } = useTranslation()
  const resolvedLabel = label ?? t('customerVendor:label.customer', 'Customer')

  const { searchQuery, handleInputChange } = useDebouncedSearchInput({
    initialInputState: () => '',
  })

  const effectiveSearchQuery = searchQuery === ''
    ? undefined
    : searchQuery

  const { flattenedData, isLoading, isError, error } = useGetListCustomers({ query: effectiveSearchQuery })
  const shouldHideError = hideSpecifiedIdNotFoundError && isAPIErrorOfType(error, ApiEnumErrorType.SpecifiedIdNotFound)
  const shouldShowError = isError && !shouldHideError

  const options = useMemo(() =>
    flattenedData?.map(customer => new CustomerAsOption(customer)) || [],
  [flattenedData])

  const selectedCustomerId = selectedCustomer?.id

  const handleSelectionChange = useCallback(
    (selectedOption: { value: string } | null) => {
      if (selectedOption === null) {
        handleInputChange('')

        if (selectedCustomerId) {
          onSelectedCustomerChange(null)
        }

        return
      }

      const selectedCustomer = options.find(({ id }) => id === selectedOption.value)

      if (selectedCustomer) {
        const selectedCustomerWithType = selectedCustomer.original

        if (selectedCustomer.id !== selectedCustomerId) {
          onSelectedCustomerChange(selectedCustomerWithType)
        }

        handleInputChange('')

        return
      }
    },
    [options, handleInputChange, selectedCustomerId, onSelectedCustomerChange],
  )

  const selectedCustomerForComboBox = useMemo(
    () => {
      if (selectedCustomer === null) {
        return null
      }

      return {
        label: getCustomerName(selectedCustomer),
        value: selectedCustomer.id,
      }
    },
    [selectedCustomer],
  )

  const EmptyMessage = useMemo(
    () => (
      <P variant='subtle'>
        {t('customerVendor:empty.matching_customers', 'No matching customers')}
      </P>
    ),
    [t],
  )

  const ErrorMessage = t('customerVendor:error.load_customers', 'An error occurred while loading customers.')

  const isLoadingWithoutFallback = isLoading && !flattenedData
  const shouldDisableComboBox = isLoadingWithoutFallback || isError

  const slots = useMemo(() => ({ EmptyMessage, ErrorMessage }), [EmptyMessage, ErrorMessage])

  const sharedProps = {
    selectedValue: selectedCustomerForComboBox,
    onSelectedValueChange: handleSelectionChange,
    onInputValueChange: handleInputChange,
    placeholder,
    slots,
    isDisabled: shouldDisableComboBox,
    isError: shouldShowError,
    isInvalid,
    isLoading: isLoadingWithoutFallback,
    isReadOnly,
  }

  const formatCreateLabel = useCallback((inputValue: string) =>
    inputValue
      ? t('customerVendor:action.create_customer_input_value', 'Create customer "{{inputValue}}"', { inputValue })
      : t('customerVendor:action.create_new_customer', 'Create new customer'),
  [t],
  )

  const groups = useMemo(
    () => [{ label: t('customerVendor:label.customers', 'Customers'), options }],
    [t, options],
  )

  const creatableProps = useMemo(
    () => isCreatable
      ? ({ isCreatable: true as const, onCreateOption: onCreateCustomer, formatCreateLabel, groups })
      : ({ isCreatable: false as const, options }),
    [isCreatable, onCreateCustomer, formatCreateLabel, groups, options],
  )

  return (
    <ComboBoxField label={resolvedLabel} className={className} inline={inline} showLabel={showLabel}>
      {controlProps => <MaybeCreatableComboBox {...controlProps} {...sharedProps} {...creatableProps} />}
    </ComboBoxField>
  )
}
