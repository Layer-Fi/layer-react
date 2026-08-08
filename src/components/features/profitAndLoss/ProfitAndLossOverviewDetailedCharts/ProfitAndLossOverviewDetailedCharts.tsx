import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useElementSize } from '@hooks/utils/size/useElementSize'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Toggle } from '@ui/Toggle/Toggle'
import { Container } from '@blocks/Layout/Container/Container'
import { ProfitAndLoss } from '@features/profitAndLoss/ProfitAndLoss/ProfitAndLoss'
import { type ProfitAndLossDetailedChartsStringOverrides } from '@features/profitAndLoss/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'

type ProfitAndLossOverviewDetailedChartsVariant = 'accounting' | 'bookkeeping'

interface ProfitAndLossOverviewDetailedChartsProps {
  variant: ProfitAndLossOverviewDetailedChartsVariant
  detailedChartsStringOverrides?: ProfitAndLossDetailedChartsStringOverrides
  chartColorsList?: string[]
}

type PnlToggleOption = 'revenue' | 'expenses'

export const ProfitAndLossOverviewDetailedCharts = ({
  variant,
  detailedChartsStringOverrides,
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
    ? 'Layer__AccountingOverview__ProfitAndLossCharts'
    : 'Layer__BookkeepingOverview__ProfitAndLossCharts'

  const chartContainerClassName = variant === 'accounting'
    ? 'Layer__AccountingOverview__ProfitAndLossChart'
    : 'Layer__BookkeepingOverview__ProfitAndLossChart'

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
          <Container className={chartContainerClassName}>
            <ProfitAndLoss.DetailedCharts
              scope={pnlToggle}
              hideClose={true}
              stringOverrides={detailedChartsStringOverrides}
              chartColorsList={chartColorsList}
            />
          </Container>
        )
        : (
          <HStack gap='md'>
            <Container className={chartContainerClassName}>
              <ProfitAndLoss.DetailedCharts
                scope='revenue'
                hideClose={true}
                stringOverrides={detailedChartsStringOverrides}
                chartColorsList={chartColorsList}
              />
            </Container>
            <Container className={chartContainerClassName}>
              <ProfitAndLoss.DetailedCharts
                scope='expenses'
                hideClose={true}
                stringOverrides={detailedChartsStringOverrides}
                chartColorsList={chartColorsList}
              />
            </Container>
          </HStack>
        )}
    </VStack>
  )
}
