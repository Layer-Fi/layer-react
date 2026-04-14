import { useCallback, useMemo, useState } from 'react'
import { Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { Customer } from '@schemas/customer'
import type { TimeEntry } from '@schemas/timeTracking'
import { type ListTimeEntriesFilterParams, useListTimeEntries } from '@hooks/api/businesses/[business-id]/time-tracking/time-entries/useListTimeEntries'
import { useAutoResetPageIndex } from '@hooks/utils/pagination/useAutoResetPageIndex'
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

export const TimeEntries = ({ filterParams, onStartTimer, isStartTimerDisabled }: TimeEntriesProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null)
  const [entryToDelete, setEntryToDelete] = useState<TimeEntry | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)

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

  const onViewOrUpsertEntry = useCallback((entry: TimeEntry | null) => {
    setSelectedEntry(entry)
    setIsDrawerOpen(true)
  }, [])

  const onDeleteEntry = useCallback((entry: TimeEntry) => {
    setEntryToDelete(entry)
  }, [])

  const handleDeleteConfirmationOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setEntryToDelete(null)
    }
  }, [])

  const handleDeleteSuccess = useCallback(() => {
    setSelectedEntry(null)
    setIsDrawerOpen(false)
  }, [])

  const handleDrawerSuccess = useCallback(() => {
    setSelectedEntry(null)
  }, [])

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
        onDeleteEntry={onDeleteEntry}
        onViewOrUpsertEntry={onViewOrUpsertEntry}
        onStartTimer={onStartTimer}
        isStartTimerDisabled={isStartTimerDisabled}
        selectedCustomer={selectedCustomer}
        onSelectedCustomerChange={setSelectedCustomer}
        selectedServiceId={selectedServiceId}
        onSelectedServiceIdChange={setSelectedServiceId}
        slots={tableSlots}
      />
      <TimeEntryDrawer
        isOpen={isDrawerOpen && !entryToDelete}
        onOpenChange={setIsDrawerOpen}
        entry={selectedEntry}
        onSuccess={handleDrawerSuccess}
        onDeleteEntry={onDeleteEntry}
      />
      {entryToDelete && (
        <TimeEntryDeleteConfirmationModal
          isOpen={!!entryToDelete}
          onOpenChange={handleDeleteConfirmationOpenChange}
          entry={entryToDelete}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  )
}
