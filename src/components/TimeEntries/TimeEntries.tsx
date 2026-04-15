import { useCallback, useMemo } from 'react'
import { Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type ListTimeEntriesFilterParams, useListTimeEntries } from '@hooks/api/businesses/[business-id]/time-tracking/time-entries/useListTimeEntries'
import { useAutoResetPageIndex } from '@hooks/utils/pagination/useAutoResetPageIndex'
import { TimeEntriesStoreProvider, useTimeEntriesDeleteModal, useTimeEntriesFilters } from '@providers/TimeEntriesStore/TimeEntriesStoreProvider'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { TimeEntriesTable } from '@components/TimeEntries/TimeEntriesTable/TimeEntriesTable'
import { TimeEntryDeleteConfirmationModal } from '@components/TimeEntries/TimeEntryDeleteConfirmationModal/TimeEntryDeleteConfirmationModal'
import { TimeEntryDrawer } from '@components/TimeEntries/TimeEntryDrawer/TimeEntryDrawer'

interface TimeEntriesProps {
  filterParams?: Omit<ListTimeEntriesFilterParams, 'includeDeleted'>
  onStartTimer?: () => void
  isStartTimerDisabled?: boolean
}

const TimeEntriesEmptyState = () => {
  const { t } = useTranslation()
  return (
    <DataState
      status={DataStateStatus.allDone}
      title={t('timeTracking:empty.no_entries_yet', 'No time entries yet')}
      description={t('timeTracking:empty.add_first_entry', 'Add your first time entry to start tracking.')}
      icon={<Clock />}
      spacing
      className='Layer__TimeEntries__EmptyState'
    />
  )
}

const TimeEntriesErrorState = () => {
  const { t } = useTranslation()
  return (
    <DataState
      status={DataStateStatus.failed}
      title={t('timeTracking:error.load_entries', 'We couldn\'t load your time entries')}
      description={t('timeTracking:error.load_entries_detail', 'An error occurred while loading your time entries. Please check your connection and try again.')}
      spacing
      className='Layer__TimeEntries__ErrorState'
    />
  )
}

export const TimeEntries = (props: TimeEntriesProps) => (
  <TimeEntriesStoreProvider>
    <TimeEntriesContent {...props} />
  </TimeEntriesStoreProvider>
)

const TimeEntriesContent = ({ filterParams, onStartTimer, isStartTimerDisabled }: TimeEntriesProps) => {
  const { selectedCustomer, selectedServiceId } = useTimeEntriesFilters()
  const { entryToDelete } = useTimeEntriesDeleteModal()

  const timeEntriesFilterParams = useMemo(() => ({
    ...filterParams,
    ...(selectedCustomer && { customerId: selectedCustomer.id }),
    ...(selectedServiceId && { serviceId: selectedServiceId }),
  }), [filterParams, selectedCustomer, selectedServiceId])

  const { data, isLoading, isError, size, setSize } = useListTimeEntries(timeEntriesFilterParams)
  const entries = useMemo(() => data?.flatMap(({ data }) => data), [data])
  const autoResetPageIndexRef = useAutoResetPageIndex(timeEntriesFilterParams, data)

  const paginationMeta = data?.[data.length - 1]?.meta.pagination
  const hasMore = paginationMeta?.hasMore

  const fetchMore = useCallback(() => {
    if (hasMore) {
      void setSize(size + 1)
    }
  }, [hasMore, setSize, size])

  const tableSlots = useMemo(
    () => ({
      EmptyState: TimeEntriesEmptyState,
      ErrorState: TimeEntriesErrorState,
    }),
    [],
  )

  const paginationProps = useMemo(() => ({
    pageSize: 20,
    hasMore,
    fetchMore,
    autoResetPageIndexRef,
  }), [fetchMore, hasMore, autoResetPageIndexRef])

  return (
    <>
      <TimeEntriesTable
        data={entries}
        isLoading={isLoading}
        isError={isError}
        paginationProps={paginationProps}
        onStartTimer={onStartTimer}
        isStartTimerDisabled={isStartTimerDisabled}
        slots={tableSlots}
      />
      <TimeEntryDrawer />
      {entryToDelete && (
        <TimeEntryDeleteConfirmationModal entry={entryToDelete} />
      )}
    </>
  )
}
