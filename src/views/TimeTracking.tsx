import { useCallback, useMemo, useState } from 'react'
import { Briefcase, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useGetActiveTimeTracker } from '@api/businesses/[business-id]/time-tracking/tracker/active/get'
import { useGlobalDateRange } from '@providers/global/GlobalDateStore/GlobalDateStoreProvider'
import { TimeTrackingServicesDrawerProvider, useTimeTrackingServicesDrawer } from '@providers/timeTracking/TimeTrackingServicesDrawerProvider/TimeTrackingServicesDrawerProvider'
import { type DropdownMenuItem } from '@ui/DropdownMenu/DropdownMenu'
import { View } from '@blocks/Layout/View/View'
import { DataTableHeaderMenu } from '@blocks/Table/DataTable/DataTableHeaderMenu'
import { ActiveTimeTracker } from '@features/timeTracking/ActiveTimeTracker/ActiveTimeTracker'
import { TimeEntries } from '@features/timeTracking/TimeEntries/TimeEntries'
import { TimeTrackingStats } from '@features/timeTracking/TimeTrackingStats/TimeTrackingStats'

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
  return (
    <TimeTrackingServicesDrawerProvider>
      <TimeTrackingContent showTitle={showTitle} onReportsClick={onReportsClick} stringOverrides={stringOverrides} />
    </TimeTrackingServicesDrawerProvider>
  )
}

const TimeTrackingContent = ({ showTitle, onReportsClick, stringOverrides }: TimeTrackingProps) => {
  const { t } = useTranslation()
  const { startDate, endDate } = useGlobalDateRange({ dateSelectionMode: 'full' })
  const { data: activeTimeEntry, isLoading: isActiveTimeEntryLoading, isError: isActiveTimeEntryError } = useGetActiveTimeTracker()
  const { openServicesDrawer } = useTimeTrackingServicesDrawer()
  const [isActiveTimerDrawerOpen, setIsActiveTimerDrawerOpen] = useState(false)

  const globalDateFilterParams = useMemo(
    () => ({ startDate, endDate }),
    [endDate, startDate],
  )

  const onStartTimer = useCallback(() => {
    setIsActiveTimerDrawerOpen(true)
  }, [])

  const menuItems = useMemo<DropdownMenuItem[]>(() => [
    ...(onReportsClick
      ? [{
        key: TimeTrackingHeaderMenuActions.Reports,
        onClick: onReportsClick,
        slots: { Icon: FileText },
        label: t('reports:label.reports', 'Reports'),
      }]
      : []),
    {
      key: TimeTrackingHeaderMenuActions.Services,
      onClick: openServicesDrawer,
      slots: { Icon: Briefcase },
      label: t('timeTracking:services.title', 'Services'),
    },
  ], [openServicesDrawer, t, onReportsClick])

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
    </View>
  )
}
