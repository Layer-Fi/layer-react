import { useCallback, useEffect, useMemo, useState } from 'react'
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

import './timeTrackingServicesDrawer.scss'

import { AddServiceCard } from './AddServiceCard'
import { ServiceArchiveModal } from './ServiceArchiveModal'
import { ServiceEditCard } from './ServiceEditCard'
import { ServiceRestoreModal } from './ServiceRestoreModal'

type ServicesTab = 'active' | 'archived'

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
  const [restoreTarget, setRestoreTarget] = useState<CatalogService | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setExpandedId(null)
      setIsAdding(false)
      setArchiveTarget(null)
      setRestoreTarget(null)
      setTab('active')
    }
  }, [isOpen])

  const activeServices = useMemo(() => data?.data ?? [], [data])

  const archivedServices = useMemo(
    () => (archivedData?.data ?? []).filter(s => s.archivedAt != null),
    [archivedData],
  )

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
        <HStack className='Layer__TimeTrackingServicesDrawer__tabs'>
          <Toggle
            ariaLabel={t('timeTracking:services.tab_group_label', 'Service list')}
            options={tabOptions}
            selectedKey={tab}
            onSelectionChange={key => setTab(key as ServicesTab)}
            size={ToggleSize.xsmall}
          />
        </HStack>
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
          <VStack className='Layer__TimeTrackingServicesDrawer' gap='md'>
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
                  <VStack className='Layer__TimeTrackingServicesDrawer__addWrap'>
                    <AddServiceCard
                      onCancel={() => setIsAdding(false)}
                      onCreated={() => {
                        setIsAdding(false)
                      }}
                    />
                  </VStack>
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
                  <VStack className='Layer__TimeTrackingServicesDrawer__accordion'>
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
                  </VStack>
                )}
                {tab === 'archived' && !isArchivedError && !isArchivedInitialLoading && archivedServices.length > 0 && (
                  <VStack className='Layer__TimeTrackingServicesDrawer__archivedList'>
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
                          <Button variant='outlined' inset onPress={() => setRestoreTarget(service)}>
                            <ArchiveRestore size={14} />
                            {t('timeTracking:services.unarchive', 'Restore')}
                          </Button>
                        </HStack>
                      )
                    })}
                  </VStack>
                )}
              </VStack>
            )}
          </VStack>
        )}
      </Drawer>
      {archiveTarget !== null && (
        <ServiceArchiveModal
          key={archiveTarget.id}
          service={archiveTarget}
          onOpenChange={(open) => {
            if (!open) {
              setArchiveTarget(null)
            }
          }}
          onArchiveSuccess={() => {
            setExpandedId(null)
            setArchiveTarget(null)
          }}
        />
      )}
      {restoreTarget !== null && (
        <ServiceRestoreModal
          key={restoreTarget.id}
          service={restoreTarget}
          onOpenChange={(open) => {
            if (!open) {
              setRestoreTarget(null)
            }
          }}
          onRestoreSuccess={() => {
            setRestoreTarget(null)
          }}
        />
      )}
    </>
  )
}
