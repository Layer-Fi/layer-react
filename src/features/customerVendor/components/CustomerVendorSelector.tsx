import { useCallback, useMemo } from 'react'
import { ComboBox, Collection } from 'react-aria-components'
import { useListCustomers } from '../../customers/api/useListCustomers'
import { useListVendors } from '../../vendors/api/useListVendors'
import { Label, P, Span } from '../../../components/ui/Typography/Text'
import { Button } from '../../../components/ui/Button/Button'
import { X, ChevronDown } from 'lucide-react'
import type { CustomerVendorSchema } from '../customerVendorSchemas'
import { InputGroup } from '../../../components/ui/Input/InputGroup'
import { Popover } from '../../../components/ui/Popover/Popover'
import { ListBox, ListBoxItem, ListBoxSection, ListBoxSectionHeader } from '../../../components/ui/ListBox/ListBox'
import { HStack, VStack } from '../../../components/ui/Stack/Stack'
import { useDebouncedSearchInput } from '../../../hooks/search/useDebouncedSearchQuery'
import { Input } from '../../../components/ui/Input/Input'

type CustomerVendor = typeof CustomerVendorSchema.Type

function getCustomerVendorName(
  customerVendor: Pick<CustomerVendor, 'individualName' | 'companyName' | 'externalId'>,
) {
  return customerVendor.individualName
    ?? customerVendor.companyName
    ?? customerVendor.externalId
    ?? 'Unknown'
}

type CustomerVendorSelectorProps = {
  selectedCustomerVendor: CustomerVendor | null
  onSelectedCustomerVendorChange: (customerVendor: CustomerVendor | null) => void

  isMutating?: boolean
  isReadOnly?: boolean
}

