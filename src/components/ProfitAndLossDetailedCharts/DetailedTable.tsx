import React from 'react'
import { DEFAULT_CHART_COLOR_TYPE } from '../../config/charts'
import {
  Scope,
  SidebarScope,
  ProfitAndLossFilters,
} from '../../hooks/useProfitAndLoss/useProfitAndLoss'
import SortArrows from '../../icons/SortArrows'
import { centsToDollars as formatMoney } from '../../models/Money'
import { SortDirection } from '../../types'
import { LineBaseItem } from '../../types/line_item'
import { formatPercent } from '../../utils/format'
import classNames from 'classnames'

export interface DetailedTableStringOverrides {
  categoryColumnHeader?: string
  typeColumnHeader?: string
  valueColumnHeader?: string
}

export interface DetailedTableProps {
  filteredData: LineBaseItem[]
  hoveredItem?: string
  setHoveredItem: (name?: string) => void
  sidebarScope: SidebarScope
  filters: ProfitAndLossFilters
  sortBy: (scope: Scope, field: string, direction?: SortDirection) => void
  chartColorsList?: string[]
  stringOverrides?: DetailedTableStringOverrides
}

export const mapTypesToColors = (
  data: any[],
  colorList: string[] = DEFAULT_CHART_COLOR_TYPE,
) => {
  const typeToColor: any = {}
  const typeToLastOpacity: any = {}
  let colorIndex = 0

  return data.map(obj => {
    const type = obj.type

    if (type === 'Uncategorized') {
      return {
        color: '#EEEEF0',
        opacity: 1,
      }
    }

    if (!typeToColor[type]) {
      typeToColor[type] = colorList[colorIndex % colorList.length]
      colorIndex++
      typeToLastOpacity[type] = 1
    } else {
      typeToLastOpacity[type] -= 0.1
    }

    const opacity = typeToLastOpacity[type]

    return {
      color: typeToColor[type],
      opacity: opacity,
    }
  })
}

const ValueIcon = ({
  item,
  typeColorMapping,
  idx,
}: {
  item: LineBaseItem
  typeColorMapping: any
  idx: number
}) => {
  if (item.type === 'Uncategorized') {
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
            <rect width='1' height='1' opacity={0.76} />
          </pattern>
        </defs>
        <rect width='12' height='12' id='layer-pie-dots-pattern-bg' rx='2' />
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

export const DetailedTable = ({
  filteredData,
  sidebarScope,
  filters,
  sortBy,
  hoveredItem,
  setHoveredItem,
  chartColorsList,
  stringOverrides,
}: DetailedTableProps) => {
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

  const typeColorMapping: any = mapTypesToColors(filteredData, chartColorsList)

  return (
    <div className='details-container'>
      <div className='table'>
        <table>
          <thead>
            <tr>
              <th
                className={buildColClass('category')}
                onClick={() => sortBy(sidebarScope ?? 'expenses', 'category')}
              >
                {stringOverrides?.categoryColumnHeader || 'Category'}{' '}
                <SortArrows className='Layer__sort-arrows' />
              </th>
              <th
                className={buildColClass('type')}
                onClick={() => sortBy(sidebarScope ?? 'expenses', 'type')}
              >
                {stringOverrides?.typeColumnHeader || 'Type'}{' '}
                <SortArrows className='Layer__sort-arrows' />
              </th>
              <th></th>
              <th
                className={buildColClass('value')}
                onClick={() => sortBy(sidebarScope ?? 'expenses', 'value')}
              >
                {stringOverrides?.valueColumnHeader || 'Value'}{' '}
                <SortArrows className='Layer__sort-arrows' />
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData
              .filter(x => !x.hidden)
              .map((item, idx) => {
                return (
                  <tr
                    key={`pl-side-table-item-${idx}`}
                    className={classNames(
                      'Layer__profit-and-loss-detailed-table__row',
                      hoveredItem && hoveredItem === item.display_name
                        ? 'active'
                        : '',
                    )}
                    onMouseEnter={() => setHoveredItem(item.display_name)}
                    onMouseLeave={() => setHoveredItem(undefined)}
                  >
                    <td className='category-col'>{item.display_name}</td>
                    <td className='type-col'>{item.type}</td>
                    <td className='value-col'>${formatMoney(item.value)}</td>
                    <td className='share-col'>
                      <span className='share-cell-content'>
                        {item.share !== undefined
                          ? `${formatPercent(item.share)}%`
                          : ''}
                        <ValueIcon
                          item={item}
                          typeColorMapping={typeColorMapping}
                          idx={idx}
                        />
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
