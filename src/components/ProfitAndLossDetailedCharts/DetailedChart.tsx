import React, { useMemo } from 'react'
import { SidebarScope } from '../../hooks/useProfitAndLoss/useProfitAndLoss'
import { centsToDollars as formatMoney } from '../../models/Money'
import { LineBaseItem } from '../../types/line_item'
import { formatPercent } from '../../utils/format'
import { ProfitAndLossDatePicker } from '../ProfitAndLossDatePicker'
import { Text, TextSize, TextWeight } from '../Typography'
import { ColorsMapOption, mapTypesToColors } from './DetailedTable'
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
}

interface ChartData {
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
}: DetailedChartProps) => {
  // const chartData = useMemo(() => {
  //   if (!filteredData) {
  //     return []
  //   }
  //   return filteredData.map(x => {
  //     if (x.hidden) {
  //       return {
  //         name: x.display_name,
  //         value: 0,
  //         type: x.type,
  //       }
  //     }
  //     return {
  //       name: x.display_name,
  //       value: x.value,
  //       type: x.type,
  //     }
  //   })
  // }, [filteredData, isLoading])

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

            {/*   -------------   */}

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

                  console.log('active', fill, active, entry.name, hoveredItem)

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
            {/*   -------------   */}

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
        <HorizontalLineChart
          data={chartDataWithNoCategorized}
          uncategorizedTotal={uncategorizedTotal}
          netRevenue={filteredTotal}
          typeColorMapping={typeColorMapping}
        />
      </div>
    </div>
  )
}

const HorizontalLineChart = ({
  data,
  uncategorizedTotal,
  netRevenue,
  typeColorMapping,
}: {
  data?: ChartData[]
  uncategorizedTotal: number
  netRevenue?: number
  typeColorMapping: ColorsMapOption[]
}) => {
  if (!data) {
    return
  }

  const total =
    data.reduce((x, { value }) => (value < 0 ? x : x + value), 0) +
    uncategorizedTotal

  const items = data
    .filter(x => x.value >= 0 && x.type !== 'empty')
    .map(x => ({ ...x, share: x.value / total }))

  if (uncategorizedTotal > 0) {
    items.push({
      name: 'Uncategorized',
      value: uncategorizedTotal,
      type: 'uncategorized',
      share: uncategorizedTotal / total,
    })
  }

  return (
    <div className='Layer__profit-and-loss-horiztonal-line-chart'>
      <div className='Layer__profit-and-loss-horiztonal-line-chart__details-row'>
        <Text
          className='Layer__profit-and-loss-horiztonal-line-chart__details-label'
          size={TextSize.sm}
        >
          Net Revenue
        </Text>
        <Text
          className='Layer__profit-and-loss-horiztonal-line-chart__details-value'
          size={TextSize.sm}
          weight={TextWeight.bold}
        >
          {`$${formatMoney(netRevenue)}`}
        </Text>
      </div>
      {!items || items.length === 0 ? (
        <div className='Layer__profit-and-loss-horiztonal-line-chart__bar'>
          <span className='Layer__profit-and-loss-horiztonal-line-chart__item Layer__profit-and-loss-horiztonal-line-chart__item--placeholder' />
        </div>
      ) : (
        <div className='Layer__profit-and-loss-horiztonal-line-chart__bar'>
          {items.map((x, index) => {
            if (x.type === 'uncategorized') {
              return (
                <span
                  className='Layer__profit-and-loss-horiztonal-line-chart__item'
                  style={{ width: `${x.share * 100}%`, background: '#f2f2f2' }}
                />
              )
            }

            const { color, opacity } =
              typeColorMapping.find(y => y.name === x.name) ??
              typeColorMapping[0]
            return (
              <span
                className='Layer__profit-and-loss-horiztonal-line-chart__item'
                style={{
                  width: `${x.share * 100}%`,
                  background: color,
                  opacity,
                }}
              />
            )
          })}
        </div>
      )}
      <div className='Layer__profit-and-loss-horiztonal-line-chart__details-row'>
        <div className='Layer__profit-and-loss-horiztonal-line-chart__details-col'>
          <Text
            className='Layer__profit-and-loss-horiztonal-line-chart__details-label'
            size={TextSize.sm}
          >
            Categorized
          </Text>
          <Text
            className='Layer__profit-and-loss-horiztonal-line-chart__details-value'
            size={TextSize.sm}
            weight={TextWeight.bold}
          >
            {`$${formatMoney(total)}`}
          </Text>
        </div>
        <div className='Layer__profit-and-loss-horiztonal-line-chart__details-col Layer__align-end'>
          <Text
            className='Layer__profit-and-loss-horiztonal-line-chart__details-label'
            size={TextSize.sm}
          >
            Uncategorized
          </Text>
          <Text
            className='Layer__profit-and-loss-horiztonal-line-chart__details-value'
            size={TextSize.sm}
            weight={TextWeight.bold}
          >{`$${formatMoney(uncategorizedTotal)}`}</Text>
        </div>
      </div>
    </div>
  )
}