export function CustomerVendorSelector({
  selectedCustomerVendor,
  onSelectedCustomerVendorChange,

  isMutating,
  isReadOnly,
}: CustomerVendorSelectorProps) {
  const {
    inputValue,
    searchQuery,
    onInputChange,
  } = useDebouncedSearchInput({
    initialInputState: () => {
      if (selectedCustomerVendor === null) {
        return ''
      }

      return getCustomerVendorName(selectedCustomerVendor)
    },
  })

  const selectedCustomerVendorName = selectedCustomerVendor
    ? getCustomerVendorName(selectedCustomerVendor)
    : undefined

  const inputValueMatchesSelectedCustomerVendor = selectedCustomerVendor
    && inputValue === selectedCustomerVendorName

  const effectiveSearchQuery = searchQuery === '' || inputValueMatchesSelectedCustomerVendor
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

  const items = useMemo(
    () => {
      const customersSection = {
        label: 'Customers',
        id: 'CUSTOMER',
        secondParties: customerPages?.flatMap(({ data }) => data) ?? [],
      } as const

      const vendorsSection = {
        label: 'Vendors',
        id: 'VENDOR',
        secondParties: vendorPages?.flatMap(({ data }) => data) ?? [],
      } as const

      return [customersSection, vendorsSection]
        .filter(section => section.secondParties.length > 0)
    },
    [
      customerPages,
      vendorPages,
    ],
  )

  const selectedCustomerVendorId = selectedCustomerVendor?.id

  const handleSelectionChange = useCallback(
    (key: string | number | null) => {
      if (typeof key === 'number') {
        return
      }

      if (key === null) {
        if (selectedCustomerVendorId) {
          onSelectedCustomerVendorChange(null)
        }

        return
      }

      if (selectedCustomerVendor && key === selectedCustomerVendorId) {
        return
      }

      const customers = items.find(({ id }) => id === 'CUSTOMER')?.secondParties ?? []
      const selectedCustomer = customers.find(({ id }) => id === key)

      if (selectedCustomer) {
        const selectedCustomerWithType = { ...selectedCustomer, customerVendorType: 'CUSTOMER' } as const

        if (selectedCustomer.id !== selectedCustomerVendorId) {
          onSelectedCustomerVendorChange(selectedCustomerWithType)
        }

        return
      }

      const vendors = items.find(({ id }) => id === 'VENDOR')?.secondParties ?? []
      const selectedVendor = vendors.find(({ id }) => id === key)

      if (selectedVendor) {
        const selectedVendorWithType = { ...selectedVendor, customerVendorType: 'VENDOR' } as const

        if (selectedVendor.id !== selectedCustomerVendorId) {
          onSelectedCustomerVendorChange(selectedVendorWithType)
        }

        return
      }
    },
    [
      items,
      selectedCustomerVendor,
      selectedCustomerVendorId,
      onSelectedCustomerVendorChange,
    ],
  )

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

  type TItemDerived = typeof items extends ReadonlyArray<infer TItem>
    ? TItem
    : never

  const isLoadingCustomersWithoutFallback = isLoadingCustomers && !customerPages
  const isLoadingVendorsWithoutFallback = isLoadingVendors && !vendorPages

  const isLoadingWithoutFallback = isLoadingCustomersWithoutFallback || isLoadingVendorsWithoutFallback

  const shouldDisableComboBox = isLoadingWithoutFallback || isError

  return (
    <ComboBox
      items={items}
      selectedKey={selectedCustomerVendor?.id ?? null}

      isDisabled={shouldDisableComboBox}
      allowsEmptyCollection
      menuTrigger='focus'

      onSelectionChange={handleSelectionChange}
      onInputChange={onInputChange}
    >
      <Label
        pbe='3xs'
        size='sm'
      >
        Customer or Vendor
      </Label>
      <InputGroup actionCount={selectedCustomerVendor === null ? 1 : 2}>
        <Input
          inset
          placeholder='Add a customer or vendor...'
          placement='first'
        />
        {selectedCustomerVendor !== null
          ? (
            <Button
              slot={null}
              icon
              inset
              variant='ghost'
              isDisabled={shouldDisableComboBox}
              onPress={() => handleSelectionChange(null)}
            >
              <X size={16} />
            </Button>
          )
          : null}
        <Button
          icon
          inset
          variant='ghost'
          isPending={isLoadingWithoutFallback || isMutating}
        >
          <ChevronDown size={16} />
        </Button>
      </InputGroup>
      {isError
        ? (
          <HStack justify='end'>
            <P
              slot='errorMessage'
              pbs='3xs'
              size='xs'
              status='error'
            >
              An error occurred while loading customers and vendors
            </P>
          </HStack>
        )
        : null}
      <Popover
        /*
         * This is necessary until a bug in `react-aria-components` is fixed
         *
         * @see {https://github.com/adobe/react-spectrum/pull/7742}
         */
        shouldFlip={false}
        placement='bottom start'
        crossOffset={-10}
        offset={10}
      >
        <ListBox<TItemDerived>
          renderEmptyState={() => (
            <VStack pi='xs' pb='sm'>
              <P
                variant='subtle'
                nonAria
              >
                No matching customer or vendor found
              </P>
            </VStack>
          )}
        >
          {({
            id: sectionId,
            label: sectionLabel,
            secondParties,
          }) => (
            <ListBoxSection key={sectionId}>
              <ListBoxSectionHeader
                pb='2xs'
                size='sm'
              >
                {sectionLabel}
              </ListBoxSectionHeader>
              <Collection items={secondParties}>
                {({
                  id,
                  individualName,
                  companyName,
                  externalId,
                }) => {
                  const effectiveName = getCustomerVendorName({
                    individualName,
                    companyName,
                    externalId,
                  })

                  return (
                    <ListBoxItem
                      key={id}
                      id={id}
                      textValue={effectiveName}
                    >
                      <Span slot='label' weight='bold'>{effectiveName}</Span>
                    </ListBoxItem>
                  )
                }}
              </Collection>
            </ListBoxSection>
          )}
        </ListBox>
      </Popover>
    </ComboBox>
  )
}
