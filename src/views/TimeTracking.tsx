import { useCallback, useMemo, useState } from 'react'
import { FileText, Wrench } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useActiveTimeTracker } from '@hooks/api/businesses/[business-id]/time-tracking/tracker/useActiveTimeTracker'
import { useGlobalDateRange } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { DataTableHeaderMenu, type DataTableHeaderMenuItem } from '@components/DataTable/DataTableHeaderMenu'
import { ActiveTimeTracker } from '@components/TimeEntries/ActiveTimeTracker/ActiveTimeTracker'
import { TimeEntries } from '@components/TimeEntries/TimeEntries'
import { TimeTrackingServicesDrawer } from '@components/TimeEntries/TimeTrackingServicesDrawer/TimeTrackingServicesDrawer'
import { TimeTrackingStats } from '@components/TimeTrackingStats/TimeTrackingStats'
import { View } from '@components/View/View'

export interface TimeTrackingStringOverrides {
  title?: string
}

export interface TimeTrackingProps {
  showTitle?: boolean
  onReportsClick?: () => void
  stringOverrides?: TimeTrackingStringOverrides
}

enum TimeTrackingHeaderMenuActions {
  Reports = 'Reports',
  Services = 'Services',
}

export const TimeTracking = ({ showTitle = true, onReportsClick, stringOverrides }: TimeTrackingProps) => {
  const { t } = useTranslation()
  const { startDate, endDate } = useGlobalDateRange({ dateSelectionMode: 'full' })
  const { data: activeTimeEntry, isLoading: isActiveTimeEntryLoading, isError: isActiveTimeEntryError } = useActiveTimeTracker()
  const [isActiveTimerDrawerOpen, setIsActiveTimerDrawerOpen] = useState(false)
  const [isServicesDrawerOpen, setIsServicesDrawerOpen] = useState(false)

  const globalDateFilterParams = useMemo(
    () => ({ startDate, endDate }),
    [endDate, startDate],
  )

  const onStartTimer = useCallback(() => {
    setIsActiveTimerDrawerOpen(true)
  }, [])

  const menuItems = useMemo<DataTableHeaderMenuItem[]>(() => [
    ...(onReportsClick
      ? [{
        key: TimeTrackingHeaderMenuActions.Reports,
        onClick: onReportsClick,
        icon: <FileText size={20} strokeWidth={1.25} />,
        label: t('reports:label.reports', 'Reports'),
      }]
      : []),
    {
      key: TimeTrackingHeaderMenuActions.Services,
      onClick: () => setIsServicesDrawerOpen(true),
      icon: <Wrench size={20} strokeWidth={1.25} />,
      label: t('timeTracking:services.title', 'Services'),
    },
  ], [t, onReportsClick])

  return (
    <View
      title={stringOverrides?.title || t('timeTracking:label.time_tracking', 'Time Tracking')}
      showHeader={showTitle}
      header={(
        <DataTableHeaderMenu
          ariaLabel={t('timeTracking:label.additional_time_tracking_actions', 'Additional time tracking actions')}
          items={menuItems}
        />
      )}
    >
      <ActiveTimeTracker
        isDrawerOpen={isActiveTimerDrawerOpen}
        onDrawerOpenChange={setIsActiveTimerDrawerOpen}
      />
      <TimeTrackingStats selectedFilterParams={globalDateFilterParams} />
      <TimeEntries
        filterParams={globalDateFilterParams}
        onStartTimer={onStartTimer}
        isStartTimerDisabled={isActiveTimeEntryLoading || isActiveTimeEntryError || activeTimeEntry !== null}
      />
      <TimeTrackingServicesDrawer isOpen={isServicesDrawerOpen} onOpenChange={setIsServicesDrawerOpen} />
    </View>
  )
}
