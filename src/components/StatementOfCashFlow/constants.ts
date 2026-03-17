import { translationKey } from '@utils/i18n/translationKey'

export const STATEMENT_OF_CASH_FLOW_ROWS_CONFIG = [
  {
    name: 'OperatingActivities',
    lineItem: 'operating_activities',
    type: 'line_item',
    summarize: true,
    ...translationKey('reports:label.operating_activities', 'Operating Activities'),
  },
  {
    name: 'InvestingActivities',
    lineItem: 'investing_activities',
    type: 'line_item',
    summarize: true,
    ...translationKey('reports:label.investing_activities', 'Investing Activities'),
  },
  {
    name: 'FinancingActivities',
    lineItem: 'financing_activities',
    type: 'line_item',
    summarize: true,
    ...translationKey('reports:label.financing_activities', 'Financing Activities'),
  },
  {
    name: 'PeriodNetCashIncrease',
    lineItem: 'period_net_cash_increase',
    type: 'summary_value',
    summarize: false,
    ...translationKey('reports:label.net_cash_increase_period', 'Net Cash Increase For Period'),
  },
  {
    name: 'CashAtBeginningOfPeriod',
    lineItem: 'cash_at_start_of_period',
    type: 'summary_value',
    summarize: false,
    ...translationKey('reports:label.cash_beginning_of_period', 'Cash at Beginning of Period'),
  },
  {
    name: 'CashAtEndOfPeriod',
    lineItem: 'cash_at_end_of_period',
    type: 'summary_value',
    summarize: false,
    ...translationKey('reports:label.cash_end_of_period', 'Cash at End of Period'),
  },
] as const

export const ADJUSTMENTS_ROW_I18N = translationKey('reports:label.adjustments_net_income', 'Adjustments to Net Income')
