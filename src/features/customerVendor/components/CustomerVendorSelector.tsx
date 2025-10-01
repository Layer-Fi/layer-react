import { useCallback, useId, useMemo } from 'react'
import { useListCustomers } from '../../customers/api/useListCustomers'
import { useListVendors } from '../../vendors/api/useListVendors'
import type { CustomerVendorSchema } from '../customerVendorSchemas'
import { useDebouncedSearchInput } from '../../../hooks/search/useDebouncedSearchQuery'
import { ComboBox } from '../../../components/ui/ComboBox/ComboBox'
import { P } from '../../../components/ui/Typography/Text'
import { HStack, VStack } from '../../../components/ui/Stack/Stack'
import { Label } from '../../../components/ui/Typography/Text'

type CustomerVendor = typeof CustomerVendorSchema.Type

function getCustomerVendorName(
  customerVendor: Pick<CustomerVendor, 'individualName' | 'companyName' | 'externalId' | 'customerVendorType'>,
) {
  return customerVendor.individualName
    ?? customerVendor.companyName
    ?? customerVendor.externalId
    ?? `Unknown ${customerVendor.customerVendorType === 'CUSTOMER' ? 'Customer' : 'Vendor'}`
}

class CustomerVendorAsOption {
  private internalCustomerVendor: CustomerVendor

  constructor(customerVendor: CustomerVendor) {
    this.internalCustomerVendor = customerVendor
  }

  get original() {
    return this.internalCustomerVendor
  }

  get label() {
    return getCustomerVendorName(this.internalCustomerVendor)
  }

  get id() {
    return this.internalCustomerVendor.id
  }

  get value() {
    return this.internalCustomerVendor.id
  }
}

type CustomerVendorSelectorProps = {
  selectedCustomerVendor: CustomerVendor | null
  onSelectedCustomerVendorChange: (customerVendor: CustomerVendor | null) => void

  placeholder: string

  isMutating?: boolean
  isReadOnly?: boolean
  showLabel?: boolean
}

