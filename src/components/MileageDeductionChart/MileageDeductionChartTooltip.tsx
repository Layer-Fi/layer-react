import { useTranslation } from 'react-i18next'

import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
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
}

const MileageDeductionChartTooltipContent = ({ active, payload }: MileageDeductionChartTooltipContentProps) => {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()
  if (!active || !payload?.[0]) return null

  const data = payload[0].payload
  return (
    <ChartTooltipContent>
      <ChartTooltipRow label={data.monthYear} />
      <ChartTooltipRow label={t('mileageTracking:label.miles_colon', 'Miles:')} value={<Span size='sm' variant='white'>{formatNumber(data.miles)}</Span>} />
      <ChartTooltipRow label={t('mileageTracking:label.deduction_colon', 'Deduction:')} value={<MoneySpan status='success' amount={data.deduction} size='sm' />} />
    </ChartTooltipContent>
  )
}

interface MileageDeductionChartTooltipProps {
  cursorWidth: number
}

export const MileageDeductionChartTooltip = ({ cursorWidth }: MileageDeductionChartTooltipProps) => (
  <ChartTooltip
    content={<MileageDeductionChartTooltipContent />}
    cursorWidth={cursorWidth}
  />
)
