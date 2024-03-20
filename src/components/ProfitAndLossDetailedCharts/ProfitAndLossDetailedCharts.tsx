import React, { useContext, useMemo, useState } from 'react'
import Select, { GroupBase } from 'react-select'
import SortArrows from '../../icons/SortArrows'
import XIcon from '../../icons/X'
import { centsToDollars as formatMoney } from '../../models/Money'
import { formatPercent } from '../../utils/format'
import { humanizeTitle } from '../../utils/profitAndLossUtils'
import { Button, ButtonVariant } from '../Button'
import { ProfitAndLoss as PNL } from '../ProfitAndLoss'
import { Text, TextSize, TextWeight } from '../Typography'
import classNames from 'classnames'
import { format } from 'date-fns'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Label,
  Text as ChartText,
} from 'recharts'
import { PolarViewBox } from 'recharts/types/util/types'

const INACTIVE_OPACITY_LEVELS = [0.85, 0.7, 0.66, 0.55, 0.4, 0.33, 0.25, 0.15]

const DEFAULT_CHART_COLORS = [
  {
    color: '#7417B3',
    opacity: 1,
  },
  {
    color: '#7417B3',
    opacity: 0.8,
  },
  {
    color: '#7417B3',
    opacity: 0.6,
  },
  {
    color: '#7417B3',
    opacity: 0.4,
  },
  {
    color: '#7417B3',
    opacity: 0.2,
  },
  {
    color: '#7417B3',
    opacity: 0.1,
  },
  {
    color: '#006A80',
    opacity: 1,
  },
  {
    color: '#006A80',
    opacity: 0.8,
  },
  {
    color: '#006A80',
    opacity: 0.6,
  },
  {
    color: '#006A80',
    opacity: 0.4,
  },
  {
    color: '#006A80',
    opacity: 0.2,
  },
  {
    color: '#006A80',
    opacity: 0.1,
  },
  {
    color: '#009930',
    opacity: 1,
  },
  {
    color: '#009930',
    opacity: 0.8,
  },
  {
    color: '#009930',
    opacity: 0.6,
  },
  {
    color: '#009930',
    opacity: 0.4,
  },
  {
    color: '#009930',
    opacity: 0.2,
  },
  {
    color: '#009930',
    opacity: 0.1,
  },
]

