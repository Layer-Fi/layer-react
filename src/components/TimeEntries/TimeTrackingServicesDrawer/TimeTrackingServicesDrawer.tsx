import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArchiveRestore, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type CatalogService } from '@schemas/catalogService'
import { useListCatalogServices } from '@hooks/api/businesses/[business-id]/catalog/services/useListCatalogServices'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import Loader from '@icons/Loader'
import { Button } from '@ui/Button/Button'
import { Drawer } from '@ui/Modal/Modal'
import { ModalCloseButton, ModalHeading } from '@ui/Modal/ModalSlots'
import { HStack, Spacer, VStack } from '@ui/Stack/Stack'
import { Toggle, ToggleSize } from '@ui/Toggle/Toggle'
import { Span } from '@ui/Typography/Text'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { ExpandableCard } from '@components/ExpandableCard/ExpandableCard'
import { TextSize } from '@components/Typography/Text'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'
import { ConditionalList } from '@components/utility/ConditionalList'

import './timeTrackingServicesDrawer.scss'

import { ServiceArchiveModal } from './ServiceArchiveModal'
import { ServiceFormCard } from './ServiceFormCard'
import { ServiceRestoreModal } from './ServiceRestoreModal'

type ServicesTab = 'active' | 'archived'

type FormatHourly = (service: CatalogService) => string | null

export type TimeTrackingServicesDrawerProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

function useFormatHourly(): FormatHourly {
  const { t } = useTranslation()
  const { formatCurrencyFromCents } = useIntlFormatter()

  return useCallback(
    (service) => {
      const cents = service.billableRatePerHourAmount
      if (cents == null) {
        return null
      }
      return t('timeTracking:services.rate_per_hour', '{{rate}}/hr', {
        rate: formatCurrencyFromCents(cents),
      })
    },
    [formatCurrencyFromCents, t],
  )
}

function ServiceRowLabels({ name, rateLabel }: { name: string, rateLabel: string | null }) {
  return (
    <HStack align='center' gap='sm' fluid>
      <Span className='Layer__TimeTrackingServicesDrawer__rowName' size='sm'>
        {name}
      </Span>
      <Spacer />
      {rateLabel && (
        <Span className='Layer__TimeTrackingServicesDrawer__rowRate' size='sm'>
          {rateLabel}
        </Span>
      )}
    </HStack>
  )
}

const LoadingState = () => {
  const { t } = useTranslation()
  return (
    <DataState
      status={DataStateStatus.info}
      title={t('common:label.loading', 'Loading...')}
      icon={<Loader className='Layer__anim--rotating' />}
      titleSize={TextSize.md}
      spacing
    />
  )
}

const LoadServicesErrorState = () => {
  const { t } = useTranslation()
  return (
    <DataState
      status={DataStateStatus.failed}
      title={t('timeTracking:error.load_services', 'Failed to load services.')}
      titleSize={TextSize.md}
      spacing
    />
  )
}

type ActiveServicesContentProps = {
  services: ReadonlyArray<CatalogService>
  isAdding: boolean
  expandedId: string | null
  formatHourly: FormatHourly
  onCancelAdd: () => void
  onCreateSuccess: () => void
  onToggleExpanded: (serviceId: string) => void
  onArchive: (service: CatalogService) => void
  onEditSuccess: () => void
}

function ActiveServicesContent({
  services,
  isAdding,
  expandedId,
  formatHourly,
  onCancelAdd,
  onCreateSuccess,
  onToggleExpanded,
  onArchive,
  onEditSuccess,
}: ActiveServicesContentProps) {
  const { t } = useTranslation()

  const empty = isAdding
    ? null
    : (
      <DataState
        status={DataStateStatus.allDone}
        title={t('timeTracking:services.no_active', 'No services yet')}
        titleSize={TextSize.md}
        spacing
      />
    )

  return (
    <>
      {isAdding && (
        <VStack className='Layer__TimeTrackingServicesDrawer__addWrap'>
          <ServiceFormCard
            mode='create'
            onCancel={onCancelAdd}
            onSuccess={onCreateSuccess}
          />
        </VStack>
      )}
      <ConditionalList
        list={services}
        Empty={empty}
        Container={({ children }) => (
          <VStack className='Layer__TimeTrackingServicesDrawer__accordion'>{children}</VStack>
        )}
      >
        {({ item: service }) => (
          <ExpandableCard
            key={service.id}
            isExpanded={expandedId === service.id}
            onToggleExpanded={() => onToggleExpanded(service.id)}
            slots={{
              Heading: (
                <ServiceRowLabels name={service.name} rateLabel={formatHourly(service)} />
              ),
            }}
          >
            <ServiceFormCard
              mode='edit'
              service={service}
              onSuccess={onEditSuccess}
              onArchive={() => onArchive(service)}
            />
          </ExpandableCard>
        )}
      </ConditionalList>
    </>
  )
}

type ArchivedServicesContentProps = {
  isEnabled: boolean
  formatHourly: FormatHourly
  onRestore: (service: CatalogService) => void
}

