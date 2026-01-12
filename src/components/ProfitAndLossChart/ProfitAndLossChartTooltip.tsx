import { DefaultZIndexes, Rectangle, Tooltip, type TooltipContentProps, ZIndexLayer } from 'recharts'

import { MoneySpan } from '@ui/Typography/MoneySpan'
import type { ChartDataPoint } from '@components/ProfitAndLossChart/chartDataPoint'
import { Text } from '@components/Typography/Text'

export interface ProfitAndLossChartTooltipProps {
  cursorWidth: number
}

type CustomTooltipContentProps = Partial<TooltipContentProps<number, string>>

const CustomTooltipContent = ({
  active,
  payload,
}: CustomTooltipContentProps) => {
  if (!active || !payload || !payload[0]) {
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const dataRow = payload[0].payload as ChartDataPoint

  const netProfit = dataRow.netProfit
  const revenue = dataRow.revenue
  const expenses = dataRow.expenses
  const isLoading = dataRow.loadingBar !== 0

  const netProfitClass = netProfit > 0 ? 'positive' : netProfit < 0 ? 'negative' : ''

  return (
    <div className='Layer__chart__tooltip'>
      {isLoading
        ? (
          <Text>Loading...</Text>
        )
        : (
          <ul className='Layer__chart__tooltip-list'>
            <li>
              <label className='Layer__chart__tooltip-label'>Revenue</label>
              <MoneySpan amount={revenue} size='sm' className='Layer__chart__tooltip-value' />
            </li>
            <li>
              <label className='Layer__chart__tooltip-label'>Expenses</label>
              <MoneySpan amount={expenses} size='sm' className='Layer__chart__tooltip-value' />
            </li>
            <li>
              <label className='Layer__chart__tooltip-label'>
                Net Profit
              </label>
              <MoneySpan amount={netProfit} size='sm' className={`Layer__chart__tooltip-value ${netProfitClass}`} />
            </li>
          </ul>
        )}
    </div>
  )
}

interface CustomCursorProps {
  cursorWidth: number
  points?: [{ x: number, y: number }]
  height?: number
}

const CustomCursor = ({ cursorWidth, points, height }: CustomCursorProps) => {
  if (points === undefined || height === undefined) return null

  return (
    <ZIndexLayer zIndex={DefaultZIndexes.cursorRectangle}>
      <Rectangle
        fill='#F7F8FA'
        stroke='none'
        x={points[0].x - cursorWidth / 2 - 1}
        y={points[0].y}
        width={cursorWidth}
        height={height + 28}
        radius={6}
      />
    </ZIndexLayer>
  )
}

export const ProfitAndLossChartTooltip = ({ cursorWidth }: ProfitAndLossChartTooltipProps) => {
  return (
    <Tooltip
      wrapperClassName='Layer__chart__tooltip-wrapper'
      content={<CustomTooltipContent />}
      cursor={<CustomCursor cursorWidth={cursorWidth} />}
      animationDuration={100}
      animationEasing='ease-out'
    />
  )
}