export const ProfitAndLossDetailedCharts = () => {
  const {
    data,
    filteredData,
    filteredTotal,
    sortBy,
    filters,
    isLoading,
    dateRange,
    sidebarScope,
    setSidebarScope,
    setFilterTypes,
  } = useContext(PNL.Context)

  const [hoveredItem, setHoveredItem] = useState<string | undefined>()

  const chartData = useMemo(() => {
    if (!filteredData) {
      return []
    }
    return filteredData.map(x => {
      if (x.hidden) {
        return {
          name: x.display_name,
          value: 0,
        }
      }
      return {
        name: x.display_name,
        value: x.value,
      }
    })
  }, [filteredData])

  return (
    <div
      className={classNames(
        'Layer__profit-and-loss__side-panel',
        sidebarScope && 'open',
      )}
    >
      <div className='Layer__profit-and-loss-detailed-charts'>
        <header>
          <div className='Layer__profit-and-loss-detailed-charts__head'>
            <Text size={TextSize.lg} weight={TextWeight.bold} className='title'>
              {humanizeTitle(sidebarScope)}
            </Text>
            <Text size={TextSize.sm} className='date'>
              {format(dateRange.startDate, 'LLLL, y')}
            </Text>
          </div>
          <Button
            rightIcon={<XIcon />}
            iconOnly={true}
            onClick={() => setSidebarScope(undefined)}
            variant={ButtonVariant.secondary}
          />
        </header>
        <div className='chart-container'>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
                dataKey='value'
                nameKey='name'
                cx='50%'
                cy='50%'
                innerRadius={105}
                outerRadius={120}
                paddingAngle={0.5}
                fill='#8884d8'
              >
                {chartData.map((entry, index) => {
                  const colorConfig =
                    DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length]
                  let fill: string | undefined = colorConfig.color
                  let opacity = colorConfig.opacity
                  let active = true
                  if (hoveredItem && entry.name !== hoveredItem) {
                    active = false
                    fill = undefined
                    opacity =
                      INACTIVE_OPACITY_LEVELS[
                        index % INACTIVE_OPACITY_LEVELS.length
                      ]
                  }

                  return (
                    <Cell
                      key={`cell-${index}`}
                      className={`Layer__profit-and-loss-detailed-charts__pie ${
                        hoveredItem && active ? 'active' : 'inactive'
                      }`}
                      style={{ fill }}
                      opacity={opacity}
                      onMouseEnter={() => setHoveredItem(entry.name)}
                      onMouseLeave={() => setHoveredItem(undefined)}
                    />
                  )
                })}
                <Label
                  position='center'
                  value='Total'
                  className='pie-center-label-title'
                  content={props => {
                    const { cx, cy } = (props.viewBox as PolarViewBox) ?? {
                      cx: 0,
                      cy: 0,
                    }
                    const positioningProps = {
                      x: cx,
                      y: (cy || 0) - 15,
                      textAnchor: 'middle' as
                        | 'start'
                        | 'middle'
                        | 'end'
                        | 'inherit',
                      verticalAnchor: 'middle' as 'start' | 'middle' | 'end',
                    }

                    let text = 'Total'

                    if (hoveredItem) {
                      text = hoveredItem
                    }

                    return (
                      <ChartText
                        {...positioningProps}
                        className='pie-center-label__title'
                      >
                        {text}
                      </ChartText>
                    )
                  }}
                />

                <Label
                  position='center'
                  value='Total'
                  className='pie-center-label-title'
                  content={props => {
                    const { cx, cy } = (props.viewBox as PolarViewBox) ?? {
                      cx: 0,
                      cy: 0,
                    }
                    const positioningProps = {
                      x: cx,
                      y: (cy || 0) + 5,
                      textAnchor: 'middle' as
                        | 'start'
                        | 'middle'
                        | 'end'
                        | 'inherit',
                      verticalAnchor: 'middle' as 'start' | 'middle' | 'end',
                    }

                    let value = filteredTotal
                    if (hoveredItem) {
                      value = filteredData.find(
                        x => x.display_name === hoveredItem,
                      )?.value
                    }

                    return (
                      <ChartText
                        {...positioningProps}
                        className='pie-center-label__value'
                      >
                        {`$${formatMoney(value)}`}
                      </ChartText>
                    )
                  }}
                />

                <Label
                  position='center'
                  value='Total'
                  className='pie-center-label-title'
                  content={props => {
                    const { cx, cy } = (props.viewBox as PolarViewBox) ?? {
                      cx: 0,
                      cy: 0,
                    }
                    const positioningProps = {
                      x: cx,
                      y: (cy || 0) + 25,
                      height: 20,
                      textAnchor: 'middle' as
                        | 'start'
                        | 'middle'
                        | 'end'
                        | 'inherit',
                      verticalAnchor: 'middle' as 'start' | 'middle' | 'end',
                    }

                    if (hoveredItem) {
                      return (
                        <ChartText
                          {...positioningProps}
                          className='pie-center-label__share'
                        >
                          {`${formatPercent(
                            filteredData.find(
                              x => x.display_name === hoveredItem,
                            )?.share,
                          )}%`}
                        </ChartText>
                      )
                    }

                    return
                  }}
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className='filters'>
          <Text size={TextSize.sm} className='Layer__label'>
            Filters
          </Text>
          <Select
            className='type-select'
            classNamePrefix='Layer__select'
            value={
              sidebarScope && filters[sidebarScope]?.types
                ? sidebarScope &&
                  filters[sidebarScope]?.types?.map(x => ({
                    value: x,
                    label: x,
                  }))
                : []
            }
            isMulti
            isClearable={false}
            options={
              [...new Set(filteredData?.map(x => x.type))].map(x => ({
                label: x,
                value: x,
              })) as unknown as readonly { value: string; label: string }[]
            }
            onChange={selected => {
              setFilterTypes(
                sidebarScope ?? 'expenses',
                selected.map(x => x.value),
              )
            }}
          />
        </div>
        <div className='details-container'>
          <div className='table'>
            <table>
              <thead>
                <tr>
                  <th
                    onClick={() =>
                      sortBy(sidebarScope ?? 'expenses', 'category')
                    }
                  >
                    Expense/Sale
                  </th>
                  <th
                    onClick={() => sortBy(sidebarScope ?? 'expenses', 'type')}
                  >
                    Type
                    <SortArrows
                      className={`Layer__sort-arrows Layer__sort-arrows--desc`}
                    />
                  </th>
                  <th></th>
                  <th
                    onClick={() => sortBy(sidebarScope ?? 'expenses', 'value')}
                  >
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData
                  .filter(x => !x.hidden)
                  .map((item, idx) => {
                    const colorConfig =
                      DEFAULT_CHART_COLORS[idx % DEFAULT_CHART_COLORS.length]
                    return (
                      <tr
                        key={`pl-side-table-item-${idx}`}
                        className={classNames(
                          'Layer__profit-and-loss-detailed-table__row',
                          hoveredItem && hoveredItem !== item.display_name
                            ? 'inactive'
                            : '',
                        )}
                        onMouseEnter={() => setHoveredItem(item.display_name)}
                        onMouseLeave={() => setHoveredItem(undefined)}
                      >
                        <td className='category-col'>{item.display_name}</td>
                        <td className='type-col'>{item.type}</td>
                        <td className='value-col'>
                          ${formatMoney(item.value)}
                        </td>
                        <td className='share-col'>
                          <span className='share-cell-content'>
                            {formatPercent(item.share)}%
                            <div
                              className='share-icon'
                              style={{
                                background: colorConfig.color,
                                opacity: colorConfig.opacity,
                              }}
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
      </div>
    </div>
  )
}
