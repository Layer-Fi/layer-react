import {
  BankTransaction,
  CategorizationStatus,
  CategorizationType,
  Direction,
} from '../../types'

export const makeBankTransaction = (
  options: Partial<BankTransaction> = {},
): BankTransaction => ({
  type: 'Bank_Transaction',
  id: '096f7da0-45d6-432c-b9d9-29f8474b8aa3',
  business_id: '23b01ed6-b786-4f5f-827c-e23d91a08256',
  source: 'UNIT',
  source_transaction_id: '72374882-1961.6187484853291',
  source_account_id: '9311880',
  imported_at: '2023-10-04T20:05:10.853973Z',
  date: '2023-09-28T20:04:45Z',
  direction: Direction.DEBIT,
  amount: 20090,
  counterparty_name: 'AMERICAN TRANSPORT LLC ',
  description: null,
  categorization_status: 'CATEGORIZED' as CategorizationStatus,
  category: {
    type: 'Account',
    id: 'aea91d00-a662-4711-b7a5-d70e167856a2',
    stable_name: 'LOAD_INCOME',
    category: 'LOAD_INCOME',
    display_name: 'Load income',
  },
  categorization_method: 'LAYER_AUTO',
  categorization_flow: {
    type: CategorizationType.AUTO,
    category: {
      type: 'Account',
      id: 'aea91d00-a662-4711-b7a5-d70e167856a2',
      stable_name: 'LOAD_INCOME',
      category: 'LOAD_INCOME',
      display_name: 'Load income',
    },
  },
  categorization_ux: {
    options: [
      {
        type: 'MENU',
        name: 'BUSINESS',
        display_string: 'Business',
        menu_options: [
          {
            type: 'CATEGORIZE',
            name: 'LOAD_INCOME',
            display_string: 'Load income',
            account: {
              type: 'Account',
              id: 'aea91d00-a662-4711-b7a5-d70e167856a2',
              stable_name: 'LOAD_INCOME',
              category: 'LOAD_INCOME',
              display_name: 'Load income',
            },
          },
          {
            type: 'FREE_SELECT',
            name: 'FREE_SELECT',
            display_string: 'Something else',
          },
        ],
      },
      {
        type: 'CATEGORIZE',
        name: 'PERSONAL',
        display_string: 'Personal',
        account: {
          type: 'Exclusion',
          id: 'PERSONAL_INFLOWS',
          category: 'PERSONAL_INFLOWS',
          display_name:
            'Personal income sources not related to your trucking business',
        },
      },
      {
        type: 'SPLIT',
        name: 'SPLIT',
        display_string: 'Split',
      },
    ],
  },
  projected_income_category: 'REVENUE',
  ...options,
})
