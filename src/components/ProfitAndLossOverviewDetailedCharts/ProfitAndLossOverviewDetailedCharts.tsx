import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Toggle } from '@ui/Toggle/Toggle'
import { Container } from '@components/Container/Container'
import { ProfitAndLoss } from '@components/ProfitAndLoss/ProfitAndLoss'
import { type ProfitAndLossDetailedChartsStringOverrides } from '@components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'

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
  const { isDesktop } = useSizeClass()

  const toggleOptions = useMemo(() => (
    [
      {
        value: 'revenue',
        label: detailedChartsStringOverrides?.detailedChartStringOverrides?.revenueToggleLabel || t('revenue', 'Revenue'),
      },
      {
        value: 'expenses',
        label: detailedChartsStringOverrides?.detailedChartStringOverrides?.expenseToggleLabel || t('expenses', 'Expenses'),
      },
    ]
  ), [detailedChartsStringOverrides, t])

  const chartsWrapperClassName = variant === 'accounting'
    ? 'Layer__accounting-overview-profit-and-loss-charts'
    : 'Layer__bookkeeping-overview-profit-and-loss-charts'

  const chartContainerName = variant === 'accounting'
    ? 'accounting-overview-profit-and-loss-chart'
    : 'bookkeeping-overview-profit-and-loss-chart'

  return (
    <VStack className={chartsWrapperClassName} gap='md'>
      {!isDesktop
        && (
          <Toggle
            ariaLabel={t('chartType', 'Chart type')}
            options={toggleOptions}
            selectedKey={pnlToggle}
            onSelectionChange={key => setPnlToggle(key as PnlToggleOption)}
          />
        )}
      {isDesktop
        ? (
          <HStack gap='md'>
            <Container name={chartContainerName}>
              <ProfitAndLoss.DetailedCharts
                scope='revenue'
                hideClose={true}
                stringOverrides={detailedChartsStringOverrides}
                chartColorsList={chartColorsList}
              />
            </Container>
            <Container name={chartContainerName}>
              <ProfitAndLoss.DetailedCharts
                scope='expenses'
                hideClose={true}
                stringOverrides={detailedChartsStringOverrides}
                chartColorsList={chartColorsList}
              />
            </Container>
          </HStack>
        )
        : (
          <Container name={chartContainerName}>
            <ProfitAndLoss.DetailedCharts
              scope={pnlToggle}
              hideClose={true}
              stringOverrides={detailedChartsStringOverrides}
              chartColorsList={chartColorsList}
            />
          </Container>
        )}
    </VStack>
  )
}
