import { useMemo } from 'react'
import { SidebarScope } from '../../hooks/useProfitAndLoss/useProfitAndLoss'
import { centsToDollars as formatMoney } from '../../models/Money'
import { LineBaseItem } from '../../types/line_item'
import { formatPercent } from '../../utils/format'
import { ProfitAndLossDatePicker } from '../ProfitAndLossDatePicker'
import { mapTypesToColors } from './DetailedTable'
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

export const DetailedChart = ({
  filteredData,
  filteredTotal,
  hoveredItem,
  setHoveredItem,
  chartColorsList,
  isLoading,
  showDatePicker = true,
}: DetailedChartProps) => {
  const chartData = useMemo(() => {
    if (!filteredData) {
      return []
    }
    return filteredData.map((x) => {
      if (x.hidden) {
        return {
          ...x,
          name: x.display_name,
          value: 0,
          type: x.type,
        }
      }
      return {
        ...x,
        name: x.display_name,
        value: x.value > 0 ? x.value : 0,
        type: x.type,
      }
    })
  }, [filteredData, isLoading])

  const noValue = chartData.length === 0 || !chartData.find(x => x.value !== 0)

  const typeColorMapping = mapTypesToColors(chartData, chartColorsList)

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
            {!isLoading && !noValue
              ? (
                <Pie
                  data={chartData}
                  dataKey='value'
                  nameKey='name'
                  cx='50%'
                  cy='50%'
                  innerRadius='91%'
                  outerRadius='100%'
                  paddingAngle={0.5}
                  fill='#8884d8'
                  animationDuration={200}
                  animationEasing='ease-in-out'
                >
                  {chartData.map((entry, index) => {
                    let fill: string | undefined = typeColorMapping[index].color
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
                          entry.type === 'Uncategorized'
                          && 'Layer__profit-and-loss-detailed-charts__pie--border',
                        )}
                        style={{
                          fill:
                          entry.type === 'Uncategorized' && fill
                            ? 'url(#layer-pie-dots-pattern)'
                            : fill,
                        }}
                        opacity={typeColorMapping[index].opacity}
                        onMouseEnter={() => setHoveredItem(entry.name)}
                        onMouseLeave={() => setHoveredItem(undefined)}
                      />
                    )
                  })}
                  <Label
                    position='center'
                    value='Total'
                    className='pie-center-label-title'
                    content={(props) => {
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
                    content={(props) => {
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
                    content={(props) => {
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
                        const item = filteredData.find(
                          x => x.display_name === hoveredItem,
                        )
                        const positiveTotal = chartData.reduce((sum, x) => sum + x.value, 0)
                        const share = item?.value > 0 ? item.value / positiveTotal : 0
                        return (
                          <ChartText
                            {...positioningProps}
                            className='pie-center-label__share'
                          >
                            {`${formatPercent(share)}%`}
                          </ChartText>
                        )
                      }

                      return null
                    }}
                  />
                </Pie>
              )
              : null}

            {!isLoading && noValue
              ? (
                <Pie
                  data={[{ name: 'Total', value: 1 }]}
                  dataKey='value'
                  nameKey='name'
                  cx='50%'
                  cy='50%'
                  innerRadius='91%'
                  outerRadius='100%'
                  paddingAngle={0}
                  fill='#F8F8FA'
                  animationDuration={200}
                  animationEasing='ease-in-out'
                >
                  <Label
                    position='center'
                    value='Total'
                    className='pie-center-label-title'
                    content={(props) => {
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
                    content={(props) => {
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
              )
              : null}

            {isLoading
              ? (
                <Pie
                  data={[{ name: 'loading...', value: 1 }]}
                  dataKey='value'
                  nameKey='name'
                  cx='50%'
                  cy='50%'
                  innerRadius='91%'
                  outerRadius='100%'
                  paddingAngle={0}
                  fill='#F8F8FA'
                  animationDuration={200}
                  animationEasing='ease-in-out'
                />
              )
              : null}
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
