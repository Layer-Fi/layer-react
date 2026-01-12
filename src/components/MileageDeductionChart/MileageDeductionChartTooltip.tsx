import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import {
  ChartTooltip,
  ChartTooltipContent,
  ChartTooltipRow,
} from '@components/Chart/ChartTooltip'
import type { MileageDeductionChartDataPoint } from '@components/MileageDeductionChart/MileageDeductionChartDataPoint'

interface MileageDeductionChartTooltipContentProps {
  active?: boolean
  payload?: Array<{ payload: MileageDeductionChartDataPoint }>
  selectedYear: number
}

const MileageDeductionChartTooltipContent = ({ active, payload, selectedYear }: MileageDeductionChartTooltipContentProps) => {
  if (!active || !payload?.[0]) return null

  const data = payload[0].payload
  return (
    <ChartTooltipContent>
      <ChartTooltipRow label={`${data.monthName} ${selectedYear}`} />
      <ChartTooltipRow label='Miles:' value={<Span size='sm' variant='white'>{data.miles}</Span>} />
      <ChartTooltipRow label='Deduction:' value={<MoneySpan status='success' amount={data.deduction} size='sm' />} />
    </ChartTooltipContent>
  )
}

interface MileageDeductionChartTooltipProps {
  selectedYear: number
  cursorWidth: number
}

export const MileageDeductionChartTooltip = ({ selectedYear, cursorWidth }: MileageDeductionChartTooltipProps) => (
  <ChartTooltip
    content={<MileageDeductionChartTooltipContent selectedYear={selectedYear} />}
    cursorWidth={cursorWidth}
  />
)
