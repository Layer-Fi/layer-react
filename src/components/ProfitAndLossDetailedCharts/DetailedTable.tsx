import React from 'react'
import {
  DEFAULT_CHART_COLOR_TYPE,
  DEFAULT_CHART_NEGATIVE_COLOR,
} from '../../config/charts'
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

export interface ColorsMapOption {
  color: string
  name: string
  opacity: number
  type: string
}

export const mapTypesToColors = (
  data: any[],
  colorList: string[] = DEFAULT_CHART_COLOR_TYPE,
  negativeColor = DEFAULT_CHART_NEGATIVE_COLOR,
): ColorsMapOption[] => {
  const typeToColor: any = {}
  const typeToLastOpacity: any = {}
  let colorIndex = 0
  let colorNegativeIndex = 0

  return data.map(obj => {
    const type = obj.value < 0 ? 'negative' : obj.type

    if (type === 'Uncategorized') {
      return {
        color: '#EEEEF0',
        opacity: 1,
        type: 'Uncategorized',
        name: 'Uncategorized',
      }
    }

    if (type === 'empty') {
      return {
        color: '#fff',
        opacity: 0,
        type: 'empty',
        name: 'empty',
      }
    }

    if (type === 'negative' && !typeToColor['negative']) {
      typeToColor['negative'] = negativeColor
      colorNegativeIndex++
      typeToLastOpacity[type] = 1
    } else if (type === 'negative' && typeToColor[type]) {
      typeToLastOpacity[type] -= 0.1
    } else if (!typeToColor[type]) {
      typeToColor[type] = colorList[colorIndex % colorList.length]
      colorIndex++
      typeToLastOpacity[type] = 1
    } else {
      typeToLastOpacity[type] -= 0.1
    }

    const opacity = typeToLastOpacity[type]

    return {
      type: type,
      name: obj.name,
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
  typeColorMapping: ColorsMapOption[]
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
            id='layer-pie-stripe-pattern'
            x='0'
            y='0'
            width='4'
            height='4'
            patternTransform='rotate(45)'
            patternUnits='userSpaceOnUse'
          >
            <rect width='4' height='4' opacity={0.16} />
            <line x1='0' y='0' x2='0' y2='4' strokeWidth='2' />
          </pattern>

          <rect width='1' height='1' opacity={0.76} />
        </defs>
        <rect
          width='12'
          height='12'
          fill='url(#layer-pie-stripe-pattern)'
          rx='3'
        />
      </svg>
    )
  }

  const colorMapping = typeColorMapping.find(x => x.name === item.name) ?? {
    color: '#f2f2f2',
    opacity: 1,
  }

  return (
    <div
      className='share-icon'
      style={{
        background: colorMapping.color,
        opacity: colorMapping.opacity,
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

  const typeColorMapping = mapTypesToColors(filteredData, chartColorsList)

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
