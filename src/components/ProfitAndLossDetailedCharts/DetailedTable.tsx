import { useCallback } from 'react'
import classNames from 'classnames'

import { type SortDirection } from '@internal-types/general'
import { formatPercent } from '@utils/format'
import type { PnlChartLineItem } from '@utils/profitAndLossUtils'
import {
  type ProfitAndLossFilters,
  type Scope,
  type SidebarScope,
} from '@hooks/useProfitAndLoss/useProfitAndLoss'
import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import SortArrows from '@icons/SortArrows'
import { Button } from '@ui/Button/Button'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { isLineItemUncategorized, mapTypesToColors, type TypeColorMapping } from '@components/ProfitAndLossDetailedCharts/utils'

export interface DetailedTableStringOverrides {
  categoryColumnHeader?: string
  typeColumnHeader?: string
  valueColumnHeader?: string
}

export const UNCATEGORIZED_TYPES = ['UNCATEGORIZED_INFLOWS', 'UNCATEGORIZED_OUTFLOWS']

export interface DetailedTableProps {
  filteredData: PnlChartLineItem[]
  hoveredItem: PnlChartLineItem | undefined
  setHoveredItem: (item: PnlChartLineItem | undefined) => void
  sidebarScope: SidebarScope
  filters: ProfitAndLossFilters
  sortBy: (scope: Scope, field: string, direction?: SortDirection) => void
  chartColorsList?: string[]
  stringOverrides?: DetailedTableStringOverrides
  onValueClick?: (item: PnlChartLineItem) => void
}

const ValueIcon = ({
  item,
  typeColorMapping,
  idx,
}: {
  item: PnlChartLineItem
  typeColorMapping: TypeColorMapping[]
  idx: number
}) => {
  if (isLineItemUncategorized(item)) {
    return (
      <svg
        viewBox='0 0 12 12'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        width='12'
        height='12'
      >
        <defs>
          <pattern
            id='layer-pie-dots-pattern-legend'
            x='0'
            y='0'
            width='3'
            height='3'
            patternUnits='userSpaceOnUse'
          >
            <rect width='1' height='1' opacity={0.76} className='Layer__charts__dots-pattern-legend__dot' />
          </pattern>
        </defs>
        <rect width='12' height='12' id='layer-pie-dots-pattern-bg' rx='2' className='Layer__charts__dots-pattern-legend__bg' />
        <rect
          x='1'
          y='1'
          width='10'
          height='10'
          fill='url(#layer-pie-dots-pattern-legend)'
        />
      </svg>
    )
  }

  const colorMapping = typeColorMapping[idx]
  return (
    <div
      className='share-icon'
      style={{
        background: colorMapping?.color,
        opacity: colorMapping?.opacity,
      }}
    />
  )
}

export const DetailedTable = ({
  filteredData,
  sidebarScope,
  filters,
  sortBy,
  hoveredItem,
  setHoveredItem,
  chartColorsList,
  stringOverrides,
  onValueClick,
}: DetailedTableProps) => {
  const typeColorMapping = mapTypesToColors(filteredData, chartColorsList)
  const positiveTotal = filteredData
    .filter(x => x.value > 0)
    .reduce((sum, x) => sum + x.value, 0)

  const buildColClass = useCallback((column: string) => {
    if (!sidebarScope || !filters[sidebarScope]?.sortDirection) {
      return ''
    }
    if (filters[sidebarScope]?.sortBy === column) {
      return `sort--${filters[sidebarScope]?.sortDirection}`
    }
    return ''
  }, [sidebarScope, filters])

  const { isMobile } = useSizeClass()

  return (
    <div className='details-container'>
      <div className='table'>
        <table>
          <thead>
            <tr>
              <th></th>
              <th
                className={classNames('Layer__sortable-col', buildColClass('category'))}
                onClick={() => sortBy(sidebarScope ?? 'expenses', 'category')}
              >
                {stringOverrides?.categoryColumnHeader || 'Category'}
                {' '}
                <SortArrows className='Layer__sort-arrows' />
              </th>
              {!isMobile && (
                <th
                  className={classNames('Layer__sortable-col', buildColClass('type'))}
                  onClick={() => sortBy(sidebarScope ?? 'expenses', 'type')}
                >
                  {stringOverrides?.typeColumnHeader || 'Type'}
                  {' '}
                  <SortArrows className='Layer__sort-arrows' />
                </th>
              )}
              <th
                className={classNames('Layer__sortable-col', buildColClass('value'), 'value-col')}
                onClick={() => sortBy(sidebarScope ?? 'expenses', 'value')}
              >
                {stringOverrides?.valueColumnHeader || 'Value'}
                {' '}
                <SortArrows className='Layer__sort-arrows' />
              </th>
              <th className='percent-col'></th>
            </tr>
          </thead>
          <tbody>
            {filteredData
              .map((item, idx) => {
                const share = item.value > 0 ? item.value / positiveTotal : 0
                return (
                  <tr
                    key={`pl-side-table-item-${idx}`}
                    className={classNames(
                      'Layer__profit-and-loss-detailed-table__row',
                      hoveredItem && hoveredItem.name === item.name
                        ? 'active'
                        : '',
                    )}
                    onMouseEnter={() => setHoveredItem(item)}
                    onMouseLeave={() => setHoveredItem(undefined)}
                  >
                    <td className='color-col'>
                      <ValueIcon
                        item={item}
                        typeColorMapping={typeColorMapping}
                        idx={idx}
                      />
                    </td>
                    <td className='category-col'>{item.displayName}</td>
                    {!isMobile && (
                      <td className='type-col'>{item.type}</td>
                    )}
                    <td className='value-col'>
                      <Button
                        variant='text'
                        onPress={() => onValueClick?.(item)}
                        isDisabled={!onValueClick || UNCATEGORIZED_TYPES.includes(item.name)}
                      >
                        <MoneySpan size='sm' amount={item.value} />
                      </Button>
                    </td>
                    <td className='percent-col'>
                      <span className='share-text'>
                        {item.value < 0 ? '-' : `${formatPercent(share)}%`}
                      </span>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
