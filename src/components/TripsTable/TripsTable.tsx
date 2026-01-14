import { useMemo } from 'react'
import type { Row } from '@tanstack/react-table'
import { Car, Edit, Trash2 } from 'lucide-react'

import { type Trip, type TripPurpose } from '@schemas/trip'
import { formatCalendarDate } from '@utils/time/timeUtils'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import type { NestedColumnConfig } from '@components/DataTable/columnUtils'
import { PaginatedTable, type TablePaginationProps } from '@components/PaginatedDataTable/PaginatedDataTable'
import { TripsAddressCell } from '@components/TripsTable/TripsAddressCell'
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
  onEditTrip: (trip: Trip) => void
  onDeleteTrip: (trip: Trip) => void
}

type TripsRowType = Row<Trip>
const getColumnConfig = ({ onEditTrip, onDeleteTrip }: TripActions): NestedColumnConfig<Trip> => [
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
        <Button inset icon onPress={() => onEditTrip(row.original)} aria-label='View trip' variant='ghost'>
          <Edit size={20} />
        </Button>
        <Button inset icon onPress={() => onDeleteTrip(row.original)} aria-label='Delete trip' variant='ghost'>
          <Trash2 size={20} />
        </Button>
      </HStack>
    ),
  },
]

const TripsTableEmptyState = () => (
  <DataState
    status={DataStateStatus.allDone}
    title='No trips yet'
    description='Add your first trip to start tracking mileage.'
    icon={<Car />}
    spacing
  />
)

const TripsTableErrorState = () => (
  <DataState
    status={DataStateStatus.failed}
    title="We couldn't load your trips"
    description='An error occurred while loading your trips. Please check your connection and try again.'
    spacing
  />
)

export interface TripsTableProps {
  data: Trip[] | undefined
  isLoading: boolean
  isError: boolean
  paginationProps: TablePaginationProps
  onEditTrip: (trip: Trip) => void
  onDeleteTrip: (trip: Trip) => void
}

export const TripsTable = ({
  data,
  isLoading,
  isError,
  paginationProps,
  onEditTrip,
  onDeleteTrip,
}: TripsTableProps) => {
  const columnConfig = useMemo(() => getColumnConfig({ onEditTrip, onDeleteTrip }), [onEditTrip, onDeleteTrip])

  return (
    <PaginatedTable
      ariaLabel='Trips'
      data={data}
      isLoading={isLoading}
      isError={isError}
      columnConfig={columnConfig}
      paginationProps={paginationProps}
      componentName={COMPONENT_NAME}
      slots={{
        EmptyState: TripsTableEmptyState,
        ErrorState: TripsTableErrorState,
      }}
    />
  )
}
