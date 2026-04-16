import { useCallback, useEffect, useMemo, useState } from 'react'
import { Archive, ArchiveRestore, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useIntl } from 'react-intl'

import { type CatalogService } from '@schemas/catalogService'
import { convertCentsToDecimalString } from '@utils/format'
import { toLocalizedCents } from '@utils/i18n/number/input'
import { useArchiveCatalogService } from '@hooks/api/businesses/[business-id]/catalog/services/[service-id]/useArchiveCatalogService'
import { useReactivateCatalogService } from '@hooks/api/businesses/[business-id]/catalog/services/[service-id]/useReactivateCatalogService'
import { useUpdateCatalogService } from '@hooks/api/businesses/[business-id]/catalog/services/[service-id]/useUpdateCatalogService'
import { useCreateCatalogService } from '@hooks/api/businesses/[business-id]/catalog/services/useCreateCatalogService'
import { useListCatalogServices } from '@hooks/api/businesses/[business-id]/catalog/services/useListCatalogServices'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import Loader from '@icons/Loader'
import { Button } from '@ui/Button/Button'
import { FieldError, TextField } from '@ui/Form/Form'
import { Input } from '@ui/Input/Input'
import { InputGroup } from '@ui/Input/InputGroup'
import { Drawer } from '@ui/Modal/Modal'
import { ModalCloseButton, ModalHeading } from '@ui/Modal/ModalSlots'
import { HStack, Spacer, VStack } from '@ui/Stack/Stack'
import { Toggle, ToggleSize } from '@ui/Toggle/Toggle'
import { Label, Span } from '@ui/Typography/Text'
import { BaseConfirmationModal } from '@components/blocks/BaseConfirmationModal/BaseConfirmationModal'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { ExpandableCard } from '@components/ExpandableCard/ExpandableCard'
import { AmountInput } from '@components/Input/AmountInput'
import { TextSize } from '@components/Typography/Text'

import './timeTrackingServicesDrawer.scss'

type ServicesTab = 'active' | 'archived'

type HourlyRateFieldProps = {
  inputId: string
  name: string
  value: string
  onChange: (value: string) => void
}

function HourlyRateField({ inputId, name, value, onChange }: HourlyRateFieldProps) {
  const { t } = useTranslation()

  return (
    <div className='Layer__TimeTrackingServicesDrawer__rateInputRow'>
      <div className='Layer__TimeTrackingServicesDrawer__rateAmountWrap'>
        <AmountInput
          id={inputId}
          name={name}
          value={value}
          onChange={next => onChange(next ?? '')}
          className='Layer__TimeTrackingServicesDrawer__rateAmountInput'
        />
      </div>
      <Span className='Layer__TimeTrackingServicesDrawer__rateSuffix'>
        {t('timeTracking:services.rate_per_hour_suffix', '/hr')}
      </Span>
    </div>
  )
}

type ServiceEditCardProps = {
  service: CatalogService
  onCollapse: () => void
  onOpenArchive: () => void
}