function ArchivedServicesContent({ isEnabled, formatHourly, onRestore }: ArchivedServicesContentProps) {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useListCatalogServices({
    allowArchived: true,
    isEnabled,
  })

  const archivedServices = useMemo(
    () => (data?.data ?? []).filter(s => s.archivedAt != null),
    [data],
  )

  return (
    <ConditionalBlock
      data={data}
      isLoading={isLoading}
      isError={isError}
      Loading={<LoadingState />}
      Inactive={null}
      Error={<LoadServicesErrorState />}
    >
      {() => (
        <ConditionalList
          list={archivedServices}
          Empty={(
            <DataState
              status={DataStateStatus.allDone}
              title={t('timeTracking:services.no_archived', 'No archived services')}
              titleSize={TextSize.md}
              spacing
            />
          )}
          Container={({ children }) => (
            <VStack className='Layer__TimeTrackingServicesDrawer__archivedList'>{children}</VStack>
          )}
        >
          {({ item: service }) => (
            <HStack
              key={service.id}
              className='Layer__TimeTrackingServicesDrawer__archivedRow'
              gap='sm'
              align='center'
              pb='sm'
              pi='md'
            >
              <ServiceRowLabels name={service.name} rateLabel={formatHourly(service)} />
              <Button variant='outlined' inset onPress={() => onRestore(service)}>
                <ArchiveRestore size={14} />
                <Span size='sm'>{t('timeTracking:services.unarchive', 'Restore')}</Span>
              </Button>
            </HStack>
          )}
        </ConditionalList>
      )}
    </ConditionalBlock>
  )
}

export function TimeTrackingServicesDrawer({ isOpen, onOpenChange }: TimeTrackingServicesDrawerProps) {
  const { t } = useTranslation()
  const { isMobile } = useSizeClass()
  const formatHourly = useFormatHourly()
  const { data, isLoading, isError } = useListCatalogServices()
  const [tab, setTab] = useState<ServicesTab>('active')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [archiveTarget, setArchiveTarget] = useState<CatalogService | null>(null)
  const [isArchiveOpen, setIsArchiveOpen] = useState(false)
  const [restoreTarget, setRestoreTarget] = useState<CatalogService | null>(null)
  const [isRestoreOpen, setIsRestoreOpen] = useState(false)
  const tabRef = useRef<ServicesTab>(tab)
  const isAddingRef = useRef(isAdding)
  tabRef.current = tab
  isAddingRef.current = isAdding

  useEffect(() => {
    if (!isOpen) {
      setExpandedId(null)
      setIsAdding(false)
      setArchiveTarget(null)
      setIsArchiveOpen(false)
      setRestoreTarget(null)
      setIsRestoreOpen(false)
      setTab('active')
    }
  }, [isOpen])

  const openArchive = useCallback((service: CatalogService) => {
    setArchiveTarget(service)
    setIsArchiveOpen(true)
  }, [])

  const openRestore = useCallback((service: CatalogService) => {
    setRestoreTarget(service)
    setIsRestoreOpen(true)
  }, [])

  const activeServices = useMemo(() => data?.data ?? [], [data])

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

  const toggleExpanded = useCallback((serviceId: string) => {
    setIsAdding(false)
    setExpandedId(prev => (prev === serviceId ? null : serviceId))
  }, [])

  const Header = useCallback(
    ({ close }: { close: () => void }) => (
      <VStack gap='md'>
        <HStack gap='sm' align='center' justify='space-between'>
          <ModalHeading>{t('timeTracking:services.title', 'Services')}</ModalHeading>
          <HStack gap='xs' align='center'>
            <Button onPress={startAdd} isDisabled={isAddingRef.current}>
              <Plus size={16} />
              {t('timeTracking:services.add', 'Add')}
            </Button>
            <ModalCloseButton onClose={close} />
          </HStack>
        </HStack>
        <HStack className='Layer__TimeTrackingServicesDrawer__tabs' justify='end' fluid>
          <Toggle
            ariaLabel={t('timeTracking:services.tab_group_label', 'Service list')}
            options={tabOptions}
            selectedKey={tabRef.current}
            onSelectionChange={key => setTab(key as ServicesTab)}
            size={ToggleSize.xsmall}
          />
        </HStack>
      </VStack>
    ),
    [startAdd, t, tabOptions],
  )

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
          <VStack className='Layer__TimeTrackingServicesDrawer' gap='md' pbs='md' pbe='lg' pi='md'>
            <ConditionalBlock
              data={data}
              isLoading={isLoading}
              isError={isError}
              Loading={<LoadingState />}
              Inactive={null}
              Error={<LoadServicesErrorState />}
            >
              {() => (
                <VStack gap='sm'>
                  {tab === 'active'
                    ? (
                      <ActiveServicesContent
                        services={activeServices}
                        isAdding={isAdding}
                        expandedId={expandedId}
                        formatHourly={formatHourly}
                        onCancelAdd={() => setIsAdding(false)}
                        onCreateSuccess={() => setIsAdding(false)}
                        onToggleExpanded={toggleExpanded}
                        onArchive={openArchive}
                        onEditSuccess={() => setExpandedId(null)}
                      />
                    )
                    : (
                      <ArchivedServicesContent
                        isEnabled={isOpen && tab === 'archived'}
                        formatHourly={formatHourly}
                        onRestore={openRestore}
                      />
                    )}
                </VStack>
              )}
            </ConditionalBlock>
          </VStack>
        )}
      </Drawer>
      <ServiceArchiveModal
        service={archiveTarget}
        isOpen={isArchiveOpen}
        onOpenChange={(open) => {
          setIsArchiveOpen(open)
          if (!open) {
            setArchiveTarget(null)
          }
        }}
        onSuccess={() => {
          setExpandedId(null)
          setIsArchiveOpen(false)
          setArchiveTarget(null)
        }}
      />
      <ServiceRestoreModal
        service={restoreTarget}
        isOpen={isRestoreOpen}
        onOpenChange={(open) => {
          setIsRestoreOpen(open)
          if (!open) {
            setRestoreTarget(null)
          }
        }}
        onSuccess={() => {
          setIsRestoreOpen(false)
          setRestoreTarget(null)
        }}
      />
    </>
  )
}
