import { type SeriesData } from '@components/DetailedCharts/types'
import { type DetailedTableProps } from '@components/DetailedTable/DetailedTable'

export const NO_OP_INTERACTION_PROPS = {
  hoveredItem: undefined,
  setHoveredItem: () => {},
}

export const NO_SORT_PROPS: Pick<DetailedTableProps<SeriesData>, 'sortParams' | 'sortFunction'> = { sortParams: { sortBy: 'value' }, sortFunction: () => {} }
