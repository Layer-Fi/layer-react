import { createContext, useCallback, useContext, useMemo } from 'react'
import { Clock, SearchX } from 'lucide-react'
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

const TimeEntriesEmptyTableContext = createContext({ isFiltered: false })

const TimeEntriesEmptyState = () => {
  const { t } = useTranslation()
  const { isFiltered } = useContext(TimeEntriesEmptyTableContext)

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
  const hasActiveTableFilters = !!(timeEntriesFilterParams.customerId || timeEntriesFilterParams.serviceId)

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

  const emptyTableContextValue = useMemo(
    () => ({ isFiltered: hasActiveTableFilters }),
    [hasActiveTableFilters],
  )

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
      <TimeEntriesEmptyTableContext.Provider value={emptyTableContextValue}>
        <TimeEntriesTable
          data={entries}
          isLoading={isLoading}
          isError={isError}
          paginationProps={paginationProps}
          slots={tableSlots}
        />
      </TimeEntriesEmptyTableContext.Provider>
      <TimeEntryDrawer />
      {entryToDelete && (
        <TimeEntryDeleteConfirmationModal entry={entryToDelete} />
      )}
    </>
  )
}
