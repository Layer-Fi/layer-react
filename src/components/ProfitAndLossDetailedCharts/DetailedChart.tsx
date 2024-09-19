import React, { useMemo } from 'react'
import { SidebarScope } from '../../hooks/useProfitAndLoss/useProfitAndLoss'
import { centsToDollars as formatMoney } from '../../models/Money'
import { LineBaseItem } from '../../types/line_item'
import { formatPercent } from '../../utils/format'
import { ProfitAndLossDatePicker } from '../ProfitAndLossDatePicker'
import { mapTypesToColors } from './DetailedTable'
import { HorizontalLineChart } from './HorizontalLineChart'
import classNames from 'classnames'
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
  chartColorsList?: string[]
  showHorizontalChart?: boolean
}

export interface ChartData {
  name: string
  value: number
  type: string
}

export const DetailedChart = ({
  filteredData,
  filteredTotal,
  hoveredItem,
  setHoveredItem,
  chartColorsList,
  isLoading,
  showDatePicker = true,
  showHorizontalChart = false,
  sidebarScope,
}: DetailedChartProps) => {
  const { chartData, negativeData, total, negativeTotal } = useMemo(() => {
    const chartData: ChartData[] = []
    const negativeData: ChartData[] = []
    let total = 0
    let negativeTotal = 0
    if (!filteredData) {
      return {
        chartData,
        negativeData,
        total: undefined,
        negativeTotal: undefined,
      }
    }

    filteredData.forEach(x => {
      if (x.hidden) {
        if (x.value < 0) {
          negativeData.push({
            name: x.display_name,
            value: 0,
            type: x.type,
          })
        } else {
          chartData.push({
            name: x.display_name,
            value: 0,
            type: x.type,
          })
        }
        return
      }

      if (x.value < 0) {
        negativeData.push({
          name: x.display_name,
          value: x.value,
          type: x.type,
        })
        negativeTotal -= x.value
      } else {
        chartData.push({
          name: x.display_name,
          value: x.value,
          type: x.type,
        })
        total += x.value
      }
    })

    if (total > negativeTotal) {
      negativeData.unshift({
        name: '',
        value: total - negativeTotal,
        type: 'empty',
      })
    } else {
      chartData.unshift({
        name: '',
        value: negativeTotal - total,
        type: 'empty',
      })
    }

    return { chartData, negativeData, total, negativeTotal }
  }, [filteredData, isLoading])

  const noValue = chartData.length === 0 || !chartData.find(x => x.value !== 0)

  const chartDataWithNoCategorized = chartData.filter(
    x => x.type !== 'Uncategorized',
  )

  const typeColorMapping = mapTypesToColors(
    chartDataWithNoCategorized.concat(negativeData),
    chartColorsList,
  )

  const uncategorizedTotal =
    chartData.find(x => x.type === 'Uncategorized')?.value ?? 0

  return (
    <div className='chart-field'>
      <div className='header--tablet'>
        {showDatePicker && <ProfitAndLossDatePicker />}
      </div>

      <div className='chart-container'>
        <ResponsiveContainer>
          <PieChart>
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
              <pattern
                id='layer-pie-dots-pattern'
                x='0'
                y='0'
                width='3'
                height='3'
                patternUnits='userSpaceOnUse'
              >
                <rect width='3' height='3' opacity={0.46} className='bg' />
                <rect width='1' height='1' opacity={0.56} />
              </pattern>
            </defs>
            {!isLoading && !noValue ? (
              <Pie
                data={chartDataWithNoCategorized}
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
                {chartDataWithNoCategorized.map((entry, index) => {
                  const placeholder = entry.type === 'empty'
                  let fill: string | undefined =
                    entry.type === 'empty'
                      ? '#fff'
                      : typeColorMapping.find(x => x.name === entry.name)
                          ?.color ?? '#f2f2f2'
                  let active = true
                  if (hoveredItem && entry.name !== hoveredItem) {
                    active = false
                    fill = undefined
                  }

                  return (
                    <Cell
                      key={`cell-${index}`}
                      className={classNames(
                        'Layer__profit-and-loss-detailed-charts__pie',
                        hoveredItem && active ? 'active' : 'inactive',
                        entry.type === 'Uncategorized' &&
                          'Layer__profit-and-loss-detailed-charts__pie--border',
                      )}
                      style={{
                        fill:
                          entry.type === 'Uncategorized' && fill
                            ? 'url(#layer-pie-dots-pattern)'
                            : fill,
                      }}
                      opacity={
                        placeholder
                          ? 0
                          : typeColorMapping.find(x => x.name === entry.name)
                              ?.opacity ?? 1
                      }
                      onMouseEnter={() =>
                        !placeholder && setHoveredItem(entry.name)
                      }
                      onMouseLeave={() =>
                        !placeholder && setHoveredItem(undefined)
                      }
                    />
                  )
                })}
                {negativeTotal !== 0 && !hoveredItem ? (
                  <>
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
                          y: (cy || 0) - 35,
                          textAnchor: 'middle' as
                            | 'start'
                            | 'middle'
                            | 'end'
                            | 'inherit',
                          verticalAnchor: 'middle' as
                            | 'start'
                            | 'middle'
                            | 'end',
                        }

                        let text = 'Positive'

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
                          y: (cy || 0) - 15,
                          textAnchor: 'middle' as
                            | 'start'
                            | 'middle'
                            | 'end'
                            | 'inherit',
                          verticalAnchor: 'middle' as
                            | 'start'
                            | 'middle'
                            | 'end',
                        }

                        return (
                          <ChartText
                            {...positioningProps}
                            className='pie-center-label__value'
                          >
                            {`$${formatMoney(total)}`}
                          </ChartText>
                        )
                      }}
                    />
                  </>
                ) : (
                  <>
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
                          verticalAnchor: 'middle' as
                            | 'start'
                            | 'middle'
                            | 'end',
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
                          verticalAnchor: 'middle' as
                            | 'start'
                            | 'middle'
                            | 'end',
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
                          verticalAnchor: 'middle' as
                            | 'start'
                            | 'middle'
                            | 'end',
                        }

                        if (hoveredItem) {
                          const found = filteredData.find(
                            x => x.display_name === hoveredItem,
                          )?.share
                          return (
                            <ChartText
                              {...positioningProps}
                              className='pie-center-label__share'
                            >
                              {found ? `${formatPercent(found)}%` : ''}
                            </ChartText>
                          )
                        }

                        return
                      }}
                    />
                  </>
                )}
              </Pie>
            ) : null}

            {!isLoading && !noValue && negativeTotal !== 0 ? (
              <Pie
                data={negativeData.map(x => ({
                  ...x,
                  value: Math.abs(x.value),
                }))}
                dataKey='value'
                nameKey='name'
                cx='50%'
                cy='50%'
                innerRadius={'74%'}
                outerRadius={'83%'}
                paddingAngle={0.5}
                animationDuration={200}
                animationEasing='ease-in-out'
              >
                {negativeData.map((entry, index) => {
                  const placeholder = entry.type === 'empty'
                  let fill: string | undefined =
                    entry.type === 'empty'
                      ? '#fff'
                      : typeColorMapping.find(x => x.name === entry.name)
                          ?.color ?? '#f2f2f2'
                  let active = true
                  if (hoveredItem && entry.name !== hoveredItem) {
                    active = false
                    fill = undefined
                  }

                  return (
                    <Cell
                      key={`cell-${index}`}
                      className={classNames(
                        'Layer__profit-and-loss-detailed-charts__pie',
                        hoveredItem && active ? 'active' : 'inactive',
                      )}
                      style={{ fill }}
                      opacity={
                        placeholder
                          ? 0
                          : typeColorMapping.find(x => x.name === entry.name)
                              ?.opacity ?? 1
                      }
                      onMouseEnter={() =>
                        !placeholder && setHoveredItem(entry.name)
                      }
                      onMouseLeave={() =>
                        !placeholder && setHoveredItem(undefined)
                      }
                    />
                  )
                })}
                {!hoveredItem && (
                  <>
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
                          y: (cy || 0) + 15,
                          textAnchor: 'middle' as
                            | 'start'
                            | 'middle'
                            | 'end'
                            | 'inherit',
                          verticalAnchor: 'middle' as
                            | 'start'
                            | 'middle'
                            | 'end',
                        }

                        let text = 'Negative'

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
                          y: (cy || 0) + 35,
                          textAnchor: 'middle' as
                            | 'start'
                            | 'middle'
                            | 'end'
                            | 'inherit',
                          verticalAnchor: 'middle' as
                            | 'start'
                            | 'middle'
                            | 'end',
                        }

                        return (
                          <ChartText
                            {...positioningProps}
                            className='pie-center-label__value'
                          >
                            {`-$${formatMoney(negativeTotal)}`}
                          </ChartText>
                        )
                      }}
                    />
                  </>
                )}
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
                      y: (cy || 0) - 25,
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
        {showHorizontalChart && (
          <HorizontalLineChart
            data={chartDataWithNoCategorized}
            uncategorizedTotal={uncategorizedTotal}
            netValue={filteredTotal}
            type={sidebarScope === 'expenses' ? 'Expenses' : 'Revenue'}
            typeColorMapping={typeColorMapping}
            hoveredItem={hoveredItem}
            setHoveredItem={setHoveredItem}
          />
        )}
      </div>
    </div>
  )
}
