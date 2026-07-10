import type { LineItem } from '@schemas/common/lineItem'
import type {
  ProfitAndLoss,
  ProfitAndLossSummary,
} from '@schemas/reports/profitAndLoss'

/**
 * Hardcoded monthly P&L amounts in cents.
 *
 * Tells the story of a seasonal business (summer + December peaks) that
 * roughly breaks even in 2022 and grows increasingly profitable through 2025.
 */
type MonthlyPnl = {
  income: number
  costOfGoodsSold: number
  operatingExpenses: number
  taxes: number
  uncategorizedInflows: number
  uncategorizedOutflows: number
  categorizedTransactions: number
  uncategorizedTransactions: number
}

const MONTHLY_PNL_BY_YEAR: Record<number, readonly MonthlyPnl[]> = {
  2022: [
    // January 2022
    {
      income: 1135300,
      costOfGoodsSold: 382100,
      operatingExpenses: 917600,
      taxes: 0,
      uncategorizedInflows: 66700,
      uncategorizedOutflows: 77300,
      categorizedTransactions: 61,
      uncategorizedTransactions: 5,
    },
    // February 2022
    {
      income: 1172300,
      costOfGoodsSold: 392800,
      operatingExpenses: 898400,
      taxes: 0,
      uncategorizedInflows: 64000,
      uncategorizedOutflows: 96100,
      categorizedTransactions: 61,
      uncategorizedTransactions: 5,
    },
    // March 2022
    {
      income: 1355400,
      costOfGoodsSold: 441300,
      operatingExpenses: 927500,
      taxes: 0,
      uncategorizedInflows: 0,
      uncategorizedOutflows: 76800,
      categorizedTransactions: 65,
      uncategorizedTransactions: 4,
    },
    // April 2022
    {
      income: 1385600,
      costOfGoodsSold: 481100,
      operatingExpenses: 976700,
      taxes: 0,
      uncategorizedInflows: 89200,
      uncategorizedOutflows: 0,
      categorizedTransactions: 66,
      uncategorizedTransactions: 4,
    },
    // May 2022
    {
      income: 1489700,
      costOfGoodsSold: 490400,
      operatingExpenses: 992900,
      taxes: 1000,
      uncategorizedInflows: 68600,
      uncategorizedOutflows: 122200,
      categorizedTransactions: 68,
      uncategorizedTransactions: 5,
    },
    // June 2022
    {
      income: 1580600,
      costOfGoodsSold: 508400,
      operatingExpenses: 1012500,
      taxes: 9000,
      uncategorizedInflows: 0,
      uncategorizedOutflows: 100200,
      categorizedTransactions: 70,
      uncategorizedTransactions: 4,
    },
    // July 2022
    {
      income: 1787800,
      costOfGoodsSold: 604900,
      operatingExpenses: 1078300,
      taxes: 15700,
      uncategorizedInflows: 129400,
      uncategorizedOutflows: 137600,
      categorizedTransactions: 74,
      uncategorizedTransactions: 6,
    },
    // August 2022
    {
      income: 1652700,
      costOfGoodsSold: 550000,
      operatingExpenses: 1016300,
      taxes: 13000,
      uncategorizedInflows: 92300,
      uncategorizedOutflows: 0,
      categorizedTransactions: 71,
      uncategorizedTransactions: 4,
    },
    // September 2022
    {
      income: 1389100,
      costOfGoodsSold: 452800,
      operatingExpenses: 966700,
      taxes: 0,
      uncategorizedInflows: 0,
      uncategorizedOutflows: 117000,
      categorizedTransactions: 66,
      uncategorizedTransactions: 4,
    },
    // October 2022
    {
      income: 1365100,
      costOfGoodsSold: 472200,
      operatingExpenses: 1005200,
      taxes: 0,
      uncategorizedInflows: 84400,
      uncategorizedOutflows: 122600,
      categorizedTransactions: 65,
      uncategorizedTransactions: 5,
    },
    // November 2022
    {
      income: 1397100,
      costOfGoodsSold: 449100,
      operatingExpenses: 975900,
      taxes: 0,
      uncategorizedInflows: 101200,
      uncategorizedOutflows: 85600,
      categorizedTransactions: 66,
      uncategorizedTransactions: 5,
    },
    // December 2022
    {
      income: 1743300,
      costOfGoodsSold: 566100,
      operatingExpenses: 1116900,
      taxes: 9000,
      uncategorizedInflows: 0,
      uncategorizedOutflows: 0,
      categorizedTransactions: 73,
      uncategorizedTransactions: 0,
    },
  ],
  2023: [
    // January 2023
    {
      income: 1386400,
      costOfGoodsSold: 496900,
      operatingExpenses: 1024500,
      taxes: 0,
      uncategorizedInflows: 82300,
      uncategorizedOutflows: 92900,
      categorizedTransactions: 66,
      uncategorizedTransactions: 5,
    },
    // February 2023
    {
      income: 1566700,
      costOfGoodsSold: 541800,
      operatingExpenses: 1032300,
      taxes: 0,
      uncategorizedInflows: 100200,
      uncategorizedOutflows: 119700,
      categorizedTransactions: 69,
      uncategorizedTransactions: 5,
    },
    // March 2023
    {
      income: 1777900,
      costOfGoodsSold: 594800,
      operatingExpenses: 1059700,
      taxes: 18500,
      uncategorizedInflows: 0,
      uncategorizedOutflows: 131900,
      categorizedTransactions: 74,
      uncategorizedTransactions: 4,
    },
    // April 2023
    {
      income: 1952300,
      costOfGoodsSold: 655000,
      operatingExpenses: 1118200,
      taxes: 26900,
      uncategorizedInflows: 128900,
      uncategorizedOutflows: 0,
      categorizedTransactions: 77,
      uncategorizedTransactions: 4,
    },
    // May 2023
    {
      income: 2033000,
      costOfGoodsSold: 674600,
      operatingExpenses: 1163600,
      taxes: 29200,
      uncategorizedInflows: 141700,
      uncategorizedOutflows: 149600,
      categorizedTransactions: 79,
      uncategorizedTransactions: 6,
    },
    // June 2023
    {
      income: 2147400,
      costOfGoodsSold: 690400,
      operatingExpenses: 1162200,
      taxes: 44200,
      uncategorizedInflows: 0,
      uncategorizedOutflows: 112800,
      categorizedTransactions: 81,
      uncategorizedTransactions: 4,
    },
    // July 2023
    {
      income: 2281300,
      costOfGoodsSold: 773800,
      operatingExpenses: 1237600,
      taxes: 40500,
      uncategorizedInflows: 162800,
      uncategorizedOutflows: 113200,
      categorizedTransactions: 84,
      uncategorizedTransactions: 6,
    },
    // August 2023
    {
      income: 2201800,
      costOfGoodsSold: 760300,
      operatingExpenses: 1237500,
      taxes: 30600,
      uncategorizedInflows: 112100,
      uncategorizedOutflows: 0,
      categorizedTransactions: 82,
      uncategorizedTransactions: 4,
    },
    // September 2023
    {
      income: 1834800,
      costOfGoodsSold: 602000,
      operatingExpenses: 1155800,
      taxes: 11500,
      uncategorizedInflows: 0,
      uncategorizedOutflows: 100300,
      categorizedTransactions: 75,
      uncategorizedTransactions: 4,
    },
    // October 2023
    {
      income: 1808600,
      costOfGoodsSold: 629500,
      operatingExpenses: 1145900,
      taxes: 5000,
      uncategorizedInflows: 98100,
      uncategorizedOutflows: 143900,
      categorizedTransactions: 74,
      uncategorizedTransactions: 6,
    },
    // November 2023
    {
      income: 1917000,
      costOfGoodsSold: 676600,
      operatingExpenses: 1100500,
      taxes: 21000,
      uncategorizedInflows: 90200,
      uncategorizedOutflows: 116100,
      categorizedTransactions: 76,
      uncategorizedTransactions: 5,
    },
    // December 2023
    {
      income: 2319100,
      costOfGoodsSold: 805000,
      operatingExpenses: 1192400,
      taxes: 48300,
      uncategorizedInflows: 0,
      uncategorizedOutflows: 0,
      categorizedTransactions: 84,
      uncategorizedTransactions: 0,
    },
  ],
  2024: [
    // January 2024
    {
      income: 1868000,
      costOfGoodsSold: 624800,
      operatingExpenses: 1254700,
      taxes: 0,
      uncategorizedInflows: 137300,
      uncategorizedOutflows: 118300,
      categorizedTransactions: 75,
      uncategorizedTransactions: 6,
    },
    // February 2024
    {
      income: 1954900,
      costOfGoodsSold: 638100,
      operatingExpenses: 1227600,
      taxes: 13400,
      uncategorizedInflows: 120600,
      uncategorizedOutflows: 115000,
      categorizedTransactions: 77,
      uncategorizedTransactions: 6,
    },
    // March 2024
    {
      income: 2327600,
      costOfGoodsSold: 780100,
      operatingExpenses: 1300200,
      taxes: 37100,
      uncategorizedInflows: 0,
      uncategorizedOutflows: 176800,
      categorizedTransactions: 85,
      uncategorizedTransactions: 5,
    },
    // April 2024
    {
      income: 2360400,
      costOfGoodsSold: 837700,
      operatingExpenses: 1367500,
      taxes: 23300,
      uncategorizedInflows: 121900,
      uncategorizedOutflows: 0,
      categorizedTransactions: 85,
      uncategorizedTransactions: 4,
    },
    // May 2024
    {
      income: 2486300,
      costOfGoodsSold: 836000,
      operatingExpenses: 1363100,
      taxes: 43100,
      uncategorizedInflows: 186400,
      uncategorizedOutflows: 177100,
      categorizedTransactions: 88,
      uncategorizedTransactions: 7,
    },
    // June 2024
    {
      income: 2790800,
      costOfGoodsSold: 952400,
      operatingExpenses: 1376800,
      taxes: 69200,
      uncategorizedInflows: 0,
      uncategorizedOutflows: 196300,
      categorizedTransactions: 94,
      uncategorizedTransactions: 5,
    },
    // July 2024
    {
      income: 3134200,
      costOfGoodsSold: 1122000,
      operatingExpenses: 1403600,
      taxes: 91300,
      uncategorizedInflows: 221100,
      uncategorizedOutflows: 192400,
      categorizedTransactions: 101,
      uncategorizedTransactions: 8,
    },
    // August 2024
    {
      income: 2895100,
      costOfGoodsSold: 990900,
      operatingExpenses: 1478400,
      taxes: 63900,
      uncategorizedInflows: 215000,
      uncategorizedOutflows: 0,
      categorizedTransactions: 96,
      uncategorizedTransactions: 5,
    },
    // September 2024
    {
      income: 2529600,
      costOfGoodsSold: 836300,
      operatingExpenses: 1313200,
      taxes: 57000,
      uncategorizedInflows: 0,
      uncategorizedOutflows: 175500,
      categorizedTransactions: 89,
      uncategorizedTransactions: 5,
    },
    // October 2024
    {
      income: 2478900,
      costOfGoodsSold: 815200,
      operatingExpenses: 1347600,
      taxes: 47400,
      uncategorizedInflows: 117900,
      uncategorizedOutflows: 133500,
      categorizedTransactions: 88,
      uncategorizedTransactions: 6,
    },
    // November 2024
    {
      income: 2464700,
      costOfGoodsSold: 887200,
      operatingExpenses: 1379800,
      taxes: 29700,
      uncategorizedInflows: 176600,
      uncategorizedOutflows: 181300,
      categorizedTransactions: 87,
      uncategorizedTransactions: 7,
    },
    // December 2024
    {
      income: 3032200,
      costOfGoodsSold: 997200,
      operatingExpenses: 1482700,
      taxes: 82800,
      uncategorizedInflows: 0,
      uncategorizedOutflows: 0,
      categorizedTransactions: 99,
      uncategorizedTransactions: 0,
    },
  ],
  2025: [
    // January 2025
    {
      income: 2380700,
      costOfGoodsSold: 845100,
      operatingExpenses: 1437300,
      taxes: 14700,
      uncategorizedInflows: 178200,
      uncategorizedOutflows: 186900,
      categorizedTransactions: 86,
      uncategorizedTransactions: 7,
    },
    // February 2025
    {
      income: 2422600,
      costOfGoodsSold: 829600,
      operatingExpenses: 1509200,
      taxes: 12600,
      uncategorizedInflows: 116900,
      uncategorizedOutflows: 145800,
      categorizedTransactions: 86,
      uncategorizedTransactions: 6,
    },
    // March 2025
    {
      income: 2792200,
      costOfGoodsSold: 973800,
      operatingExpenses: 1530500,
      taxes: 43200,
      uncategorizedInflows: 0,
      uncategorizedOutflows: 140700,
      categorizedTransactions: 94,
      uncategorizedTransactions: 5,
    },
    // April 2025
    {
      income: 3135000,
      costOfGoodsSold: 1063100,
      operatingExpenses: 1621800,
      taxes: 67500,
      uncategorizedInflows: 164100,
      uncategorizedOutflows: 0,
      categorizedTransactions: 101,
      uncategorizedTransactions: 5,
    },
    // May 2025
    {
      income: 3263700,
      costOfGoodsSold: 1162700,
      operatingExpenses: 1553500,
      taxes: 82100,
      uncategorizedInflows: 150700,
      uncategorizedOutflows: 193300,
      categorizedTransactions: 103,
      uncategorizedTransactions: 7,
    },
    // June 2025
    {
      income: 3633100,
      costOfGoodsSold: 1232600,
      operatingExpenses: 1710800,
      taxes: 103500,
      uncategorizedInflows: 0,
      uncategorizedOutflows: 232800,
      categorizedTransactions: 111,
      uncategorizedTransactions: 6,
    },
    // July 2025
    {
      income: 3739800,
      costOfGoodsSold: 1345600,
      operatingExpenses: 1661800,
      taxes: 109900,
      uncategorizedInflows: 228700,
      uncategorizedOutflows: 196200,
      categorizedTransactions: 113,
      uncategorizedTransactions: 8,
    },
    // August 2025
    {
      income: 3838300,
      costOfGoodsSold: 1245000,
      operatingExpenses: 1618100,
      taxes: 146300,
      uncategorizedInflows: 265200,
      uncategorizedOutflows: 0,
      categorizedTransactions: 115,
      uncategorizedTransactions: 6,
    },
    // September 2025
    {
      income: 3143100,
      costOfGoodsSold: 1118400,
      operatingExpenses: 1561100,
      taxes: 69500,
      uncategorizedInflows: 157200,
      uncategorizedOutflows: 213400,
      categorizedTransactions: 101,
      uncategorizedTransactions: 8,
    },
    // October 2025
    {
      income: 3114600,
      costOfGoodsSold: 1027100,
      operatingExpenses: 1553800,
      taxes: 80100,
      uncategorizedInflows: 166600,
      uncategorizedOutflows: 151900,
      categorizedTransactions: 100,
      uncategorizedTransactions: 7,
    },
    // November 2025
    {
      income: 2916400,
      costOfGoodsSold: 937800,
      operatingExpenses: 1609000,
      taxes: 55400,
      uncategorizedInflows: 203100,
      uncategorizedOutflows: 186600,
      categorizedTransactions: 96,
      uncategorizedTransactions: 7,
    },
    // December 2025
    {
      income: 4085200,
      costOfGoodsSold: 1355200,
      operatingExpenses: 1702000,
      taxes: 154200,
      uncategorizedInflows: 0,
      uncategorizedOutflows: 0,
      categorizedTransactions: 120,
      uncategorizedTransactions: 0,
    },
  ],
}

