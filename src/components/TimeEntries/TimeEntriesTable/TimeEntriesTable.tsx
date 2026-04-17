import { memo, useMemo } from 'react'
import type { Row } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import { Edit, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { TimeEntry } from '@schemas/timeTracking'
import { formatCalendarDate } from '@utils/time/timeUtils'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useTimeEntriesDeleteModal, useTimeEntriesDrawer } from '@providers/TimeEntriesStore/TimeEntriesStoreProvider'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { Container } from '@components/Container/Container'
import type { NestedColumnConfig } from '@components/DataTable/columnUtils'
import { PaginatedTable, type TablePaginationProps } from '@components/PaginatedDataTable/PaginatedDataTable'
import { TimeEntriesTableHeader } from '@components/TimeEntries/TimeEntriesTable/TimeEntriesTableHeader'

import './timeEntriesTable.scss'

const COMPONENT_NAME = 'TimeEntriesTable'

enum TimeEntryColumns {
  EntryDate = 'EntryDate',
  Duration = 'Duration',
  Customer = 'Customer',
  Service = 'Service',
  Actions = 'Actions',
}

type TimeEntryRowType = Row<TimeEntry>

const TimeEntryDateCell = memo(function TimeEntryDateCell({ date }: { date: TimeEntry['date'] }) {
  const { formatDate } = useIntlFormatter()
  return formatCalendarDate(date, formatDate)
})

const TimeEntryDurationCell = memo(function TimeEntryDurationCell({ durationMinutes }: { durationMinutes: TimeEntry['durationMinutes'] }) {
  const { t } = useTranslation()
  const { formatMinutesAsDuration } = useIntlFormatter()
  if (durationMinutes < 1) {
    return <Span>{t('timeTracking:label.less_than_one_minute', '< 1 min')}</Span>
  }
  return <Span>{formatMinutesAsDuration(durationMinutes)}</Span>
})

const TimeEntryActionsCell = memo(function TimeEntryActionsCell({ entry }: { entry: TimeEntry }) {
  const { t } = useTranslation()
  const { setDrawerOpen } = useTimeEntriesDrawer()
  const { setDeleteModalOpen } = useTimeEntriesDeleteModal()
  const isLocked = !!entry.invoiceLineItem

  return (
    <HStack gap='3xs'>
      <Button
        inset
        icon
        onPress={() => setDrawerOpen(true, entry)}
        aria-label={t('timeTracking:action.view_entry', 'View Entry')}
        variant='ghost'
      >
        <Edit size={20} />
      </Button>
      {!isLocked && (
        <Button
          inset
          icon
          onPress={() => setDeleteModalOpen(true, entry)}
          aria-label={t('timeTracking:action.delete_entry', 'Delete Entry')}
          variant='ghost'
        >
          <Trash2 size={20} />
        </Button>
      )}
    </HStack>
  )
})

const getColumnConfig = (t: TFunction): NestedColumnConfig<TimeEntry> => [
  {
    id: TimeEntryColumns.EntryDate,
    header: t('common:label.date', 'Date'),
    cell: (row: TimeEntryRowType) => <TimeEntryDateCell date={row.original.date} />,
  },
  {
    id: TimeEntryColumns.Duration,
    header: t('timeTracking:label.duration', 'Duration'),
    cell: (row: TimeEntryRowType) => <TimeEntryDurationCell durationMinutes={row.original.durationMinutes} />,
  },
  {
    id: TimeEntryColumns.Service,
    header: t('timeTracking:label.service', 'Service'),
    cell: (row: TimeEntryRowType) => (
      <Span ellipsis withTooltip>{row.original.service?.name || '—'}</Span>
    ),
    isRowHeader: true,
  },
  {
    id: TimeEntryColumns.Customer,
    header: t('timeTracking:label.customer', 'Customer'),
    cell: (row: TimeEntryRowType) => (
      <Span ellipsis withTooltip>
        {row.original.customer?.individualName || row.original.customer?.companyName || '—'}
      </Span>
    ),
  },
  {
    id: TimeEntryColumns.Actions,
    cell: (row: TimeEntryRowType) => <TimeEntryActionsCell entry={row.original} />,
  },
]

export interface TimeEntriesTableProps {
  data: TimeEntry[] | undefined
  isLoading: boolean
  isError: boolean
  paginationProps: TablePaginationProps
  slots: {
    EmptyState: React.FC
    ErrorState: React.FC
  }
}

const TimeEntriesTableComponent = ({
  data,
  isLoading,
  isError,
  paginationProps,
  slots,
}: TimeEntriesTableProps) => {
  const { t } = useTranslation()
  const columnConfig = useMemo(() => getColumnConfig(t), [t])

  return (
    <Container name='TimeEntriesTable'>
      <TimeEntriesTableHeader />
      <PaginatedTable
        ariaLabel={t('timeTracking:label.time_entries', 'Time Entries')}
        data={data}
        isLoading={isLoading}
        isError={isError}
        columnConfig={columnConfig}
        paginationProps={paginationProps}
        componentName={COMPONENT_NAME}
        slots={slots}
      />
    </Container>
  )
}

export const TimeEntriesTable = TimeEntriesTableComponent
