import { ProfitAndLoss } from '../../types'

export default {
  type: 'Profit_And_Loss',
  business_id: '',
  start_date: '',
  end_date: '',
  income: {
    name: 'INCOME',
    display_name: 'Income',
    value: NaN,
    line_items: null,
  },
  cost_of_goods_sold: {
    display_name: 'Cost of Goods Sold',
    name: 'COGS',
    value: NaN,
    line_items: null,
  },
  gross_profit: NaN,
  expenses: {
    name: 'EXPENSES',
    display_name: 'Expenses',
    value: NaN,
    line_items: null,
  },
  profit_before_taxes: NaN,
  taxes: {
    name: 'TAXES',
    display_name: 'Taxes',
    value: NaN,
    line_items: null,
  },
  net_profit: NaN,
  other_outflows: {
    name: 'OTHER_OUTFLOWS',
    display_name: 'Other outflows',
    value: NaN,
    line_items: null,
  },
  personal_expenses: {
    name: 'PERSONAL',
    display_name: 'Personal expenses',
    value: NaN,
    line_items: null,
  },
  fully_categorized: false,
} as ProfitAndLoss
