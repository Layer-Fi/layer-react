import { type SingleChartAccountType } from '@schemas/generalLedger/chartOfAccounts'
import { LedgerAccountType } from '@schemas/generalLedger/ledgerAccountType'
import { ReportControl } from '@schemas/unifiedReports/reportConfig'
import { type UnifiedReport } from '@schemas/unifiedReports/unifiedReport'

import {
  type AccountNode,
  accountsOfTypes,
  buildAccountForest,
  collectLeafAccounts,
  nodeActivityCents,
  sumActivityCents,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/accountEngine'
import {
  lineItemTreeReport,
  type ReportLineItem,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/lineItemTree'
import {
  periodAmounts,
  periodColumns,
  type ReportPeriod,
  reportRangeFromParams,
  resolvePeriods,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/periods'
import {
  linesReportConfig,
  type ReportDateRange,
  reportingBasisBaseParams,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'

const LINES_ROUTE = 'profit-and-loss/lines'

// Row keys and section order follow DEFAULT_PNL_STRUCTURE; summary lines carry no drill-down.
const SUMMARY_LINES = {
  grossProfit: { name: 'GROSS_PROFIT', displayName: 'Gross Profit' },
  profitBeforeTaxes: { name: 'PROFIT_BEFORE_TAXES', displayName: 'Profit Before Taxes' },
  netProfit: { name: 'NET_PROFIT', displayName: 'Net Profit' },
} as const

const isCogs = (account: SingleChartAccountType) => account.accountSubtype?.value === 'COGS'
const isTaxes = (account: SingleChartAccountType) => account.stableName === 'TAXES'

export const generateProfitAndLoss = (params: URLSearchParams): UnifiedReport => {
  const range = reportRangeFromParams(params)
  const periods = resolvePeriods(range, params.get('group_by'))

  const expenseAccounts = accountsOfTypes([LedgerAccountType.Expense])
  const sections = {
    REVENUE: buildAccountForest(accountsOfTypes([LedgerAccountType.Revenue])),
    COST_OF_GOODS_SOLD: buildAccountForest(expenseAccounts.filter(isCogs)),
    EXPENSES: buildAccountForest(expenseAccounts.filter(a => !isCogs(a) && !isTaxes(a))),
    TAXES: buildAccountForest(expenseAccounts.filter(isTaxes)),
  }

  const sectionTotal = (
    forest: readonly AccountNode[],
  ) => (r: ReportDateRange) => sumActivityCents(collectLeafAccounts(forest), r, params)

  const accountLineItem = (node: AccountNode, forestPeriods: readonly ReportPeriod[]): ReportLineItem => ({
    name: node.account.stableName ?? node.account.accountId,
    displayName: node.account.name,
    amounts: periodAmounts(forestPeriods, r => nodeActivityCents(node, r, params)),
    ...(node.children.length === 0 && {
      reportConfig: linesReportConfig(
        LINES_ROUTE,
        node.account,
        [ReportControl.DateRange],
        reportingBasisBaseParams(params),
      ),
    }),
    childItems: node.children.map(child => accountLineItem(child, forestPeriods)),
  })

  // A section that is its own leaf account takes the drill-down, since its stream is the section total.
  const sectionLineItem = (name: keyof typeof sections, displayName: string): ReportLineItem => {
    const forest = sections[name]
    const [root] = forest
    const isOwnAccount = forest.length === 1 && root.account.stableName === name

    return {
      name,
      displayName,
      amounts: periodAmounts(periods, sectionTotal(forest)),
      ...(isOwnAccount && root.children.length === 0 && {
        reportConfig: linesReportConfig(
          LINES_ROUTE,
          root.account,
          [ReportControl.DateRange],
          reportingBasisBaseParams(params),
        ),
      }),
      childItems: (isOwnAccount ? root.children : forest).map(node => accountLineItem(node, periods)),
    }
  }

  const summaryLineItem = (
    { name, displayName }: { name: string, displayName: string },
    amountFor: (range: ReportDateRange) => number,
  ): ReportLineItem => ({ name, displayName, amounts: periodAmounts(periods, amountFor) })

  const revenue = sectionTotal(sections.REVENUE)
  const cogs = sectionTotal(sections.COST_OF_GOODS_SOLD)
  const expenses = sectionTotal(sections.EXPENSES)
  const taxes = sectionTotal(sections.TAXES)

  return lineItemTreeReport(periodColumns(periods), [
    sectionLineItem('REVENUE', 'Revenue'),
    sectionLineItem('COST_OF_GOODS_SOLD', 'Cost of Goods Sold'),
    summaryLineItem(SUMMARY_LINES.grossProfit, r => revenue(r) - cogs(r)),
    sectionLineItem('EXPENSES', 'Expenses'),
    summaryLineItem(SUMMARY_LINES.profitBeforeTaxes, r => revenue(r) - cogs(r) - expenses(r)),
    sectionLineItem('TAXES', 'Taxes'),
    summaryLineItem(SUMMARY_LINES.netProfit, r => revenue(r) - cogs(r) - expenses(r) - taxes(r)),
  ])
}