const ServiceEditCard = ({ service, onCollapse, onOpenArchive }: ServiceEditCardProps) => {
  const { t } = useTranslation()
  const intl = useIntl()
  const { trigger: updateService, isMutating } = useUpdateCatalogService({ serviceId: service.id })
  const [name, setName] = useState(service.name)
  const [hourlyRaw, setHourlyRaw] = useState(
    () => service.billableRatePerHourAmount != null && !Number.isNaN(service.billableRatePerHourAmount)
      ? convertCentsToDecimalString(service.billableRatePerHourAmount)
      : '',
  )
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    setName(service.name)
    setHourlyRaw(
      service.billableRatePerHourAmount != null && !Number.isNaN(service.billableRatePerHourAmount)
        ? convertCentsToDecimalString(service.billableRatePerHourAmount)
        : '',
    )
    setSaveError(null)
  }, [service])

  const onSave = useCallback(async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setSaveError(t('timeTracking:validation.service_name_required', 'Service name is a required field.'))
      return
    }
    setSaveError(null)
    const trimmedRate = hourlyRaw.trim()
    const billableRatePerHourAmount = trimmedRate === ''
      ? undefined
      : toLocalizedCents(hourlyRaw, intl.locale)
    try {
      await updateService({
        name: trimmed,
        billable_rate_per_hour_amount: billableRatePerHourAmount,
      })
      onCollapse()
    }
    catch {
      setSaveError(t('timeTracking:error.update_service', 'Could not save this service. Please try again.'))
    }
  }, [hourlyRaw, intl.locale, name, onCollapse, t, updateService])

  return (
    <VStack className='Layer__TimeTrackingServicesDrawer__editForm' gap='md'>
      <TextField
        name={`service-name-${service.id}`}
        className='Layer__TimeTrackingServicesDrawer__rateField'
      >
        <Label slot='label' size='sm' htmlFor={`service-name-${service.id}`} pbe='3xs'>
          {t('timeTracking:services.service_name', 'Service name')}
        </Label>
        <InputGroup slot='input'>
          <Input
            id={`service-name-${service.id}`}
            name={`service-name-${service.id}`}
            value={name}
            onChange={e => setName(e.target.value)}
            inset
          />
        </InputGroup>
      </TextField>
      <div className='Layer__TimeTrackingServicesDrawer__rateField'>
        <Label size='sm' htmlFor={`service-rate-${service.id}`} pbe='3xs'>
          {t('timeTracking:services.hourly_rate_optional', 'Default hourly rate (optional)')}
        </Label>
        <HourlyRateField
          inputId={`service-rate-${service.id}`}
          name={`service-rate-${service.id}`}
          value={hourlyRaw}
          onChange={setHourlyRaw}
        />
      </div>
      {saveError && <FieldError>{saveError}</FieldError>}
      <HStack className='Layer__TimeTrackingServicesDrawer__cardActions' gap='sm' align='center'>
        <Button variant='outlined' onPress={onOpenArchive}>
          <Archive size={16} />
          {t('timeTracking:services.archive', 'Archive')}
        </Button>
        <Button onPress={() => void onSave()} isDisabled={isMutating}>
          {t('timeTracking:services.save', 'Save')}
        </Button>
      </HStack>
    </VStack>
  )
}

type AddServiceCardProps = {
  onCancel: () => void
  onCreated: () => void
}

const AddServiceCard = ({ onCancel, onCreated }: AddServiceCardProps) => {
  const { t } = useTranslation()
  const intl = useIntl()
  const { trigger: createService, isMutating } = useCreateCatalogService()
  const [name, setName] = useState('')
  const [hourlyRaw, setHourlyRaw] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)

  const onSave = useCallback(async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setSaveError(t('timeTracking:validation.service_name_required', 'Service name is a required field.'))
      return
    }
    setSaveError(null)
    const trimmedRate = hourlyRaw.trim()
    const billableRatePerHourAmount = trimmedRate === ''
      ? undefined
      : toLocalizedCents(hourlyRaw, intl.locale)
    try {
      await createService({
        name: trimmed,
        billable_rate_per_hour_amount: billableRatePerHourAmount ?? undefined,
      })
      onCreated()
    }
    catch {
      setSaveError(t('timeTracking:error.create_service', 'Failed to create service. Please try again.'))
    }
  }, [createService, hourlyRaw, intl.locale, name, onCreated, t])

  return (
    <VStack className='Layer__TimeTrackingServicesDrawer__addCard' gap='md'>
      <Span className='Layer__TimeTrackingServicesDrawer__addCardTitle' size='sm' weight='bold'>
        {t('timeTracking:services.add_service', 'Add service')}
      </Span>
      <TextField
        name='add-service-name'
        className='Layer__TimeTrackingServicesDrawer__rateField'
      >
        <Label slot='label' size='sm' htmlFor='add-service-name' pbe='3xs'>
          {t('timeTracking:services.service_name', 'Service name')}
        </Label>
        <InputGroup slot='input'>
          <Input
            id='add-service-name'
            name='add-service-name'
            value={name}
            onChange={e => setName(e.target.value)}
            inset
          />
        </InputGroup>
      </TextField>
      <div className='Layer__TimeTrackingServicesDrawer__rateField'>
        <Label size='sm' htmlFor='add-service-rate' pbe='3xs'>
          {t('timeTracking:services.hourly_rate_optional', 'Default hourly rate (optional)')}
        </Label>
        <HourlyRateField
          inputId='add-service-rate'
          name='add-service-rate'
          value={hourlyRaw}
          onChange={setHourlyRaw}
        />
      </div>
      {saveError && <FieldError>{saveError}</FieldError>}
      <HStack gap='sm' justify='end' align='center'>
        <Button variant='outlined' onPress={onCancel}>
          {t('timeTracking:services.cancel', 'Cancel')}
        </Button>
        <Button onPress={() => void onSave()} isDisabled={isMutating}>
          {t('timeTracking:services.save', 'Save')}
        </Button>
      </HStack>
    </VStack>
  )
}

