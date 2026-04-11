import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { type TaxOverviewApiData } from '@schemas/taxEstimates/overview'
import { useSizeClass, useWindowSize } from '@hooks/utils/size/useWindowSize'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { Card } from '@components/Card/Card'
import { MetricRow } from '@components/MetricRow/MetricRow'

import './taxableIncomeCard.scss'
const METRIC_ROW_MOBILE_BREAKPOINT = 600
type TaxableIncomeCardProps = Pick<TaxOverviewApiData, 'totalDeductions' | 'totalIncome'> & {
  title?: string
  description?: string
  showHeader?: boolean
  headerAction?: ReactNode
}

function TotalIncomeMetricRow({ totalIncome, maxMeterValue }: { totalIncome: number, maxMeterValue: number }) {
  const { t } = useTranslation()
  const [viewportWidth] = useWindowSize()
  const boundedMaxMeterValue = Math.max(maxMeterValue, 0)
  const boundedMeterValue = Math.min(Math.max(totalIncome, 0), boundedMaxMeterValue)
  const slotProps = {
    Meter: {
      label: t('taxEstimates:label.total_income', 'Total income'),
      minValue: 0,
      value: boundedMeterValue,
      className: 'Layer__TaxOverview__IncomeMeter',
      maxValue: boundedMaxMeterValue,
    },
  }
  return (
    <MetricRow
      amount={boundedMeterValue}
      style={viewportWidth < METRIC_ROW_MOBILE_BREAKPOINT ? 'bordered' : 'default'}
      className='Layer__TaxOverview_TotalIncomeMeter'
      slotProps={slotProps}
    />

  )
}

function DeductionsMetricRow({ totalDeductions, maxMeterValue }: { totalDeductions: number, maxMeterValue: number }) {
  const { t } = useTranslation()
  const [viewportWidth] = useWindowSize()
  const boundedMaxMeterValue = Math.max(maxMeterValue, 0)
  const boundedMeterValue = Math.min(Math.max(totalDeductions, 0), boundedMaxMeterValue)
  const slotProps = {
    Meter: {
      label: t('taxEstimates:label.deductions', 'Deductions'),
      minValue: 0,
      value: boundedMeterValue,
      className: 'Layer__TaxOverview__DeductionsMeter',
      maxValue: boundedMaxMeterValue,
    },
  }
  return (
    <MetricRow
      amount={boundedMeterValue}
      style={viewportWidth < METRIC_ROW_MOBILE_BREAKPOINT ? 'bordered' : 'default'}
      className='Layer__TaxOverview_DeductionsMeter'
      slotProps={slotProps}
    />
  )
}

export const TaxableIncomeCard = ({
  description,
  totalDeductions,
  headerAction,
  totalIncome,
  showHeader = true,
  title,
}: TaxableIncomeCardProps) => {
  const { isDesktop } = useSizeClass()
  const maxMeterValue = Math.max(totalIncome, totalDeductions, 1)

  return (
    <VStack className='Layer__TaxOverview__Card' pi={!isDesktop ? undefined : 'md'}>
      {showHeader && (
        <VStack gap='xs'>
          <HStack justify='space-between' align='start' gap='md'>
            <Heading level={2} size='md'>{title}</Heading>
            {headerAction}
          </HStack>
          <Span size='sm' variant='subtle'>{description}</Span>
        </VStack>
      )}
      {!isDesktop
        ? (
          <Card className='Layer__TaxOverview__Card__MetricRow--mobile'>
            <TotalIncomeMetricRow totalIncome={totalIncome} maxMeterValue={maxMeterValue} />
            <DeductionsMetricRow totalDeductions={totalDeductions} maxMeterValue={maxMeterValue} />
          </Card>
        )
        : (
          <VStack gap='sm'>
            <TotalIncomeMetricRow totalIncome={totalIncome} maxMeterValue={maxMeterValue} />
            <DeductionsMetricRow totalDeductions={totalDeductions} maxMeterValue={maxMeterValue} />
          </VStack>
        )}
    </VStack>
  )
}
