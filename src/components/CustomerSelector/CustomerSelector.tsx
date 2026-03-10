import { useCallback, useId, useMemo } from 'react'
import classNames from 'classnames'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'

import { type Customer } from '@schemas/customer'
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

  placeholder?: string

  isReadOnly?: boolean
  inline?: boolean

  className?: string
}

type CustomerSelectorProps = CustomerSelectorBaseProps & (
  | { isCreatable: true, onCreateCustomer: (name: string) => void }
  | { isCreatable?: false, onCreateCustomer?: (name: string) => void }
)

const formatCreateLabel = (inputValue: string) => inputValue ? i18next.t('createCustomerInputvalue', 'Create customer "{{inputValue}}"', { inputValue }) : i18next.t('createNewCustomer', 'Create new customer')

export function CustomerSelector({
  selectedCustomer,
  onSelectedCustomerChange,
  placeholder,
  isCreatable,
  onCreateCustomer,
  isReadOnly,
  inline,
  className,
}: CustomerSelectorProps) {
  const { t } = useTranslation()
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

  const { data, isLoading, isError } = useListCustomers({ query: effectiveSearchQuery })

  const options = useMemo(() =>
    data?.flatMap(({ data }) => data).map(customer => new CustomerAsOption(customer)) || [],
  [data])

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
        {t('noMatchingCustomers', 'No matching customers')}
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
        {t('anErrorOccurredWhileLoadingCustomers', 'An error occurred while loading customers.')}
      </P>
    ),
    [t],
  )

  const inputId = useId()

  const isLoadingWithoutFallback = isLoading && !data
  const shouldDisableComboBox = isLoadingWithoutFallback || isError

  const sharedProps = {
    selectedValue: selectedCustomerForComboBox,
    onSelectedValueChange: handleSelectionChange,
    onInputValueChange: handleInputChange,
    inputId,
    placeholder,
    slots: { EmptyMessage, ErrorMessage },
    isDisabled: shouldDisableComboBox,
    isError,
    isLoading: isLoadingWithoutFallback,
    isReadOnly,
  }

  const creatableProps = isCreatable
    ? { isCreatable: true as const, onCreateOption: onCreateCustomer, formatCreateLabel, groups: [{ label: t('customers', 'Customers'), options }] }
    : { isCreatable: false as const, options }

  return (
    <VStack className={combinedClassName}>
      <Label htmlFor={inputId} size='sm'>{t('customer', 'Customer')}</Label>
      <MaybeCreatableComboBox {...sharedProps} {...creatableProps} />
    </VStack>
  )
}
