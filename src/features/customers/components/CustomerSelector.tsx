import { useCallback, useId, useMemo } from 'react'
import classNames from 'classnames'

import { type Customer } from '@schemas/customer'
import { useDebouncedSearchInput } from '@hooks/search/useDebouncedSearchQuery'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { VStack } from '@ui/Stack/Stack'
import { P } from '@ui/Typography/Text'
import { Label } from '@ui/Typography/Text'
import { useListCustomers } from '@features/customers/api/useListCustomers'
import { getCustomerName } from '@features/customers/util'

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

type CustomerSelectorProps = {
  selectedCustomer: Customer | null
  onSelectedCustomerChange: (customer: Customer | null) => void

  placeholder?: string

  isReadOnly?: boolean
  inline?: boolean

  className?: string
}

export function CustomerSelector({
  selectedCustomer,
  onSelectedCustomerChange,

  placeholder,

  isReadOnly,

  inline,

  className,
}: CustomerSelectorProps) {
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
        No matching customer
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
        An error occurred while loading customers.
      </P>
    ),
    [],
  )

  const inputId = useId()

  const isLoadingWithoutFallback = isLoading && !data
  const shouldDisableComboBox = isLoadingWithoutFallback || isError

  return (
    <VStack className={combinedClassName}>
      <Label htmlFor={inputId} size='sm'>Customer</Label>
      <ComboBox
        selectedValue={selectedCustomerForComboBox}
        onSelectedValueChange={handleSelectionChange}

        options={options}

        onInputValueChange={handleInputChange}

        inputId={inputId}
        placeholder={placeholder}
        slots={{ EmptyMessage, ErrorMessage }}

        isDisabled={shouldDisableComboBox}
        isError={isError}
        isLoading={isLoadingWithoutFallback}
        isReadOnly={isReadOnly}
      />
    </VStack>
  )
}