type ArchiveServiceModalProps = {
  service: CatalogService
  onOpenChange: (open: boolean) => void
  onArchiveSuccess: () => void
}

const ArchiveServiceModal = ({
  service,
  onOpenChange,
  onArchiveSuccess,
}: ArchiveServiceModalProps) => {
  const { t } = useTranslation()
  const { isMobile } = useSizeClass()
  const { trigger: archiveService } = useArchiveCatalogService({ serviceId: service.id })

  const onConfirm = useCallback(async () => {
    await archiveService()
    onArchiveSuccess()
  }, [archiveService, onArchiveSuccess])

  return (
    <BaseConfirmationModal
      isOpen={true}
      onOpenChange={onOpenChange}
      title={t('timeTracking:services.archive_confirm_title', 'Archive this service?')}
      description={t('timeTracking:services.archive_confirm_description', 'This service will be removed from your active list. Time entries that used it are unchanged.')}
      onConfirm={onConfirm}
      confirmLabel={t('timeTracking:services.archive', 'Archive')}
      errorText={t('timeTracking:error.archive_service', 'Could not archive this service. Please try again.')}
      useDrawer={isMobile}
    />
  )
}

type UnarchiveServiceModalProps = {
  service: CatalogService
  onOpenChange: (open: boolean) => void
  onUnarchiveSuccess: () => void
}

const UnarchiveServiceModal = ({
  service,
  onOpenChange,
  onUnarchiveSuccess,
}: UnarchiveServiceModalProps) => {
  const { t } = useTranslation()
  const { isMobile } = useSizeClass()
  const { trigger: reactivateService } = useReactivateCatalogService({ serviceId: service.id })

  const onConfirm = useCallback(async () => {
    await reactivateService()
    onUnarchiveSuccess()
  }, [onUnarchiveSuccess, reactivateService])

  return (
    <BaseConfirmationModal
      isOpen={true}
      onOpenChange={onOpenChange}
      title={t('timeTracking:services.unarchive_confirm_title', 'Restore this service?')}
      description={t('timeTracking:services.unarchive_confirm_description', 'This service will appear in your active list again.')}
      onConfirm={onConfirm}
      confirmLabel={t('timeTracking:services.unarchive', 'Restore')}
      errorText={t('timeTracking:error.unarchive_service', 'Could not restore this service. Please try again.')}
      useDrawer={isMobile}
    />
  )
}

export type TimeTrackingServicesDrawerProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function TimeTrackingServicesDrawer({ isOpen, onOpenChange }: TimeTrackingServicesDrawerProps) {
  const { t } = useTranslation()
  const { formatCurrencyFromCents } = useIntlFormatter()
  const { isMobile } = useSizeClass()
  const { data, isLoading, isError } = useListCatalogServices()
  const [tab, setTab] = useState<ServicesTab>('active')
  const {
    data: archivedData,
    isLoading: isArchivedLoading,
    isError: isArchivedError,
  } = useListCatalogServices({
    allowArchived: true,
    isEnabled: isOpen && tab === 'archived',
  })
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [archiveTarget, setArchiveTarget] = useState<CatalogService | null>(null)
  const [unarchiveTarget, setUnarchiveTarget] = useState<CatalogService | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setExpandedId(null)
      setIsAdding(false)
      setArchiveTarget(null)
      setUnarchiveTarget(null)
      setTab('active')
    }
  }, [isOpen])

  const activeServices = useMemo(() => data?.data ?? [], [data])

  const archivedServices = useMemo(() => {
    const rows = archivedData?.data ?? []
    const withArchived = rows.filter(s => s.archivedAt != null)
    return withArchived.length > 0 ? withArchived : rows
  }, [archivedData])

  const formatHourly = useCallback(
    (service: CatalogService) => {
      const cents = service.billableRatePerHourAmount
      if (cents == null) {
        return null
      }
      return `${formatCurrencyFromCents(cents)}${t('timeTracking:services.rate_per_hour_suffix', '/hr')}`
    },
    [formatCurrencyFromCents, t],
  )

  const tabOptions = useMemo(
    () => [
      { value: 'active' as const, label: t('timeTracking:label.active', 'Active') },
      { value: 'archived' as const, label: t('timeTracking:services.archived', 'Archived') },
    ],
    [t],
  )

  const startAdd = useCallback(() => {
    setIsAdding(true)
    setExpandedId(null)
  }, [])

  const listForTab = tab === 'active' ? activeServices : archivedServices
  const isArchivedInitialLoading = tab === 'archived' && isArchivedLoading && archivedData === undefined
  const showEmptyList = listForTab.length === 0
    && !(tab === 'active' && isAdding)
    && !isArchivedInitialLoading
    && !(tab === 'archived' && isArchivedError)

  const Header = useCallback(
    ({ close }: { close: () => void }) => (
      <VStack gap='md'>
        <HStack className='Layer__TimeTrackingServicesDrawer__headerTop' gap='sm' align='center'>
          <ModalHeading>{t('timeTracking:services.title', 'Services')}</ModalHeading>
          <HStack gap='xs' align='center'>
            <Button onPress={startAdd} isDisabled={isAdding}>
              <Plus size={16} />
              {t('timeTracking:services.add', 'Add')}
            </Button>
            <ModalCloseButton onClose={close} />
          </HStack>
        </HStack>
        <div className='Layer__TimeTrackingServicesDrawer__tabs'>
          <Toggle
            ariaLabel={t('timeTracking:services.tab_group_label', 'Service list')}
            options={tabOptions}
            selectedKey={tab}
            onSelectionChange={key => setTab(key as ServicesTab)}
            size={ToggleSize.xsmall}
          />
        </div>
      </VStack>
    ),
    [isAdding, startAdd, t, tab, tabOptions],
  )

  const toggleExpanded = useCallback((serviceId: string) => {
    setIsAdding(false)
    setExpandedId(prev => (prev === serviceId ? null : serviceId))
  }, [])

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable
        variant={isMobile ? 'mobile-drawer' : 'drawer'}
        flexBlock={isMobile}
        aria-label={t('timeTracking:services.title', 'Services')}
        slots={{ Header }}
      >
        {() => (
          <div className='Layer__TimeTrackingServicesDrawer'>
            {isError && (
              <DataState
                status={DataStateStatus.failed}
                title={t('timeTracking:error.load_services', 'Failed to load services.')}
                titleSize={TextSize.md}
                spacing
              />
            )}
            {!isError && isLoading && !data && (
              <DataState
                status={DataStateStatus.info}
                title={t('common:label.loading', 'Loading...')}
                icon={<Loader className='Layer__anim--rotating' />}
                titleSize={TextSize.md}
                spacing
              />
            )}
            {!isError && data && (
              <VStack className='Layer__TimeTrackingServicesDrawer__list' gap='sm'>
                {tab === 'archived' && isArchivedError && (
                  <DataState
                    status={DataStateStatus.failed}
                    title={t('timeTracking:error.load_services', 'Failed to load services.')}
                    titleSize={TextSize.md}
                    spacing
                  />
                )}
                {tab === 'archived' && !isArchivedError && isArchivedInitialLoading && (
                  <DataState
                    status={DataStateStatus.info}
                    title={t('common:label.loading', 'Loading...')}
                    icon={<Loader className='Layer__anim--rotating' />}
                    titleSize={TextSize.md}
                    spacing
                  />
                )}
                {tab === 'active' && isAdding && (
                  <div className='Layer__TimeTrackingServicesDrawer__addWrap'>
                    <AddServiceCard
                      onCancel={() => setIsAdding(false)}
                      onCreated={() => {
                        setIsAdding(false)
                      }}
                    />
                  </div>
                )}
                {showEmptyList && (
                  <DataState
                    status={DataStateStatus.allDone}
                    title={tab === 'active'
                      ? t('timeTracking:services.no_active', 'No services yet')
                      : t('timeTracking:services.no_archived', 'No archived services')}
                    titleSize={TextSize.md}
                    spacing
                  />
                )}
                {tab === 'active' && activeServices.length > 0 && (
                  <div className='Layer__TimeTrackingServicesDrawer__accordion'>
                    {activeServices.map((service) => {
                      const rateLabel = formatHourly(service)
                      return (
                        <ExpandableCard
                          key={service.id}
                          isExpanded={expandedId === service.id}
                          onToggleExpanded={() => toggleExpanded(service.id)}
                          slots={{
                            Heading: (
                              <HStack align='center' gap='sm' fluid>
                                <Span className='Layer__TimeTrackingServicesDrawer__rowName' size='sm'>
                                  {service.name}
                                </Span>
                                <Spacer />
                                {rateLabel && (
                                  <Span className='Layer__TimeTrackingServicesDrawer__rowRate' size='sm'>
                                    {rateLabel}
                                  </Span>
                                )}
                              </HStack>
                            ),
                          }}
                        >
                          <ServiceEditCard
                            service={service}
                            onCollapse={() => setExpandedId(null)}
                            onOpenArchive={() => setArchiveTarget(service)}
                          />
                        </ExpandableCard>
                      )
                    })}
                  </div>
                )}
                {tab === 'archived' && !isArchivedError && !isArchivedInitialLoading && archivedServices.length > 0 && (
                  <div className='Layer__TimeTrackingServicesDrawer__archivedList'>
                    {archivedServices.map((service) => {
                      const archivedRate = formatHourly(service)
                      return (
                        <HStack
                          key={service.id}
                          className='Layer__TimeTrackingServicesDrawer__archivedRow'
                          gap='sm'
                          align='center'
                        >
                          <Span className='Layer__TimeTrackingServicesDrawer__rowName' size='sm'>
                            {service.name}
                          </Span>
                          <Spacer />
                          {archivedRate && (
                            <Span className='Layer__TimeTrackingServicesDrawer__rowRate' size='sm'>
                              {archivedRate}
                            </Span>
                          )}
                          <Button variant='outlined' inset onPress={() => setUnarchiveTarget(service)}>
                            <ArchiveRestore size={14} />
                            {t('timeTracking:services.unarchive', 'Restore')}
                          </Button>
                        </HStack>
                      )
                    })}
                  </div>
                )}
              </VStack>
            )}
          </div>
        )}
      </Drawer>
      {archiveTarget !== null && (
        <ArchiveServiceModal
          key={archiveTarget.id}
          service={archiveTarget}
          onOpenChange={(open) => {
            if (!open) {
              setArchiveTarget(null)
            }
          }}
          onArchiveSuccess={() => {
            setExpandedId(null)
          }}
        />
      )}
      {unarchiveTarget !== null && (
        <UnarchiveServiceModal
          key={unarchiveTarget.id}
          service={unarchiveTarget}
          onOpenChange={(open) => {
            if (!open) {
              setUnarchiveTarget(null)
            }
          }}
          onUnarchiveSuccess={() => {
            setUnarchiveTarget(null)
          }}
        />
      )}
    </>
  )
}
