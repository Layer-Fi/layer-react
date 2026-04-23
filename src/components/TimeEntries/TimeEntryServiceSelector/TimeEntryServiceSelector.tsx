import { useCallback, useId, useMemo } from 'react'
import classNames from 'classnames'
import type { TFunction } from 'i18next'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type CatalogService } from '@schemas/catalogService'
import { useListCatalogServices } from '@hooks/api/businesses/[business-id]/catalog/services/useListCatalogServices'
import { MaybeCreatableComboBox } from '@ui/ComboBox/MaybeCreatableComboBox'
import { VStack } from '@ui/Stack/Stack'
import { Label, P, Span } from '@ui/Typography/Text'

import './timeEntryServiceSelector.scss'

function getServiceLabel(service: CatalogService, t: TFunction): string {
  return service.archivedAt
    ? t('timeTracking:services.archived_service', '{{name}} (Archived)', { name: service.name })
    : service.name
}

class ServiceAsOption {
  private internalService: CatalogService
  private t: TFunction

  constructor(service: CatalogService, t: TFunction) {
    this.internalService = service
    this.t = t
  }

  get original() {
    return this.internalService
  }

  get label() {
    return getServiceLabel(this.internalService, this.t)
  }

  get id() {
    return this.internalService.id
  }

  get value() {
    return this.internalService.id
  }
}

type TimeEntryServiceSelectorSharedProps = {
  selectedServiceId: string | null
  onSelectedServiceIdChange: (serviceId: string | null) => void
  placeholder?: string
  isReadOnly?: boolean
  isClearable?: boolean
  inline?: boolean
  className?: string
  showLabel?: boolean
}

type TimeEntryServiceSelectorProps =
  | (TimeEntryServiceSelectorSharedProps & {
    isCreatable: true
    onCreateService: (name: string) => void
    allowArchived?: never
  })
  | (TimeEntryServiceSelectorSharedProps & {
    isCreatable?: false
    onCreateService?: (name: string) => void
    allowArchived?: boolean
  })

const formatCreateLabel = (inputValue: string, t: TFunction) => (
  <Span variant='inherit' className='Layer__TimeEntryServiceSelector__CreateLabel'>
    <Plus size={14} aria-hidden='true' />
    {inputValue
      ? t('timeTracking:services.create_service_input_value', 'Create service "{{inputValue}}"', { inputValue })
      : t('timeTracking:services.add_service', 'Add service')}
  </Span>
)

export function TimeEntryServiceSelector({
  selectedServiceId,
  onSelectedServiceIdChange,
  placeholder,
  isReadOnly,
  isClearable,
  inline,
  className,
  showLabel = true,
  allowArchived,
  isCreatable,
  onCreateService,
}: TimeEntryServiceSelectorProps) {
  const { t } = useTranslation()

  const { data: servicesResponse, isLoading, isError } = useListCatalogServices({ allowArchived })

  const isLoadingWithoutFallback = isLoading && !servicesResponse
  const shouldDisableComboBox = isLoadingWithoutFallback || isError

  const serviceOptions = useMemo<ServiceAsOption[]>(
    () => servicesResponse?.data.map(service => new ServiceAsOption(service, t)) ?? [],
    [servicesResponse, t],
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
