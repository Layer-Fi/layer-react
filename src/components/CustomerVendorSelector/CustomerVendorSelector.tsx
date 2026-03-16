import { useCallback, useId, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type { CustomerVendorSchema } from '@schemas/customerVendor'
import { useListCustomers } from '@hooks/api/businesses/[business-id]/customers/useListCustomers'
import { useListVendors } from '@hooks/api/businesses/[business-id]/vendors/useListVendors'
import { useDebouncedSearchInput } from '@hooks/utils/debouncing/useDebouncedSearchQuery'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { HStack, VStack } from '@ui/Stack/Stack'
import { P } from '@ui/Typography/Text'
import { Label } from '@ui/Typography/Text'

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
  const { t } = useTranslation()
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
          label: t('customerVendor:customers', 'Customers'),
          id: 'CUSTOMER',
          options: customerPages
            .flatMap(({ data }) => data)
            .map(customer => new CustomerVendorAsOption({ ...customer, customerVendorType: 'CUSTOMER' })),
        } as const
        : null

      const vendorsSection = vendorPages
        ? {
          label: t('customerVendor:vendors', 'Vendors'),
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
      t,
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
        {t('customerVendor:noMatchingCustomersOrVendorsFound', 'No matching customers or vendors found')}
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
        {t('customerVendor:anErrorOccurredWhileLoadingCustomerAndVendorOptions', 'An error occurred while loading customer and vendor options.')}
      </P>
    ),
    [t],
  )

  const inputId = useId()

  const isError = isErrorLoadingCustomers || isErrorLoadingVendors

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
            {t('customerVendor:customerOrVendor', 'Customer or Vendor')}
          </Label>
          {isMutating
            ? (
              <P
                size='xs'
                variant='subtle'
              >
                {t('common:saving', 'Saving...')}
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
        aria-label={showLabel ? undefined : t('customerVendor:customerOrVendor', 'Customer or Vendor')}
      />
    </VStack>
  )
}
