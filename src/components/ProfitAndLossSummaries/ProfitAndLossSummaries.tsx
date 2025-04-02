import { useContext, useMemo, type ReactNode } from 'react'
import type { Variants } from '../../utils/styleUtils/sizeVariants'
import { ProfitAndLoss as PNL } from '../ProfitAndLoss'
import {
  ProfitAndLossSummariesList,
  ProfitAndLossSummariesListItem,
} from './internal/ProfitAndLossSummariesList'
import {
  ProfitAndLossSummariesMiniChart,
  toMiniChartData,
} from './internal/ProfitAndLossSummariesMiniChart'
import { ProfitAndLossSummariesSummary } from './internal/ProfitAndLossSummariesSummary'

export interface ProfitAndLossSummariesStringOverrides {
  revenueLabel?: string
  expensesLabel?: string
  netProfitLabel?: string
}

const SECTION_CLASS_NAME = 'Layer__ProfitAndLossSummaries'
const SECTION_CLASS_NAMES = `${SECTION_CLASS_NAME} Layer__component`

type ProfitAndLossSummariesProps = {
  actionable?: boolean
  stringOverrides?: ProfitAndLossSummariesStringOverrides
  chartColorsList?: string[]
  variants?: Variants
  /**
   * @deprecated Use `stringOverrides.revenueLabel` instead
   */
  revenueLabel?: string
  /**
   * @deprecated Orientation is determined by the container size
   */
  vertical?: boolean
}

type Internal_ProfitAndLossSummariesProps = {
  slots?: {
    unstable_AdditionalListItems?: [ReactNode]
  }
} & ProfitAndLossSummariesProps

export function Internal_ProfitAndLossSummaries({
  actionable = false,
  revenueLabel,
  stringOverrides,
  chartColorsList,
  slots,
  variants,
}: Internal_ProfitAndLossSummariesProps) {
  const {
    data,
    isLoading,
    setSidebarScope,
    sidebarScope,
  } = useContext(PNL.Context)

  const { revenueChartData, expensesChartData } = useMemo(
    () => ({
      revenueChartData: toMiniChartData({ scope: 'revenue', data }),
      expensesChartData: toMiniChartData({ scope: 'expenses', data }),
    }),
    [data],
  )

  const effectiveData = data ?? { income: { value: 0 }, net_profit: 0 }

  const { unstable_AdditionalListItems = [] } = slots ?? {}
  const listItemCount = unstable_AdditionalListItems.length + 3

  return (
    <section className={SECTION_CLASS_NAMES}>
      <ProfitAndLossSummariesList itemCount={listItemCount}>
        <ProfitAndLossSummariesListItem
          isActive={sidebarScope === 'revenue'}
          onClick={actionable ? () => setSidebarScope('revenue') : undefined}
        >
          <ProfitAndLossSummariesSummary
            label={stringOverrides?.revenueLabel || revenueLabel || 'Revenue'}
            amount={effectiveData.income.value ?? 0}
            isLoading={isLoading}
            slots={{
              Chart: (
                <ProfitAndLossSummariesMiniChart
                  data={revenueChartData}
                  chartColorsList={chartColorsList}
                  variants={variants}
                />
              ),
            }}
            variants={variants}
          />
        </ProfitAndLossSummariesListItem>
        <ProfitAndLossSummariesListItem
          isActive={sidebarScope === 'expenses'}
          onClick={actionable ? () => setSidebarScope('expenses') : undefined}
        >
          <ProfitAndLossSummariesSummary
            label={stringOverrides?.revenueLabel || revenueLabel || 'Expenses'}
            amount={(effectiveData?.income?.value ?? 0) - effectiveData.net_profit}
            isLoading={isLoading}
            slots={{
              Chart: (
                <ProfitAndLossSummariesMiniChart
                  data={expensesChartData}
                  chartColorsList={chartColorsList}
                  variants={variants}
                />
              ),
            }}
            variants={variants}
          />
        </ProfitAndLossSummariesListItem>
        <ProfitAndLossSummariesListItem>
          <ProfitAndLossSummariesSummary
            label={stringOverrides?.netProfitLabel || 'Net Profit'}
            amount={data?.net_profit ?? 0}
            variants={variants}
            isLoading={isLoading}
          />
        </ProfitAndLossSummariesListItem>
        {unstable_AdditionalListItems.map((item, index) => (
          <ProfitAndLossSummariesListItem key={index}>
            {item}
          </ProfitAndLossSummariesListItem>
        ))}
      </ProfitAndLossSummariesList>
    </section>
  )
}

export const ProfitAndLossSummaries = (props: ProfitAndLossSummariesProps) =>
  Internal_ProfitAndLossSummaries(props)