const EMPTY_MONTH: MonthlyPnl = {
  income: 0,
  costOfGoodsSold: 0,
  operatingExpenses: 0,
  taxes: 0,
  uncategorizedInflows: 0,
  uncategorizedOutflows: 0,
  categorizedTransactions: 0,
  uncategorizedTransactions: 0,
}

const getMonthlyPnl = (year: number, month: number): MonthlyPnl =>
  MONTHLY_PNL_BY_YEAR[year]?.[month - 1] ?? EMPTY_MONTH

export const makeProfitAndLossSummary = (year: number, month: number): ProfitAndLossSummary => {
  const monthlyPnl = getMonthlyPnl(year, month)
  const { income, costOfGoodsSold, operatingExpenses, taxes } = monthlyPnl

  const grossProfit = income - costOfGoodsSold
  const profitBeforeTaxes = grossProfit - operatingExpenses
  const netProfit = profitBeforeTaxes - taxes

  return {
    ...monthlyPnl,
    year,
    month,
    grossProfit,
    profitBeforeTaxes,
    netProfit,
    fullyCategorized: monthlyPnl.uncategorizedInflows === 0 && monthlyPnl.uncategorizedOutflows === 0,
    totalExpenses: costOfGoodsSold + operatingExpenses + taxes,
  }
}

