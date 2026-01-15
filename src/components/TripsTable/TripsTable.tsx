import { useCallback, useMemo } from 'react'
import type { Row } from '@tanstack/react-table'
import { Edit, Trash2 } from 'lucide-react'

import { type Trip, type TripPurpose } from '@schemas/trip'
import { formatCalendarDate } from '@utils/time/timeUtils'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { Container } from '@components/Container/Container'
import type { NestedColumnConfig } from '@components/DataTable/columnUtils'
import { PaginatedTable, type TablePaginationProps } from '@components/PaginatedDataTable/PaginatedDataTable'
import { TripsAddressCell } from '@components/TripsTable/TripsAddressCell'
import { TripsTableHeader } from '@components/TripsTable/TripsTableHeader'
import { formatDistance, getPurposeLabel } from '@components/TripsTable/utils'
import { getVehicleDisplayName } from '@features/vehicles/util'

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
const getColumnConfig = ({ onViewOrUpsertTrip, onDeleteTrip }: TripActions): NestedColumnConfig<Trip> => [
  {
    id: TripColumns.TripDate,
    header: 'Date',
    cell: (row: TripsRowType) => formatCalendarDate(row.original.tripDate),
  },
  {
    id: TripColumns.Vehicle,
    header: 'Vehicle',
    cell: (row: TripsRowType) => <Span ellipsis withTooltip>{getVehicleDisplayName(row.original.vehicle)}</Span>,
    isRowHeader: true,
  },
  {
    id: TripColumns.Distance,
    header: 'Distance',
    cell: (row: TripsRowType) => <Span align='right'>{formatDistance(row.original.distance)}</Span>,
  },
  {
    id: TripColumns.Purpose,
    header: 'Purpose',
    cell: (row: TripsRowType) => getPurposeLabel(row.original.purpose as TripPurpose),
  },
  {
    id: TripColumns.Address,
    header: 'Address',
    cell: (row: TripsRowType) => <TripsAddressCell trip={row.original} />,
  },
  {
    id: TripColumns.Description,
    header: 'Description',
    cell: (row: TripsRowType) => <Span ellipsis withTooltip>{row.original.description}</Span>,
  },
  {
    id: TripColumns.Actions,
    cell: (row: TripsRowType) => (
      <HStack gap='3xs'>
        <Button inset icon onPress={() => onViewOrUpsertTrip(row.original)} aria-label='View Trip' variant='ghost'>
          <Edit size={20} />
        </Button>
        <Button inset icon onPress={() => onDeleteTrip(row.original)} aria-label='Delete Trip' variant='ghost'>
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
  const columnConfig = useMemo(() => getColumnConfig({ onViewOrUpsertTrip, onDeleteTrip }), [onViewOrUpsertTrip, onDeleteTrip])
  const onRecordTrip = useCallback(() => onViewOrUpsertTrip(null), [onViewOrUpsertTrip])

  return (
    <Container name='TripsTable'>
      <TripsTableHeader onRecordTrip={onRecordTrip} />
      <PaginatedTable
        ariaLabel='Trips'
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
