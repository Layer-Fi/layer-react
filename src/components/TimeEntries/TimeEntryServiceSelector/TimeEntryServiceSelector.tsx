import { useCallback, useId, useMemo } from 'react'
import classNames from 'classnames'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type CatalogService } from '@schemas/catalogService'
import { useListCatalogServices } from '@hooks/api/businesses/[business-id]/catalog/services/useListCatalogServices'
import { useTimeTrackingServicesDrawer } from '@providers/TimeTrackingServicesDrawerProvider/TimeTrackingServicesDrawerProvider'
import { Button } from '@ui/Button/Button'
import { ComboBox } from '@ui/ComboBox/ComboBox'
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

interface TimeEntryServiceSelectorProps {
  selectedServiceId: string | null
  onSelectedServiceIdChange: (serviceId: string | null) => void
  placeholder?: string
  isReadOnly?: boolean
  isClearable?: boolean
  inline?: boolean
  className?: string
  showLabel?: boolean
  showAddServiceAction?: boolean
}

export function TimeEntryServiceSelector({
  selectedServiceId,
  onSelectedServiceIdChange,
  placeholder,
  isReadOnly,
  isClearable,
  inline,
  className,
  showLabel = true,
  showAddServiceAction = false,
}: TimeEntryServiceSelectorProps) {
  const { t } = useTranslation()
  const { openServicesDrawer } = useTimeTrackingServicesDrawer()

  const { data: servicesResponse, isLoading, isError } = useListCatalogServices()

  const isLoadingWithoutFallback = isLoading && !servicesResponse
  const shouldDisableComboBox = isLoadingWithoutFallback || isError

  const serviceOptions = useMemo<ServiceAsOption[]>(
    () => servicesResponse?.data.map(service => new ServiceAsOption(service)) ?? [],
    [servicesResponse],
  )
  const shouldShowAddServiceAction = showAddServiceAction
    && !isReadOnly
    && !isLoadingWithoutFallback
    && !isError
    && serviceOptions.length === 0

  const combinedClassName = classNames(
    'Layer__TimeEntryServiceSelector',
    inline && 'Layer__TimeEntryServiceSelector--inline',
    shouldShowAddServiceAction && 'Layer__TimeEntryServiceSelector--with-add-action',
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

  const handleAddService = () => {
    openServicesDrawer({ startInCreateMode: true })
  }

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

  return (
    <VStack className={combinedClassName}>
      {showLabel && <Label htmlFor={inputId} size='sm'>{t('timeTracking:label.service', 'Service')}</Label>}
      <ComboBox
        selectedValue={selectedServiceForComboBox}
        onSelectedValueChange={handleSelectionChange}
        inputId={inputId}
        className='Layer__TimeEntryServiceSelector__Input'
        placeholder={placeholder ?? t('timeTracking:label.select_service', 'Select a service')}
        slots={{ EmptyMessage, ErrorMessage }}
        isClearable={isClearable}
        isDisabled={shouldDisableComboBox}
        isError={isError}
        isLoading={isLoadingWithoutFallback}
        isReadOnly={isReadOnly}
        options={serviceOptions}
        aria-label={showLabel ? undefined : t('timeTracking:label.service', 'Service')}
      />
      {shouldShowAddServiceAction && (
        <VStack className='Layer__TimeEntryServiceSelector__AddAction'>
          <Button
            variant='outlined-light'
            onPress={handleAddService}
          >
            <Plus size={14} />
            {t('timeTracking:services.add_service', 'Add service')}
          </Button>
        </VStack>
      )}
    </VStack>
  )
}