export const makeProfitAndLossSummaries = (
  { startYear, startMonth, endYear, endMonth }: {
    startYear: number
    startMonth: number
    endYear: number
    endMonth: number
  },
): ProfitAndLossSummary[] => {
  const summaries: ProfitAndLossSummary[] = []

  for (let cursor = startYear * 12 + (startMonth - 1); cursor <= endYear * 12 + (endMonth - 1); cursor++) {
    summaries.push(makeProfitAndLossSummary(Math.floor(cursor / 12), (cursor % 12) + 1))
  }

  return summaries
}

type CategorySplit = readonly [name: string, displayName: string, share: number]

const INCOME_SPLIT: readonly CategorySplit[] = [
  ['SERVICE_REVENUE', 'Services', 0.54],
  ['PRODUCT_SALES', 'Product Sales', 0.31],
  ['SHIPPING_INCOME', 'Shipping Income', 0.09],
  ['INTEREST_INCOME', 'Interest Income', 0.06],
]

const COGS_SPLIT: readonly CategorySplit[] = [
  ['MATERIALS', 'Materials & Supplies', 0.58],
  ['SUBCONTRACTORS', 'Subcontractors', 0.28],
  ['FREIGHT', 'Freight & Delivery', 0.14],
]

const OPEX_SPLIT: readonly CategorySplit[] = [
  ['PAYROLL', 'Payroll', 0.42],
  ['RENT', 'Rent & Lease', 0.17],
  ['MARKETING', 'Marketing', 0.12],
  ['SOFTWARE', 'Software & Subscriptions', 0.09],
  ['INSURANCE', 'Insurance', 0.07],
  ['UTILITIES', 'Utilities', 0.05],
  ['OFFICE_SUPPLIES', 'Office Supplies', 0.04],
  ['TRAVEL', 'Travel & Meals', 0.04],
]

