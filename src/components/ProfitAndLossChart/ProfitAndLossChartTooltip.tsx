import { useTranslation } from 'react-i18next'
import { type TooltipContentProps } from 'recharts'

import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { ChartTooltip, ChartTooltipContent, ChartTooltipRow } from '@components/Chart/ChartTooltip'
import type { ChartDataPoint } from '@components/ProfitAndLossChart/chartDataPoint'

export interface ProfitAndLossChartTooltipProps {
  cursorWidth: number
}

type ProfitAndLossTooltipContentProps = Partial<TooltipContentProps<number, string>>

const ProfitAndLossTooltipContent = ({
  active,
  payload,
}: ProfitAndLossTooltipContentProps) => {
  const { t } = useTranslation()
  if (!active || !payload || !payload[0]) {
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const dataRow = payload[0].payload as ChartDataPoint

  const netProfit = dataRow.netProfit
  const revenue = dataRow.revenue
  const expenses = dataRow.expenses
  const isLoading = dataRow.loadingBar !== 0

  const status = netProfit > 0 ? 'success' : netProfit < 0 ? 'error' : undefined

  if (isLoading) {
    return (
      <div className='Layer__ChartTooltip'>
        <Span variant='white' size='sm'>{t('loading', 'Loading...')}</Span>
      </div>
    )
  }

  return (
    <ChartTooltipContent>
      <ChartTooltipRow
        label={t('revenue', 'Revenue')}
        value={<MoneySpan amount={revenue} variant='white' size='sm' />}
      />
      <ChartTooltipRow
        label={t('expenses', 'Expenses')}
        value={<MoneySpan amount={expenses} variant='white' size='sm' />}
      />
      <ChartTooltipRow
        label={t('netProfit', 'Net Profit')}
        value={<MoneySpan amount={netProfit} variant='white' status={status} size='sm' />}
      />
    </ChartTooltipContent>
  )
}

export const ProfitAndLossChartTooltip = ({ cursorWidth }: ProfitAndLossChartTooltipProps) => (
  <ChartTooltip
    content={<ProfitAndLossTooltipContent />}
    cursorWidth={cursorWidth}
  />
)
