import { type SeriesData } from '@ui/Chart/seriesTypes'
import { type DetailedTableProps } from '@blocks/DetailedTable/DetailedTable'

export const NO_OP_INTERACTION_PROPS = {
  hoveredItem: undefined,
  setHoveredItem: () => {},
}

export const NO_SORT_PROPS: Pick<DetailedTableProps<SeriesData>, 'sortParams' | 'sortFunction'> = { sortParams: { sortBy: 'value' }, sortFunction: () => {} }
