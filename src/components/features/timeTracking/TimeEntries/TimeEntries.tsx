import { useMemo } from 'react'
import { Clock, SearchX } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useTablePaginationProps } from '@hooks/utils/pagination/useTablePaginationProps'
import { type ListTimeEntriesFilterParams, useGetListTimeEntries } from '@api/businesses/[business-id]/time-tracking/time-entries/get'
import { TimeEntriesStoreProvider, useTimeEntriesDeleteModal, useTimeEntriesFilters } from '@providers/features/timeTracking/TimeEntriesStore/TimeEntriesStoreProvider'
import { DataState, DataStateStatus } from '@ui/DataState/DataState'
import { TimeEntriesTable } from '@features/timeTracking/TimeEntriesTable/TimeEntriesTable'
import { TimeEntryDeleteConfirmationModal } from '@features/timeTracking/TimeEntryDeleteConfirmationModal/TimeEntryDeleteConfirmationModal'
import { TimeEntryDrawer } from '@features/timeTracking/TimeEntryDrawer/TimeEntryDrawer'

interface TimeEntriesProps {
  filterParams?: Omit<ListTimeEntriesFilterParams, 'includeDeleted'>
  onStartTimer?: () => void
  isStartTimerDisabled?: boolean
}

const TimeEntriesEmptyState = () => {
  const { t } = useTranslation()
  const { selectedCustomer, selectedServiceId } = useTimeEntriesFilters()
  const isFiltered = !!(selectedCustomer || selectedServiceId)

  if (isFiltered) {
    return (
      <DataState
        status={DataStateStatus.info}
        title={t('timeTracking:empty.no_matching_entries', 'No time entries found')}
        description={t('timeTracking:empty.try_adjusting_filters', 'Try adjusting your filters.')}
        icon={<SearchX />}
        spacing
      />
    )
  }

  return (
    <DataState
      status={DataStateStatus.allDone}
      title={t('timeTracking:empty.no_entries_yet', 'No time entries yet')}
      description={t('timeTracking:empty.add_first_entry', 'Add your first time entry to start tracking.')}
      icon={<Clock />}
      spacing
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

export const TimeEntries = ({ filterParams, onStartTimer, isStartTimerDisabled }: TimeEntriesProps) => (
  <TimeEntriesStoreProvider onStartTimer={onStartTimer} isStartTimerDisabled={isStartTimerDisabled}>
    <TimeEntriesContent filterParams={filterParams} />
  </TimeEntriesStoreProvider>
)

const TimeEntriesContent = ({ filterParams }: Pick<TimeEntriesProps, 'filterParams'>) => {
  const { selectedCustomer, selectedServiceId } = useTimeEntriesFilters()
  const { entryToDelete } = useTimeEntriesDeleteModal()

  const timeEntriesFilterParams = useMemo(() => ({
    ...filterParams,
    ...(selectedCustomer && { customerId: selectedCustomer.id }),
    ...(selectedServiceId && { serviceId: selectedServiceId }),
  }), [filterParams, selectedCustomer, selectedServiceId])

  const { data, flattenedData: entries, isLoading, isError, hasMore, fetchMore } = useGetListTimeEntries(timeEntriesFilterParams)

  const tableSlots = useMemo(
    () => ({
      EmptyState: TimeEntriesEmptyState,
      ErrorState: TimeEntriesErrorState,
    }),
    [],
  )

  const paginationProps = useTablePaginationProps({
    filterParams: timeEntriesFilterParams,
    data,
    pageSize: 20,
    hasMore,
    fetchMore,
  })

  return (
    <>
      <TimeEntriesTable
        data={entries}
        isLoading={isLoading}
        isError={isError}
        paginationProps={paginationProps}
        slots={tableSlots}
      />
      <TimeEntryDrawer />
      {entryToDelete && (
        <TimeEntryDeleteConfirmationModal entry={entryToDelete} />
      )}
    </>
  )
}
