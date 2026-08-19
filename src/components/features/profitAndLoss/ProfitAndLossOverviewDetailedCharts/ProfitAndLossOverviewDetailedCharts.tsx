import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { type ProfitAndLossChartConfig } from '@internal-types/features/profitAndLoss/profitAndLossChartConfig'
import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { useElementSize } from '@hooks/utils/size/useElementSize'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Toggle } from '@ui/Toggle/Toggle'
import { Container } from '@blocks/Layout/Container/Container'
import { ProfitAndLoss } from '@features/profitAndLoss/ProfitAndLoss/ProfitAndLoss'
import { type ProfitAndLossDetailedChartsStringOverrides } from '@features/profitAndLoss/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'

const legacyClassNames = createLegacyClassNames({
  Layer__AccountingOverview__ProfitAndLossCharts: 'Layer__accounting-overview-profit-and-loss-charts',
  Layer__BookkeepingOverview__ProfitAndLossCharts: 'Layer__bookkeeping-overview-profit-and-loss-charts',
})

type ProfitAndLossOverviewDetailedChartsVariant = 'accounting' | 'bookkeeping'

interface ProfitAndLossOverviewDetailedChartsProps {
  variant: ProfitAndLossOverviewDetailedChartsVariant
  detailedChartsStringOverrides?: ProfitAndLossDetailedChartsStringOverrides
  chartConfigByScope?: {
    revenue?: ProfitAndLossChartConfig
    expenses?: ProfitAndLossChartConfig
  }
  chartColorsList?: string[]
}

type PnlToggleOption = 'revenue' | 'expenses'

export const ProfitAndLossOverviewDetailedCharts = ({
  variant,
  detailedChartsStringOverrides,
  chartConfigByScope,
  chartColorsList,
}: ProfitAndLossOverviewDetailedChartsProps) => {
  const { t } = useTranslation()
  const [pnlToggle, setPnlToggle] = useState<PnlToggleOption>('expenses')
  const [isCompact, setIsCompact] = useState(false)
  const elementRef = useElementSize<HTMLDivElement>((size) => {
    setIsCompact(size.width < 720)
  })

  const toggleOptions = useMemo(() => (
    [
      {
        value: 'revenue',
        label: detailedChartsStringOverrides?.detailedChartStringOverrides?.revenueToggleLabel || t('common:label.revenue', 'Revenue'),
      },
      {
        value: 'expenses',
        label: detailedChartsStringOverrides?.detailedChartStringOverrides?.expenseToggleLabel || t('common:label.expenses', 'Expenses'),
      },
    ]
  ), [detailedChartsStringOverrides, t])

  const chartsWrapperClassName = variant === 'accounting'
    ? legacyClassNames('Layer__AccountingOverview__ProfitAndLossCharts')
    : legacyClassNames('Layer__BookkeepingOverview__ProfitAndLossCharts')

  const chartContainerName = variant === 'accounting'
    ? 'AccountingOverview__ProfitAndLossChart'
    : 'BookkeepingOverview__ProfitAndLossChart'

  return (
    <VStack className={chartsWrapperClassName} gap='md' ref={elementRef}>
      {isCompact
        && (
          <Toggle
            ariaLabel={t('profitAndLoss:ProfitAndLossOverviewDetailedCharts.label.chart_type', 'Chart type')}
            options={toggleOptions}
            selectedKey={pnlToggle}
            onSelectionChange={key => setPnlToggle(key as PnlToggleOption)}
          />
        )}
      {isCompact
        ? (
          <Container name={chartContainerName}>
            <ProfitAndLoss.DetailedCharts
              scope={pnlToggle}
              hideClose={true}
              chartConfig={chartConfigByScope?.[pnlToggle]}
              chartColorsList={chartColorsList}
              stringOverrides={detailedChartsStringOverrides}
            />
          </Container>
        )
        : (
          <HStack gap='md'>
            <Container name={chartContainerName}>
              <ProfitAndLoss.DetailedCharts
                scope='revenue'
                hideClose={true}
                chartConfig={chartConfigByScope?.revenue}
                chartColorsList={chartColorsList}
                stringOverrides={detailedChartsStringOverrides}
              />
            </Container>
            <Container name={chartContainerName}>
              <ProfitAndLoss.DetailedCharts
                scope='expenses'
                hideClose={true}
                chartConfig={chartConfigByScope?.expenses}
                chartColorsList={chartColorsList}
                stringOverrides={detailedChartsStringOverrides}
              />
            </Container>
          </HStack>
        )}
    </VStack>
  )
}
