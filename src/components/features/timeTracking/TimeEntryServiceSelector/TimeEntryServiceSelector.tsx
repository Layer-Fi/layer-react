import { useCallback, useMemo } from 'react'
import type { TFunction } from 'i18next'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type CatalogService } from '@schemas/features/timeTracking/catalogService'
import { ApiEnumErrorType, isAPIErrorOfType } from '@utils/shared/api/apiError'
import { createLegacyFieldClassNames } from '@utils/shared/styles/legacyClassNames'
import { useGetListCatalogServices } from '@api/businesses/[business-id]/catalog/services/get'
import { MaybeCreatableComboBox } from '@ui/ComboBox/MaybeCreatableComboBox'
import { P, Span } from '@ui/Typography/Text'
import { ComboBoxField } from '@blocks/Form/ComboBoxField'

import './timeEntryServiceSelector.scss'

const legacyFieldClassNames = createLegacyFieldClassNames('Layer__TimeEntryServiceSelector', 'Layer__TimeEntryServiceSelector--inline')

function getServiceLabel(service: CatalogService, t: TFunction): string {
  return service.archivedAt
    ? t('timeTracking:TimeEntryServiceSelector.services.archived_service', '{{name}} (Archived)', { name: service.name })
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
  hideSpecifiedIdNotFoundError?: boolean
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
  <Span className='Layer__TimeEntryServiceSelector__CreateLabel'>
    <Plus size={14} aria-hidden='true' />
    {inputValue
      ? t('timeTracking:TimeEntryServiceSelector.services.create_service_input_value', 'Create service "{{inputValue}}"', { inputValue })
      : t('timeTracking:TimeEntryServiceSelector.services.add_service', 'Add service')}
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
  hideSpecifiedIdNotFoundError,
  allowArchived,
  isCreatable,
  onCreateService,
}: TimeEntryServiceSelectorProps) {
  const { t } = useTranslation()

  const { flattenedData: servicesResponse, isLoading, isError, error } = useGetListCatalogServices({ allowArchived })

  const isLoadingWithoutFallback = isLoading && !servicesResponse
  const shouldHideError = hideSpecifiedIdNotFoundError && isAPIErrorOfType(error, ApiEnumErrorType.SpecifiedIdNotFound)
  const shouldShowError = isError && !shouldHideError
  const shouldDisableComboBox = isLoadingWithoutFallback || isError

  const serviceOptions = useMemo<ServiceAsOption[]>(
    () => servicesResponse?.map(service => new ServiceAsOption(service, t)) ?? [],
    [servicesResponse, t],
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
        {t('timeTracking:TimeEntryServiceSelector.label.no_services', 'No services available')}
      </P>
    ),
    [t],
  )

  const ErrorMessage = shouldShowError
    ? t('timeTracking:TimeEntryServiceSelector.error.load_services', 'Failed to load services.')
    : undefined

  const sharedProps = {
    selectedValue: selectedServiceForComboBox,
    onSelectedValueChange: handleSelectionChange,
    className: 'Layer__TimeEntryServiceSelector__Input',
    placeholder: placeholder ?? t('timeTracking:TimeEntryServiceSelector.label.select_service', 'Select a service'),
    slots: { EmptyMessage, ErrorMessage },
    isClearable,
    isDisabled: shouldDisableComboBox,
    isError: shouldShowError,
    isLoading: isLoadingWithoutFallback,
    isReadOnly,
  }

  const creatableProps = isCreatable
    ? {
      isCreatable: true as const,
      onCreateOption: onCreateService,
      formatCreateLabel: (inputValue: string) => formatCreateLabel(inputValue, t),
      groups: [{ label: t('timeTracking:TimeEntryServiceSelector.services.title', 'Services'), options: serviceOptions }],
    }
    : { isCreatable: false as const, options: serviceOptions }

  return (
    <ComboBoxField
      label={t('timeTracking:TimeEntryServiceSelector.label.service', 'Service')}
      className={legacyFieldClassNames({ inline, className })}
      inline={inline}
      showLabel={showLabel}
    >
      {controlProps => <MaybeCreatableComboBox {...controlProps} {...sharedProps} {...creatableProps} />}
    </ComboBoxField>
  )
}
