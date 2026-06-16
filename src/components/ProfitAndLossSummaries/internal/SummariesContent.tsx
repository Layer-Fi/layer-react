import { type ReactNode, useCallback, useContext, useMemo } from 'react'

import type { PnlChartLineItem } from '@utils/profitAndLossUtils'
import type { Variants } from '@utils/styleUtils/sizeVariants'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
import {
  ProfitAndLossSummariesList,
  ProfitAndLossSummariesListItem,
} from '@components/ProfitAndLossSummaries/internal/ProfitAndLossSummariesList'
import { ProfitAndLossSummariesMiniChart } from '@components/ProfitAndLossSummaries/internal/ProfitAndLossSummariesMiniChart'
import { ProfitAndLossSummariesSummary } from '@components/ProfitAndLossSummaries/internal/ProfitAndLossSummariesSummary'
import {
  type ProfitAndLossSummariesMode,
  useProfitAndLossSummariesMiniChartData,
} from '@components/ProfitAndLossSummaries/useProfitAndLossSummariesMiniChartData'

import './summariesContent.scss'

export type SummaryTileBreakdown = {
  categorized: number
  uncategorized: number
}

export type SummaryTileConfig = {
  label: string
  renderFooter?: (breakdown: SummaryTileBreakdown, isLoading: boolean) => ReactNode
}

export type SummariesTiles = {
  revenue: SummaryTileConfig
  expenses: SummaryTileConfig
  net: SummaryTileConfig
}

type SummariesContentProps = {
  mode: ProfitAndLossSummariesMode
  tiles: SummariesTiles
  actionable?: boolean
  chartColorsList?: string[]
  variants?: Variants
  slots?: {
    unstable_AdditionalListItems?: [ReactNode]
  }
}

export function SummariesContent({
  mode,
  tiles,
  actionable = false,
  chartColorsList,
  variants,
  slots,
}: SummariesContentProps) {
  const { sidebarScope, setSidebarScope } = useContext(ProfitAndLossContext)
  const { isLoading, isComparisonLoading, comparisonMonth, revenue, expenses, net } = useProfitAndLossSummariesMiniChartData({ mode })

  const summaryTiles = useMemo(() => {
    const summaryData = { revenue, expenses, net }

    return ([
      { key: 'revenue', sidebarScope: 'revenue', isExpense: false },
      { key: 'expenses', sidebarScope: 'expenses', isExpense: true },
      { key: 'net', sidebarScope: undefined, isExpense: false },
    ] as const).map(({ key, sidebarScope, isExpense }) => ({
      key,
      sidebarScope,
      isExpense,
      config: tiles[key],
      chartData: undefined,
      ...summaryData[key],
    }))
  }, [tiles, revenue, expenses, net])

  const { unstable_AdditionalListItems = [] } = slots ?? {}
  const listItemCount = summaryTiles.length + unstable_AdditionalListItems.length

  const renderChart = useCallback((chartData: PnlChartLineItem[] | undefined) => {
    if (!chartData) return null

    return <ProfitAndLossSummariesMiniChart data={chartData} chartColorsList={chartColorsList} variants={variants} />
  }, [chartColorsList, variants])

  return (
    <section className='Layer__component Layer__ProfitAndLossSummaries'>
      <ProfitAndLossSummariesList itemCount={listItemCount}>
        {summaryTiles.map(({
          key,
          sidebarScope: scope,
          config,
          amount,
          percentChange,
          chartData,
          breakdown,
          isExpense,
        }) => (
          <ProfitAndLossSummariesListItem
            key={key}
            isActive={scope ? sidebarScope === scope : undefined}
            onClick={actionable && scope ? () => setSidebarScope(scope) : undefined}
          >
            <ProfitAndLossSummariesSummary
              label={config.label}
              amount={amount}
              isLoading={isLoading}
              isComparisonLoading={isComparisonLoading}
              percentChange={percentChange}
              comparisonMonth={comparisonMonth ?? undefined}
              isExpense={isExpense}
              mode={mode}
              variants={variants}
              slots={{
                Chart: renderChart(chartData),
                Footer: config.renderFooter?.(breakdown, isLoading),
              }}
            />
          </ProfitAndLossSummariesListItem>
        ))}
        {unstable_AdditionalListItems.map((item, index) => (
          <ProfitAndLossSummariesListItem key={index}>
            {item}
          </ProfitAndLossSummariesListItem>
        ))}
      </ProfitAndLossSummariesList>
    </section>
  )
}