export function CustomerVendorSelector({
  selectedCustomerVendor,
  onSelectedCustomerVendorChange,

  placeholder,

  isMutating,
  isReadOnly,
  showLabel = true,
}: CustomerVendorSelectorProps) {
  const {
    searchQuery,
    handleInputChange,
  } = useDebouncedSearchInput({
    initialInputState: () => '',
  })

  const effectiveSearchQuery = searchQuery === ''
    ? undefined
    : searchQuery

  const {
    data: customerPages,
    isLoading: isLoadingCustomers,
    isError: isErrorLoadingCustomers,
  } = useListCustomers({ query: effectiveSearchQuery })
  const {
    data: vendorPages,
    isLoading: isLoadingVendors,
    isError: isErrorLoadingVendors,
  } = useListVendors({ query: effectiveSearchQuery })

  const groups = useMemo(
    () => {
      const customersSection = customerPages
        ? {
          label: 'Customers',
          id: 'CUSTOMER',
          options: customerPages
            .flatMap(({ data }) => data)
            .map(customer => new CustomerVendorAsOption({ ...customer, customerVendorType: 'CUSTOMER' })),
        } as const
        : null

      const vendorsSection = vendorPages
        ? {
          label: 'Vendors',
          id: 'VENDOR',
          options: vendorPages
            .flatMap(({ data }) => data)
            .map(vendor => new CustomerVendorAsOption({ ...vendor, customerVendorType: 'VENDOR' })),
        } as const
        : null

      return [customersSection, vendorsSection]
        .filter(
          (section): section is NonNullable<typeof section> =>
            section !== null
            && section.options.length > 0,
        )
    },
    [
      customerPages,
      vendorPages,
    ],
  )

  const selectedCustomerVendorId = selectedCustomerVendor?.id

  const handleSelectionChange = useCallback(
    (selectedOption: { value: string } | null) => {
      if (selectedOption === null) {
        handleInputChange('')

        if (selectedCustomerVendorId) {
          onSelectedCustomerVendorChange(null)
        }

        return
      }

      const customers = groups.find(({ id }) => id === 'CUSTOMER')?.options ?? []
      const selectedCustomer = customers.find(({ id }) => id === selectedOption.value)

      if (selectedCustomer) {
        const selectedCustomerWithType = selectedCustomer.original

        if (selectedCustomer.id !== selectedCustomerVendorId) {
          onSelectedCustomerVendorChange(selectedCustomerWithType)
        }

        handleInputChange('')

        return
      }

      const vendors = groups.find(({ id }) => id === 'VENDOR')?.options ?? []
      const selectedVendor = vendors.find(({ id }) => id === selectedOption.value)

      if (selectedVendor) {
        const selectedVendorWithType = selectedVendor.original

        if (selectedVendor.id !== selectedCustomerVendorId) {
          onSelectedCustomerVendorChange(selectedVendorWithType)
        }

        handleInputChange('')

        return
      }
    },
    [
      groups,
      selectedCustomerVendorId,
      handleInputChange,
      onSelectedCustomerVendorChange,
    ],
  )

  const selectedCustomerVendorForComboBox = useMemo(
    () => {
      if (selectedCustomerVendor === null) {
        return null
      }

      return {
        label: getCustomerVendorName(selectedCustomerVendor),
        value: selectedCustomerVendor.id,
      }
    },
    [selectedCustomerVendor],
  )

  const EmptyMessage = useMemo(
    () => (
      <P variant='subtle'>
        No matching customer or vendor found
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
        An error occurred while loading customer and vendor options.
      </P>
    ),
    [],
  )

  const inputId = useId()

  const isFiltered = effectiveSearchQuery !== undefined

  const isLoading = isLoadingCustomers || isLoadingVendors
  const isError = isErrorLoadingCustomers || isErrorLoadingVendors

  const noSecondPartiesExist = !isLoading
    && !isFiltered
    && customerPages !== undefined
    && vendorPages !== undefined
    && customerPages.every(({ data }) => data.length === 0)
    && vendorPages.every(({ data }) => data.length === 0)

  const shouldHideComponent = noSecondPartiesExist || (isReadOnly && selectedCustomerVendor === null)

  if (shouldHideComponent) {
    /*
     * If there are no existing customers or vendors, the selector is pointless.
     *
     * This behavior will change when we support directly adding customers and vendors.
     */
    return null
  }

  const isLoadingCustomersWithoutFallback = isLoadingCustomers && !customerPages
  const isLoadingVendorsWithoutFallback = isLoadingVendors && !vendorPages

  const isLoadingWithoutFallback = isLoadingCustomersWithoutFallback || isLoadingVendorsWithoutFallback

  const shouldDisableComboBox = isLoadingWithoutFallback || isError

  return (
    <VStack gap='3xs' className='Layer__CustomerVendorSelector'>
      {showLabel && (
        <HStack justify='start' align='baseline' gap='lg'>
          <Label
            htmlFor={inputId}
            size='sm'
          >
            Customer or Vendor
          </Label>
          {isMutating
            ? (
              <P
                size='xs'
                variant='subtle'
              >
                Saving...
              </P>
            )
            : null}
        </HStack>
      )}
      <ComboBox
        selectedValue={selectedCustomerVendorForComboBox}
        onSelectedValueChange={handleSelectionChange}

        groups={groups}

        onInputValueChange={handleInputChange}

        inputId={inputId}
        placeholder={placeholder}
        slots={{ EmptyMessage, ErrorMessage }}

        isDisabled={isReadOnly || shouldDisableComboBox}
        isError={isError}
        isLoading={isLoadingWithoutFallback}
        aria-label={showLabel ? undefined : 'Customer or Vendor'}
      />
    </VStack>
  )
}
