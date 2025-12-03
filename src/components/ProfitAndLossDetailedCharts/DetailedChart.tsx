import { useMemo } from 'react'
import classNames from 'classnames'
import {
  Cell,
  Label,
  Pie,
  PieChart,
  ResponsiveContainer,
  Text as ChartText,
} from 'recharts'
import { type PolarViewBox } from 'recharts/types/util/types'

import { centsToDollars as formatMoney } from '@models/Money'
import { formatPercent } from '@utils/format'
import type { PnlChartLineItem } from '@utils/profitAndLossUtils'
import { type SidebarScope } from '@hooks/useProfitAndLoss/useProfitAndLoss'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'
import { isLineItemUncategorized, mapTypesToColors } from '@components/ProfitAndLossDetailedCharts/utils'

interface DetailedChartProps {
  filteredData: PnlChartLineItem[]
  filteredTotal?: number
  hoveredItem: PnlChartLineItem | undefined
  setHoveredItem: (item: PnlChartLineItem | undefined) => void
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
  const chartData = useMemo(() => filteredData.map(x => ({
    ...x,
    value: x.value > 0 ? x.value : 0,
  }
  )),
  [filteredData])

  const noValue = chartData.length === 0 || !chartData.find(x => x.value !== 0)

  const typeColorMapping = mapTypesToColors(chartData, chartColorsList)

  return (
    <div className='chart-field'>
      <div className='header--tablet'>
        {showDatePicker && <GlobalMonthPicker />}
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
                  nameKey='displayName'
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
                    if (hoveredItem && entry.name !== hoveredItem.name) {
                      active = false
                      fill = undefined
                    }

                    return (
                      <Cell
                        key={`cell-${index}`}
                        className={classNames(
                          'Layer__profit-and-loss-detailed-charts__pie',
                          hoveredItem && active ? 'active' : 'inactive',
                          isLineItemUncategorized(entry)
                          && 'Layer__profit-and-loss-detailed-charts__pie--border',
                        )}
                        style={{
                          fill:
                          isLineItemUncategorized(entry) && fill
                            ? 'url(#layer-pie-dots-pattern)'
                            : fill,
                        }}
                        opacity={typeColorMapping[index].opacity}
                        onMouseEnter={() => setHoveredItem(entry)}
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
                        text = hoveredItem.displayName
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
                          x => x.name === hoveredItem.name,
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
                          x => x.name === hoveredItem.name,
                        )
                        const positiveTotal = chartData.reduce((sum, x) => sum + x.value, 0)

                        const value = item?.value ?? 0
                        const share = value > 0 ? value / positiveTotal : 0
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
                  nameKey='displayName'
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
                        text = hoveredItem.displayName
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
                          x => x.name === hoveredItem.name,
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
                  nameKey='displayName'
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
