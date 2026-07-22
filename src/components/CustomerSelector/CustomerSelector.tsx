import { useCallback, useId, useMemo } from 'react'
import classNames from 'classnames'
import { Schema } from 'effect'
import { useTranslation } from 'react-i18next'

import { type Customer, UpsertCustomerSchema } from '@schemas/customer'
import { ApiEnumErrorType, isAPIErrorOfType } from '@utils/api/apiError'
import { getCustomerName } from '@utils/customer'
import { useListCustomers } from '@hooks/api/businesses/[business-id]/customers/useListCustomers'
import { UpsertCustomerMode, useUpsertCustomer } from '@hooks/api/businesses/[business-id]/customers/useUpsertCustomer'
import { useDebouncedSearchInput } from '@hooks/utils/debouncing/useDebouncedSearchQuery'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { MaybeCreatableComboBox } from '@ui/ComboBox/MaybeCreatableComboBox'
import { VStack } from '@ui/Stack/Stack'
import { Label, P } from '@ui/Typography/Text'
import { CustomerAsOption } from '@components/CustomerSelector/CustomerAsOption'

import './customerSelector.scss'

const encodeUpsertCustomer = Schema.encodeSync(UpsertCustomerSchema)

type CustomerSelectorProps = {
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

  isCreatable?: boolean
  // When creatable and provided, called with the typed text so the consumer can run its own create flow
  // (e.g. open a form). When omitted, the selector creates the customer itself from the typed name.
  onCreateCustomer?: (name: string) => void
}

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

  // Creation is gated on the business config flag here rather than by callers, so every consumer stays consistent.
  const { accountingConfiguration } = useLayerContext()
  const canCreate = isCreatable === true && accountingConfiguration?.enableCustomerManagement === true
  // Self-create means the selector owns creation (no external handler). The create mutation shares an SWR
  // key with CustomerForm, so only surface its error/busy state when we're the one creating.
  const isSelfCreate = canCreate && onCreateCustomer === undefined
  const {
    trigger: createCustomer,
    isError: isCreateError,
    isMutating: isCreatingCustomer,
    reset: resetCreateError,
  } = useUpsertCustomer({ mode: UpsertCustomerMode.Create })
  const showCreateError = isSelfCreate && isCreateError
  const isCreating = isSelfCreate && isCreatingCustomer

  const options = useMemo(() =>
    flattenedData?.map(customer => new CustomerAsOption(customer)) || [],
  [flattenedData])

  const selectedCustomerId = selectedCustomer?.id

  const handleSelectionChange = useCallback(
    (selectedOption: { value: string } | null) => {
      resetCreateError()

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
    [options, handleInputChange, selectedCustomerId, onSelectedCustomerChange, resetCreateError],
  )

  const handleCreate = useCallback(async (name: string) => {
    if (onCreateCustomer) {
      onCreateCustomer(name)
      return
    }

    const individualName = name.trim()
    if (!individualName) return

    // Resolve to undefined (instead of throwing) on failure; isCreateError drives the combobox error message.
    const created = await createCustomer(encodeUpsertCustomer({ individualName }), { throwOnError: false })
    if (created) onSelectedCustomerChange(created)
  }, [onCreateCustomer, createCustomer, onSelectedCustomerChange])

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
        {isSelfCreate
          ? t('customerVendor:empty.type_to_add_customer', 'Type a name to add a customer')
          : t('customerVendor:empty.matching_customers', 'No matching customers')}
      </P>
    ),
    [t, isSelfCreate],
  )

  const ErrorMessage = showCreateError
    ? t('customerVendor:error.create_customer', 'Could not create customer. Please try again.')
    : t('customerVendor:error.load_customers', 'An error occurred while loading customers.')

  const inputId = useId()

  const isLoadingWithoutFallback = isLoading && !flattenedData
  const shouldDisableComboBox = isLoadingWithoutFallback || isError || isCreating

  const slots = useMemo(() => ({ EmptyMessage, ErrorMessage }), [EmptyMessage, ErrorMessage])

  const sharedProps = {
    selectedValue: selectedCustomerForComboBox,
    onSelectedValueChange: handleSelectionChange,
    onInputValueChange: handleInputChange,
    inputId,
    placeholder,
    slots,
    isDisabled: shouldDisableComboBox,
    isError: shouldShowError || showCreateError,
    isInvalid,
    isLoading: isLoadingWithoutFallback,
    isMutating: isCreating,
    isReadOnly,
    ['aria-label']: showLabel ? undefined : resolvedLabel,
  }

  const formatCreateLabel = useCallback((inputValue: string) =>
    inputValue
      ? t('customerVendor:action.create_named', 'Create "{{inputValue}}"', { inputValue })
      : t('customerVendor:action.create_new_customer', 'Create new customer'),
  [t],
  )

  const groups = useMemo(
    () => [{ label: t('customerVendor:label.customers', 'Customers'), options }],
    [t, options],
  )

  // Consumers that run their own create flow (e.g. a drawer) can create with no typed name; self-create needs text.
  const isValidNewOption = useCallback(
    (inputValue: string) => onCreateCustomer != null || inputValue.trim().length > 0,
    [onCreateCustomer],
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
