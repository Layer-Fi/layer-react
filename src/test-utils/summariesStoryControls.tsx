import { type Meta } from '@storybook/react-vite'

import {
  type ProfitAndLossSummariesReportingVariant,
  type ProfitAndLossSummariesSlotProps,
  type ProfitAndLossSummariesStringOverrides,
} from '@components/ProfitAndLossSummaries/ProfitAndLossSummaries'

export type SummariesStoryArgs = {
  reportingVariant: 'profitAndLoss' | 'cashflow'
  showProfitAndLossBreakdown: boolean
  revenueLabel: string
  expensesLabel: string
  netProfitLabel: string
  moneyInLabel: string
  moneyOutLabel: string
  netCashFlowLabel: string
}

export const summariesStoryDefaultArgs: SummariesStoryArgs = {
  reportingVariant: 'profitAndLoss',
  showProfitAndLossBreakdown: true,
  revenueLabel: '',
  expensesLabel: '',
  netProfitLabel: '',
  moneyInLabel: '',
  moneyOutLabel: '',
  netCashFlowLabel: '',
}

type SummariesArgTypes = NonNullable<Meta<SummariesStoryArgs>['argTypes']>

type SummariesControlOptions = {
  /** Path shown for the summaries string overrides, e.g. `stringOverrides.profitAndLoss.summaries`. */
  stringOverridesPath: string
  /** Path shown for the summaries slot props, e.g. `slotProps.profitAndLoss.summaries`. */
  slotPropsPath: string
  /** Controls-panel section the controls appear under. */
  category: string
}

const STRING_OVERRIDE_LABELS = [
  ['revenueLabel', 'Revenue'],
  ['expensesLabel', 'Expenses'],
  ['netProfitLabel', 'Net Profit'],
  ['moneyInLabel', 'Money in'],
  ['moneyOutLabel', 'Money out'],
  ['netCashFlowLabel', 'Net cash flow'],
] as const

export const makeSummariesStoryControls = ({ stringOverridesPath, slotPropsPath, category }: SummariesControlOptions) => {
  const stringOverrideArgTypes = Object.fromEntries(STRING_OVERRIDE_LABELS.map(([key, defaultLabel]) => [
    key,
    {
      control: 'text' as const,
      description: `The real prop is \`${stringOverridesPath}.${key}\`. Type a value to override the label, `
        + 'or leave it blank to use the default.',
      table: {
        category,
        defaultValue: { summary: defaultLabel },
      },
    },
  ]))

  const argTypes: SummariesArgTypes = {
    reportingVariant: {
      name: 'reportingVariant.type',
      control: 'radio',
      options: ['profitAndLoss', 'cashflow'],
      description: `The real prop is \`${slotPropsPath}.reportingVariant.type\`.`,
      table: {
        category,
        type: { summary: '\'profitAndLoss\' | \'cashflow\'' },
      },
    },
    showProfitAndLossBreakdown: {
      name: 'reportingVariant.showProfitAndLossBreakdown',
      control: 'boolean',
      description: `The real prop is \`${slotPropsPath}.reportingVariant.showProfitAndLossBreakdown\`. `
        + 'Shows the categorized/uncategorized breakdown footers (cash flow variant only).',
      table: {
        category,
        type: { summary: 'boolean' },
      },
    },
    ...stringOverrideArgTypes,
  }

  const controlNames = Object.entries(argTypes)
    .map(([key, argType]) => (argType as { name?: string }).name ?? key)

  return { argTypes, controlNames }
}

export const buildSummariesReportingVariant = (
  args: SummariesStoryArgs,
): ProfitAndLossSummariesReportingVariant =>
  args.reportingVariant === 'cashflow'
    ? { type: 'cashflow', showProfitAndLossBreakdown: args.showProfitAndLossBreakdown }
    : { type: 'profitAndLoss' }

export const buildSummariesSlotProps = (args: SummariesStoryArgs): ProfitAndLossSummariesSlotProps => ({
  reportingVariant: buildSummariesReportingVariant(args),
})

export const buildSummariesStringOverrides = (
  args: SummariesStoryArgs,
): ProfitAndLossSummariesStringOverrides | undefined => {
  const overrides = Object.fromEntries(
    STRING_OVERRIDE_LABELS
      .map(([key]) => [key, args[key]] as const)
      .filter(([, value]) => value !== ''),
  )

  return Object.keys(overrides).length > 0 ? overrides : undefined
}
