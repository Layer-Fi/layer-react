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
import SortArrows from '@icons/SortArrows'
import { Button } from '@ui/Button/Button'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { UncategorizedIcon } from '@components/ProfitAndLossDetailedCharts/UncategorizedIcon'
import { isLineItemUncategorized, mapTypesToColors, type TypeColorMapping } from '@components/ProfitAndLossDetailedCharts/utils'

export interface DetailedTableMobileStringOverrides {
  categoryColumnHeader?: string
  valueColumnHeader?: string
}

export const UNCATEGORIZED_TYPES = ['UNCATEGORIZED_INFLOWS', 'UNCATEGORIZED_OUTFLOWS']

export interface DetailedTableMobileProps {
  filteredData: PnlChartLineItem[]
  hoveredItem: PnlChartLineItem | undefined
  setHoveredItem: (item: PnlChartLineItem | undefined) => void
  sidebarScope: SidebarScope
  filters: ProfitAndLossFilters
  sortBy: (scope: Scope, field: string, direction?: SortDirection) => void
  chartColorsList?: string[]
  stringOverrides?: DetailedTableMobileStringOverrides
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
    return <UncategorizedIcon variant='mobile' />
  }

  return (
    <div
      className='share-icon'
      style={{
        background: typeColorMapping[idx].color,
        opacity: typeColorMapping[idx].opacity,
      }}
    />
  )
}

export const DetailedTableMobile = ({
  filteredData,
  sidebarScope,
  filters,
  sortBy,
  hoveredItem,
  setHoveredItem,
  chartColorsList,
  stringOverrides,
  onValueClick,
}: DetailedTableMobileProps) => {
  const buildColClass = (column: string) => {
    return classNames(
      'Layer__sortable-col',
      sidebarScope && filters[sidebarScope]?.sortBy === column
        ? `sort--${
          (sidebarScope && filters[sidebarScope]?.sortDirection) ?? 'desc'
        }`
        : '',
    )
  }

  const typeColorMapping = mapTypesToColors(filteredData, chartColorsList)
  const positiveTotal = filteredData
    .filter(x => x.value > 0)
    .reduce((sum, x) => sum + x.value, 0)

  const onSelectHeader = useCallback((column: 'category' | 'value') => {
    return () => {
      switch (column) {
        case 'category':
          sortBy(sidebarScope ?? 'expenses', 'category')
          break
        case 'value':
          sortBy(sidebarScope ?? 'expenses', 'value')
          break
      }
    }
  }, [sidebarScope, sortBy])

  return (
    <div className='details-container details-container--mobile'>
      <div className='table'>
        <table>
          <thead>
            <tr>
              <th
                className={buildColClass('category')}
                onClick={onSelectHeader('category')}
              >
                {stringOverrides?.categoryColumnHeader || 'Category'}
                {' '}
                <SortArrows className='Layer__sort-arrows' />
              </th>
              <th
                className={buildColClass('value')}
                onClick={onSelectHeader('value')}
              >
                {stringOverrides?.valueColumnHeader || 'Value'}
                {' '}
                <SortArrows className='Layer__sort-arrows' />
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData
              .map((item, idx) => {
                const share = item.value > 0 ? item.value / positiveTotal : 0
                return (
                  <tr
                    key={`pl-side-table-item-mobile-${idx}`}
                    className={classNames(
                      'Layer__profit-and-loss-detailed-table__row',
                      hoveredItem && hoveredItem.name === item.name
                        ? 'active'
                        : '',
                    )}
                    onMouseEnter={() => setHoveredItem(item)}
                    onMouseLeave={() => setHoveredItem(undefined)}
                  >
                    <td className='category-col'>
                      <span className='category-cell-content'>
                        <ValueIcon
                          item={item}
                          typeColorMapping={typeColorMapping}
                          idx={idx}
                        />
                        {item.displayName}
                      </span>
                    </td>
                    <td className='value-col'>
                      <span className='value-cell-content'>
                        <Button
                          variant='text'
                          onPress={() => onValueClick?.(item)}
                          isDisabled={!onValueClick || UNCATEGORIZED_TYPES.includes(item.name)}
                        >
                          <MoneySpan size='sm' amount={item.value} />
                        </Button>
                        <Span size='sm' className='Layer__profit-and-loss-detailed-table__pct'>
                          {item.value < 0 ? '' : `${formatPercent(share)}%`}
                        </Span>
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
