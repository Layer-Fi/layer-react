import { translationKey } from '@utils/shared/i18n/translationKey'

export const STATEMENT_OF_CASH_FLOW_ROWS_CONFIG = [
  {
    name: 'OperatingActivities',
    lineItem: 'operating_activities',
    type: 'line_item',
    summarize: true,
    ...translationKey('cashflowStatement:StatementOfCashFlow.label.operating_activities', 'Operating Activities'),
  },
  {
    name: 'InvestingActivities',
    lineItem: 'investing_activities',
    type: 'line_item',
    summarize: true,
    ...translationKey('cashflowStatement:StatementOfCashFlow.label.investing_activities', 'Investing Activities'),
  },
  {
    name: 'FinancingActivities',
    lineItem: 'financing_activities',
    type: 'line_item',
    summarize: true,
    ...translationKey('cashflowStatement:StatementOfCashFlow.label.financing_activities', 'Financing Activities'),
  },
  {
    name: 'PeriodNetCashIncrease',
    lineItem: 'period_net_cash_increase',
    type: 'summary_value',
    summarize: false,
    ...translationKey('cashflowStatement:StatementOfCashFlow.label.net_cash_increase_period', 'Net Cash Increase For Period'),
  },
  {
    name: 'CashAtBeginningOfPeriod',
    lineItem: 'cash_at_start_of_period',
    type: 'summary_value',
    summarize: false,
    ...translationKey('cashflowStatement:StatementOfCashFlow.label.cash_beginning_of_period', 'Cash at Beginning of Period'),
  },
  {
    name: 'CashAtEndOfPeriod',
    lineItem: 'cash_at_end_of_period',
    type: 'summary_value',
    summarize: false,
    ...translationKey('cashflowStatement:StatementOfCashFlow.label.cash_end_of_period', 'Cash at End of Period'),
  },
] as const

export const ADJUSTMENTS_ROW_I18N = translationKey('cashflowStatement:StatementOfCashFlow.label.adjustments_net_income', 'Adjustments to Net Income')
