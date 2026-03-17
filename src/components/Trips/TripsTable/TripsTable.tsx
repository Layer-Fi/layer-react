import { useCallback, useMemo } from 'react'
import type { Row } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import { Edit, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type Trip, type TripPurpose } from '@schemas/trip'
import { formatCalendarDate } from '@utils/time/timeUtils'
import { getVehicleDisplayName } from '@utils/vehicles'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { Container } from '@components/Container/Container'
import type { NestedColumnConfig } from '@components/DataTable/columnUtils'
import { PaginatedTable, type TablePaginationProps } from '@components/PaginatedDataTable/PaginatedDataTable'
import { TripsAddressCell } from '@components/Trips/TripAddressCell/TripAddressCell'
import { TripsTableHeader } from '@components/Trips/TripsTable/TripsTableHeader'
import { formatDistance, getPurposeLabel } from '@components/Trips/utils'

import './tripsTable.scss'

const COMPONENT_NAME = 'TripsTable'

enum TripColumns {
  TripDate = 'TripDate',
  Vehicle = 'Vehicle',
  Distance = 'Distance',
  Purpose = 'Purpose',
  Address = 'Address',
  Description = 'Description',
  Actions = 'Actions',
}

type TripActions = {
  onViewOrUpsertTrip: (trip: Trip) => void
  onDeleteTrip: (trip: Trip) => void
}

type TripsRowType = Row<Trip>
const getColumnConfig = ({ onViewOrUpsertTrip, onDeleteTrip }: TripActions, t: TFunction): NestedColumnConfig<Trip> => [
  {
    id: TripColumns.TripDate,
    header: t('common:label.date', 'Date'),
    cell: (row: TripsRowType) => formatCalendarDate(row.original.tripDate),
  },
  {
    id: TripColumns.Vehicle,
    header: t('vehicles:label.vehicle', 'Vehicle'),
    cell: (row: TripsRowType) => <Span ellipsis withTooltip>{getVehicleDisplayName(row.original.vehicle)}</Span>,
    isRowHeader: true,
  },
  {
    id: TripColumns.Distance,
    header: t('trips:label.distance', 'Distance'),
    cell: (row: TripsRowType) => <Span align='right'>{formatDistance(row.original.distance, t)}</Span>,
  },
  {
    id: TripColumns.Purpose,
    header: t('common:label.purpose', 'Purpose'),
    cell: (row: TripsRowType) => getPurposeLabel(row.original.purpose as TripPurpose, t),
  },
  {
    id: TripColumns.Address,
    header: t('common:label.address', 'Address'),
    cell: (row: TripsRowType) => <TripsAddressCell trip={row.original} />,
  },
  {
    id: TripColumns.Description,
    header: t('common:label.description', 'Description'),
    cell: (row: TripsRowType) => <Span ellipsis withTooltip>{row.original.description}</Span>,
  },
  {
    id: TripColumns.Actions,
    cell: (row: TripsRowType) => (
      <HStack gap='3xs'>
        <Button inset icon onPress={() => onViewOrUpsertTrip(row.original)} aria-label={t('trips:action.view_trip', 'View Trip')} variant='ghost'>
          <Edit size={20} />
        </Button>
        <Button inset icon onPress={() => onDeleteTrip(row.original)} aria-label={t('trips:action.delete_trip', 'Delete Trip')} variant='ghost'>
          <Trash2 size={20} />
        </Button>
      </HStack>
    ),
  },
]

export interface TripsTableProps {
  data: Trip[] | undefined
  isLoading: boolean
  isError: boolean
  paginationProps: TablePaginationProps
  onDeleteTrip: (trip: Trip) => void
  onViewOrUpsertTrip: (trip: Trip | null) => void
  slots: {
    EmptyState: React.FC
    ErrorState: React.FC
  }
}

export const TripsTable = ({
  data,
  isLoading,
  isError,
  paginationProps,
  onDeleteTrip,
  onViewOrUpsertTrip,
  slots,
}: TripsTableProps) => {
  const { t } = useTranslation()
  const columnConfig = useMemo(
    () => getColumnConfig({ onViewOrUpsertTrip, onDeleteTrip }, t),
    [onViewOrUpsertTrip, onDeleteTrip, t],
  )
  const onRecordTrip = useCallback(() => onViewOrUpsertTrip(null), [onViewOrUpsertTrip])

  return (
    <Container name='TripsTable'>
      <TripsTableHeader onRecordTrip={onRecordTrip} />
      <PaginatedTable
        ariaLabel={t('trips:label.trips', 'Trips')}
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
