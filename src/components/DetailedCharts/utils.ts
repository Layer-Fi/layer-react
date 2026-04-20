import { type SeriesData } from '@components/DetailedCharts/types'
import { type DetailedTableProps } from '@components/DetailedTable/DetailedTable'

export const NoOpHoverInteractionProps = {
  hoveredItem: undefined,
  setHoveredItem: () => {},
}

export const NoSortProps: Pick<DetailedTableProps<SeriesData>, 'sortParams' | 'sortFunction'> = { sortParams: { sortBy: 'value' }, sortFunction: () => {} }
