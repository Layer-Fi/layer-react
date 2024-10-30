import React, { useContext, useMemo, type ReactNode } from 'react'
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
    data: storedData,
    isLoading,
    setSidebarScope,
    sidebarScope,
  } = useContext(PNL.Context)

  const dataItem = Array.isArray(storedData)
    ? storedData[storedData.length - 1]
    : storedData

  const { revenueChartData, expensesChartData } = useMemo(
    () => ({
      revenueChartData: toMiniChartData({ scope: 'revenue', data: dataItem }),
      expensesChartData: toMiniChartData({ scope: 'expenses', data: dataItem }),
    }),
    [dataItem],
  )

  const data = dataItem ? dataItem : { income: { value: NaN }, net_profit: NaN }

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
            amount={data.income.value}
            isLoading={isLoading}
            slots={{
              Chart: (
                <ProfitAndLossSummariesMiniChart
                  data={revenueChartData}
                  chartColorsList={chartColorsList}
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
            amount={(data?.income?.value ?? NaN) - data.net_profit}
            isLoading={isLoading}
            slots={{
              Chart: (
                <ProfitAndLossSummariesMiniChart
                  data={expensesChartData}
                  chartColorsList={chartColorsList}
                />
              ),
            }}
            variants={variants}
          />
        </ProfitAndLossSummariesListItem>
        <ProfitAndLossSummariesListItem>
          <ProfitAndLossSummariesSummary
            label={stringOverrides?.netProfitLabel || 'Net Profit'}
            amount={data.net_profit}
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
