import { ProfitAndLoss } from '../../types'
import { LineItem } from '../../types/profit_and_loss'

export const makeProfitAndLoss = (
  options: Partial<ProfitAndLoss>,
): ProfitAndLoss => ({
  type: 'Profit_And_Loss',
  business_id: '9bf9c71c-ebbb-4fd1-bccb-756267aad447',
  start_date: '2023-01-01T06:00:00Z',
  end_date: '2023-12-31T17:59:00Z',
  income: {
    name: 'REVENUE',
    display_name: 'Revenue',
    value: 677136,
    line_items: [
      makeLineItem({
        name: 'SERVICE_REVENUE',
        display_name: 'Service Revenue',
        value: 626881,
        line_items: null,
      }),
      makeLineItem({
        name: 'MERCHANDISE_SALES_REVENUE',
        display_name: 'Merchandise Sales Revenue',
        value: 50255,
        line_items: null,
      }),
    ],
  },
  cost_of_goods_sold: {
    name: 'COGS',
    display_name: 'Cost of Goods Sold',
    value: 64312,
    line_items: [
      makeLineItem({
        name: 'SUPPLIES_EXPENSE',
        display_name: 'Supplies',
        value: 38903,
        line_items: [
          makeLineItem({
            name: 'SUPPLIES_GENERAL_ELECTRIC',
            display_name: 'Supplies from General Electric',
            value: 20281,
            line_items: null,
          }),
          makeLineItem({
            name: 'SUPPLIES_OTHER',
            display_name: 'Supplies from other vendors',
            value: 18622,
            line_items: null,
          }),
        ],
      }),
      makeLineItem({
        name: 'LABOR_EXPENSE',
        display_name: 'Labor',
        value: 25000,
        line_items: null,
      }),
      makeLineItem({
        name: 'OTHER_COST_OF_SALES',
        display_name: 'Other cost of sales',
        value: 409,
        line_items: null,
      }),
    ],
  },
  gross_profit: 612824,
  expenses: {
    name: 'OPERATING_EXPENSES',
    display_name: 'Operating Expenses',
    value: 27839,
    line_items: [
      makeLineItem({
        name: 'RENT_EXPENSE',
        display_name: 'Rent',
        value: 0,
        line_items: null,
      }),
      makeLineItem({
        name: 'UTILITIES',
        display_name: 'Utilities',
        value: 0,
        line_items: null,
      }),
      makeLineItem({
        name: 'PHONE',
        display_name: 'Cell phone plans',
        value: 21131,
        line_items: null,
      }),
      makeLineItem({
        name: 'ADVERTISING',
        display_name: 'Advertising',
        value: 3779,
        line_items: null,
      }),
      makeLineItem({
        name: 'INSURANCE',
        display_name: 'Insurance',
        value: 0,
        line_items: null,
      }),
      makeLineItem({
        name: 'OTHER_BUSINESS',
        display_name: 'Other business expenses',
        value: 2929,
        line_items: null,
      }),
    ],
  },
  profit_before_taxes: 584985,
  taxes: makeLineItem({
    name: 'TAXES',
    display_name: 'Taxes',
    value: 3921,
    line_items: null,
  }),
  net_profit: 581064,
  other_outflows: null,
  personal_expenses: makeLineItem({
    name: 'PERSONAL',
    display_name: 'Personal expenses',
    value: 5599,
    line_items: null,
  }),
  fully_categorized: false,
  ...options,
})

export const makeLineItem = (options: Partial<LineItem>): LineItem => ({
  name: 'REVENUE',
  display_name: 'Revenue',
  value: 677136,
  line_items: [
    {
      name: 'SERVICE_REVENUE',
      display_name: 'Service Revenue',
      value: 626881,
      line_items: null,
    },
    {
      name: 'MERCHANDISE_SALES_REVENUE',
      display_name: 'Merchandise Sales Revenue',
      value: 50255,
      line_items: null,
    },
  ],
  ...options,
})