/** Splits a total into per-category line items; rounding remainder lands on the first category. */
const splitIntoLineItems = (total: number, split: readonly CategorySplit[]): LineItem[] => {
  const items = split.map(([name, displayName, share]) => ({
    name,
    displayName,
    value: Math.round(total * share),
    isContra: false,
    lineItems: [],
  }))

  const allocated = items.reduce((sum, { value }) => sum + value, 0)
  if (items[0]) items[0].value += total - allocated

  return items
}

const makeSectionLineItem = (
  name: string,
  displayName: string,
  total: number,
  split: readonly CategorySplit[],
): LineItem => ({
  name,
  displayName,
  value: total,
  isContra: false,
  lineItems: splitIntoLineItems(total, split),
})

export const PROFIT_AND_LOSS_FIXTURE_BUSINESS_ID = '00000000-0000-4000-8000-000000000201'

const monthsInRange = (startDate: Date, endDate: Date) => {
  const months: Array<{ year: number, month: number }> = []

  const start = startDate.getFullYear() * 12 + startDate.getMonth()
  const end = endDate.getFullYear() * 12 + endDate.getMonth()

  for (let cursor = start; cursor <= end; cursor++) {
    months.push({ year: Math.floor(cursor / 12), month: (cursor % 12) + 1 })
  }

  return months
}

