import { useCallback, useId, useMemo } from 'react'
import classNames from 'classnames'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import { type CatalogService } from '@schemas/catalogService'
import { useListCatalogServices } from '@hooks/api/businesses/[business-id]/catalog/services/useListCatalogServices'
import { MaybeCreatableComboBox } from '@ui/ComboBox/MaybeCreatableComboBox'
import { VStack } from '@ui/Stack/Stack'
import { Label, P } from '@ui/Typography/Text'

import './timeEntryServiceSelector.scss'

class ServiceAsOption {
  private internalService: CatalogService

  constructor(service: CatalogService) {
    this.internalService = service
  }

  get original() {
    return this.internalService
  }

  get label() {
    return this.internalService.name
  }

  get id() {
    return this.internalService.id
  }

  get value() {
    return this.internalService.id
  }
}

type TimeEntryServiceSelectorBaseProps = {
  selectedServiceId: string | null
  onSelectedServiceIdChange: (serviceId: string | null) => void
  placeholder?: string
  isReadOnly?: boolean
  isClearable?: boolean
  inline?: boolean
  className?: string
  showLabel?: boolean
}

type TimeEntryServiceSelectorProps = TimeEntryServiceSelectorBaseProps & (
  | { isCreatable: true, onCreateService: (name: string) => void }
  | { isCreatable?: false, onCreateService?: (name: string) => void }
)

const formatCreateLabel = (inputValue: string, t: TFunction) =>
  inputValue
    ? t('timeTracking:services.create_service_input_value', 'Create service "{{inputValue}}"', { inputValue })
    : t('timeTracking:services.add_service', 'Add service')

export function TimeEntryServiceSelector({
  selectedServiceId,
  onSelectedServiceIdChange,
  placeholder,
  isReadOnly,
  isClearable,
  inline,
  className,
  showLabel = true,
  isCreatable,
  onCreateService,
}: TimeEntryServiceSelectorProps) {
  const { t } = useTranslation()

  const { data: servicesResponse, isLoading, isError } = useListCatalogServices()

  const isLoadingWithoutFallback = isLoading && !servicesResponse
  const shouldDisableComboBox = isLoadingWithoutFallback || isError

  const serviceOptions = useMemo<ServiceAsOption[]>(
    () => servicesResponse?.data.map(service => new ServiceAsOption(service)) ?? [],
    [servicesResponse],
  )

  const combinedClassName = classNames(
    'Layer__TimeEntryServiceSelector',
    inline && 'Layer__TimeEntryServiceSelector--inline',
    className,
  )

  const handleSelectionChange = useCallback(
    (selectedOption: ServiceAsOption | null) => {
      onSelectedServiceIdChange(selectedOption?.id ?? null)
    },
    [onSelectedServiceIdChange],
  )

  const selectedServiceForComboBox = useMemo(
    () => {
      if (!selectedServiceId) {
        return null
      }

      return serviceOptions.find(option => option.id === selectedServiceId) ?? null
    },
    [serviceOptions, selectedServiceId],
  )

  const EmptyMessage = useMemo(
    () => (
      <P variant='subtle'>
        {t('timeTracking:label.no_services', 'No services available')}
      </P>
    ),
    [t],
  )

  const ErrorMessage = useMemo(
    () => {
      if (!isError) {
        return null
      }

      return (
        <P size='xs' status='error'>
          {t('timeTracking:error.load_services', 'Failed to load services.')}
        </P>
      )
    },
    [isError, t],
  )

  const inputId = useId()

  const sharedProps = {
    selectedValue: selectedServiceForComboBox,
    onSelectedValueChange: handleSelectionChange,
    inputId,
    className: 'Layer__TimeEntryServiceSelector__Input',
    placeholder: placeholder ?? t('timeTracking:label.select_service', 'Select a service'),
    slots: { EmptyMessage, ErrorMessage },
    isClearable,
    isDisabled: shouldDisableComboBox,
    isError,
    isLoading: isLoadingWithoutFallback,
    isReadOnly,
    ['aria-label']: showLabel ? undefined : t('timeTracking:label.service', 'Service'),
  }

  const creatableProps = isCreatable
    ? {
      isCreatable: true as const,
      onCreateOption: onCreateService,
      formatCreateLabel: (inputValue: string) => formatCreateLabel(inputValue, t),
      groups: [{ label: t('timeTracking:services.title', 'Services'), options: serviceOptions }],
    }
    : { isCreatable: false as const, options: serviceOptions }

  return (
    <VStack className={combinedClassName}>
      {showLabel && <Label htmlFor={inputId} size='sm'>{t('timeTracking:label.service', 'Service')}</Label>}
      <MaybeCreatableComboBox {...sharedProps} {...creatableProps} />
    </VStack>
  )
}
