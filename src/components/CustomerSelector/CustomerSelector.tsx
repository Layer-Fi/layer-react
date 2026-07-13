import { useCallback, useId, useMemo } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { type Customer } from '@schemas/customer'
import { ApiEnumErrorType, isAPIErrorOfType } from '@utils/api/apiError'
import { getCustomerName } from '@utils/customerVendor'
import { useListCustomers } from '@hooks/api/businesses/[business-id]/customers/useListCustomers'
import { useDebouncedSearchInput } from '@hooks/utils/debouncing/useDebouncedSearchQuery'
import { MaybeCreatableComboBox } from '@ui/ComboBox/MaybeCreatableComboBox'
import { VStack } from '@ui/Stack/Stack'
import { Label, P } from '@ui/Typography/Text'

import './customerSelector.scss'

class CustomerAsOption {
  private internalCustomer: Customer

  constructor(customer: Customer) {
    this.internalCustomer = customer
  }

  get original() {
    return this.internalCustomer
  }

  get label() {
    return getCustomerName(this.internalCustomer)
  }

  get id() {
    return this.internalCustomer.id
  }

  get value() {
    return this.internalCustomer.id
  }
}

type CustomerSelectorBaseProps = {
  selectedCustomer: Customer | null
  onSelectedCustomerChange: (customer: Customer | null) => void

  label?: string
  placeholder?: string
  showLabel?: boolean

  isReadOnly?: boolean
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
  inline,
  className,
  hideSpecifiedIdNotFoundError,
  showLabel = true,
}: CustomerSelectorProps) {
  const { t } = useTranslation()
  const resolvedLabel = label ?? t('customerVendor:label.customer', 'Customer')
  const combinedClassName = classNames(
    'Layer__CustomerSelector',
    inline && 'Layer__CustomerSelector--inline',
    className,
  )

  const { searchQuery, handleInputChange } = useDebouncedSearchInput({
    initialInputState: () => '',
  })

  const effectiveSearchQuery = searchQuery === ''
    ? undefined
    : searchQuery

  const { flattenedData, isLoading, isError, error } = useListCustomers({ query: effectiveSearchQuery })
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

  const inputId = useId()

  const isLoadingWithoutFallback = isLoading && !flattenedData
  const shouldDisableComboBox = isLoadingWithoutFallback || isError

  const slots = useMemo(() => ({ EmptyMessage, ErrorMessage }), [EmptyMessage, ErrorMessage])

  const sharedProps = {
    selectedValue: selectedCustomerForComboBox,
    onSelectedValueChange: handleSelectionChange,
    onInputValueChange: handleInputChange,
    inputId,
    placeholder,
    slots,
    isDisabled: shouldDisableComboBox,
    isError: shouldShowError,
    isLoading: isLoadingWithoutFallback,
    isReadOnly,
    ['aria-label']: showLabel ? undefined : resolvedLabel,
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
    <VStack className={combinedClassName}>
      {showLabel && <Label htmlFor={inputId} size='sm'>{resolvedLabel}</Label>}
      <MaybeCreatableComboBox {...sharedProps} {...creatableProps} />
    </VStack>
  )
}
