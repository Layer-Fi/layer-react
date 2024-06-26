import React, { useMemo } from 'react'
import {
  INACTIVE_OPACITY_LEVELS,
  DEFAULT_CHART_COLORS,
} from '../../config/charts'
import { SidebarScope } from '../../hooks/useProfitAndLoss/useProfitAndLoss'
import { centsToDollars as formatMoney } from '../../models/Money'
import { LineBaseItem } from '../../types/line_item'
import { formatPercent } from '../../utils/format'
import { humanizeTitle } from '../../utils/profitAndLossUtils'
import { ProfitAndLossDatePicker } from '../ProfitAndLossDatePicker'
import { Text, TextSize, TextWeight } from '../Typography'
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

interface DetailedChartProps {
  filteredData: LineBaseItem[]
  filteredTotal?: number
  hoveredItem?: string
  setHoveredItem: (name?: string) => void
  sidebarScope?: SidebarScope
  date: number | Date
  isLoading?: boolean
  showDatePicker?: boolean
}

export const DetailedChart = ({
  filteredData,
  filteredTotal,
  hoveredItem,
  setHoveredItem,
  sidebarScope,
  date,
  isLoading,
  showDatePicker = true,
}: DetailedChartProps) => {
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
  }, [filteredData, isLoading])

  const noValue = chartData.length === 0 || !chartData.find(x => x.value !== 0)

  return (
    <div className='chart-field'>
      <div className='header--tablet'>
        <Text size={TextSize.lg} weight={TextWeight.bold} className='title'>
          {humanizeTitle(sidebarScope)}
        </Text>

        {showDatePicker && <ProfitAndLossDatePicker />}
      </div>

      <div className='chart-container'>
        <ResponsiveContainer>
          <PieChart>
            {!isLoading && !noValue ? (
              <Pie
                data={chartData}
                dataKey='value'
                nameKey='name'
                cx='50%'
                cy='50%'
                innerRadius={'91%'}
                outerRadius={'100%'}
                paddingAngle={0.5}
                fill='#8884d8'
                animationDuration={200}
                animationEasing='ease-in-out'
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
            ) : null}

            {!isLoading && noValue ? (
              <Pie
                data={[{ name: 'Total', value: 1 }]}
                dataKey='value'
                nameKey='name'
                cx='50%'
                cy='50%'
                innerRadius={'91%'}
                outerRadius={'100%'}
                paddingAngle={0}
                fill='#F8F8FA'
                animationDuration={200}
                animationEasing='ease-in-out'
              >
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
              </Pie>
            ) : null}

            {isLoading ? (
              <Pie
                data={[{ name: 'loading...', value: 1 }]}
                dataKey='value'
                nameKey='name'
                cx='50%'
                cy='50%'
                innerRadius={'91%'}
                outerRadius={'100%'}
                paddingAngle={0}
                fill='#F8F8FA'
                animationDuration={200}
                animationEasing='ease-in-out'
              />
            ) : null}
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