export const makeProfitAndLossReport = (
  { startDate, endDate }: { startDate: Date, endDate: Date },
): ProfitAndLoss => {
  const totals = monthsInRange(startDate, endDate)
    .map(({ year, month }) => makeProfitAndLossSummary(year, month))
    .reduce(
      (acc, summary) => ({
        income: acc.income + summary.income,
        cogs: acc.cogs + summary.costOfGoodsSold,
        opex: acc.opex + summary.operatingExpenses,
        taxes: acc.taxes + summary.taxes,
        uncatIn: acc.uncatIn + summary.uncategorizedInflows,
        uncatOut: acc.uncatOut + summary.uncategorizedOutflows,
        fullyCategorized: acc.fullyCategorized && summary.fullyCategorized,
      }),
      { income: 0, cogs: 0, opex: 0, taxes: 0, uncatIn: 0, uncatOut: 0, fullyCategorized: true },
    )

  const grossProfit = totals.income - totals.cogs
  const profitBeforeTaxes = grossProfit - totals.opex
  const netProfit = profitBeforeTaxes - totals.taxes

  return {
    businessId: PROFIT_AND_LOSS_FIXTURE_BUSINESS_ID,
    startDate,
    endDate,
    fullyCategorized: totals.fullyCategorized,
    grossProfit,
    grossProfitPercentDelta: undefined,
    profitBeforeTaxes,
    profitBeforeTaxesPercentDelta: undefined,
    netProfit,
    netProfitPercentDelta: undefined,
    income: makeSectionLineItem('REVENUE', 'Revenue', totals.income, INCOME_SPLIT),
    costOfGoodsSold: makeSectionLineItem('COGS', 'Cost of Goods Sold', totals.cogs, COGS_SPLIT),
    expenses: makeSectionLineItem('OPERATING_EXPENSES', 'Operating Expenses', totals.opex, OPEX_SPLIT),
    taxes: {
      name: 'TAXES',
      displayName: 'Taxes',
      value: totals.taxes,
      isContra: false,
      lineItems: totals.taxes > 0
        ? [{
          name: 'INCOME_TAX',
          displayName: 'Income Tax',
          value: totals.taxes,
          isContra: false,
          lineItems: [],
        }]
        : [],
    },
    customLineItems: null,
    otherOutflows: null,
    uncategorizedInflows: totals.uncatIn > 0
      ? {
        name: 'UNCATEGORIZED_INFLOWS',
        displayName: 'Uncategorized Inflows',
        value: totals.uncatIn,
        isContra: false,
        lineItems: [],
      }
      : undefined,
    uncategorizedOutflows: totals.uncatOut > 0
      ? {
        name: 'UNCATEGORIZED_OUTFLOWS',
        displayName: 'Uncategorized Outflows',
        value: totals.uncatOut,
        isContra: false,
        lineItems: [],
      }
      : undefined,
    personalExpenses: null,
  }
}
