import { BankTransactionDirection } from '@schemas/bankTransactions/base'

import { chartOfAccounts } from '@fixtures/generated/chartOfAccounts.gen'

export type BankTransactionCategory = {
  id: string
  stableName: string
  displayName: string
}

const accountCategory = (stableName: string): BankTransactionCategory => {
  const account = chartOfAccounts.find(account => account.stableName === stableName)

  if (!account) {
    throw new Error(`bankTransactions fixtures reference unknown chart of accounts stable name "${stableName}"`)
  }

  return { id: account.accountId, stableName, displayName: account.name }
}

/*
 * The categorization catalog is the chart of accounts fixture pool - the same
 * accounts the mocked /categories endpoint serves - so categorized bank
 * transactions reference real account ids and display names.
 */
export const bankTransactionCategories = {
  bankFees: accountCategory('BANK_FEES'),
  costOfGoodsSold: accountCategory('COST_OF_GOODS_SOLD'),
  insurance: accountCategory('INSURANCE'),
  marketing: accountCategory('MARKETING'),
  meals: accountCategory('MEALS'),
  officeExpenses: accountCategory('OFFICE_EXPENSES'),
  payrollContractors: accountCategory('PAYROLL_CONTRACTORS'),
  payrollWages: accountCategory('PAYROLL_REGULAR_WAGES'),
  professionalServices: accountCategory('PROFESSIONAL_SERVICES'),
  rent: accountCategory('RENT'),
  sales: accountCategory('SALES'),
  software: accountCategory('SOFTWARE'),
  travel: accountCategory('TRAVEL'),
  utilities: accountCategory('UTILITIES'),
} satisfies Record<string, BankTransactionCategory>

export type BankTransactionMerchant = {
  name: string
  direction: BankTransactionDirection
  describe: (ref: number) => string
  primary: BankTransactionCategory
  alternates: readonly BankTransactionCategory[]
  amountRange: readonly [number, number]
}

const CATEGORIES = bankTransactionCategories

// Recognizable merchants paired with the categories a bookkeeper would
// realistically apply (or be suggested) for that merchant's purchases.
export const bankTransactionMerchants: readonly BankTransactionMerchant[] = [
  { name: 'Amazon', direction: BankTransactionDirection.MoneyOut, describe: ref => `AMAZON MKTPL*${ref} AMZN.COM/BILL WA`, primary: CATEGORIES.officeExpenses, alternates: [CATEGORIES.costOfGoodsSold, CATEGORIES.software], amountRange: [12, 400] },
  { name: 'Staples', direction: BankTransactionDirection.MoneyOut, describe: ref => `STAPLES 00${ref} SAN FRANCISCO CA`, primary: CATEGORIES.officeExpenses, alternates: [CATEGORIES.costOfGoodsSold], amountRange: [8, 250] },
  { name: 'Starbucks', direction: BankTransactionDirection.MoneyOut, describe: ref => `STARBUCKS STORE ${ref} SEATTLE WA`, primary: CATEGORIES.meals, alternates: [CATEGORIES.travel], amountRange: [4, 40] },
  { name: 'Chipotle', direction: BankTransactionDirection.MoneyOut, describe: ref => `CHIPOTLE ${ref} AUSTIN TX`, primary: CATEGORIES.meals, alternates: [], amountRange: [9, 80] },
  { name: 'Uber', direction: BankTransactionDirection.MoneyOut, describe: ref => `UBER TRIP ${ref} HELP.UBER.COM`, primary: CATEGORIES.travel, alternates: [CATEGORIES.meals], amountRange: [8, 90] },
  { name: 'Delta Air Lines', direction: BankTransactionDirection.MoneyOut, describe: ref => `DELTA AIR LINES ATL ${ref}`, primary: CATEGORIES.travel, alternates: [], amountRange: [150, 1400] },
  { name: 'Marriott', direction: BankTransactionDirection.MoneyOut, describe: ref => `MARRIOTT ${ref} SAN FRANCISCO CA`, primary: CATEGORIES.travel, alternates: [CATEGORIES.meals], amountRange: [120, 900] },
  { name: 'Shell', direction: BankTransactionDirection.MoneyOut, describe: ref => `SHELL OIL ${ref} HOUSTON TX`, primary: CATEGORIES.travel, alternates: [], amountRange: [20, 120] },
  { name: 'The Home Depot', direction: BankTransactionDirection.MoneyOut, describe: ref => `THE HOME DEPOT #${String(ref).slice(0, 4)} DENVER CO`, primary: CATEGORIES.officeExpenses, alternates: [CATEGORIES.costOfGoodsSold], amountRange: [15, 600] },
  { name: 'Costco', direction: BankTransactionDirection.MoneyOut, describe: ref => `COSTCO WHSE #${String(ref).slice(0, 4)} PORTLAND OR`, primary: CATEGORIES.officeExpenses, alternates: [CATEGORIES.meals, CATEGORIES.costOfGoodsSold], amountRange: [40, 700] },
  { name: 'Apple', direction: BankTransactionDirection.MoneyOut, describe: ref => `APPLE.COM/BILL ${ref} CUPERTINO CA`, primary: CATEGORIES.software, alternates: [CATEGORIES.officeExpenses], amountRange: [1, 2500] },
  { name: 'Adobe', direction: BankTransactionDirection.MoneyOut, describe: ref => `ADOBE *CREATIVE CLOUD ${ref}`, primary: CATEGORIES.software, alternates: [], amountRange: [20, 80] },
  { name: 'Google', direction: BankTransactionDirection.MoneyOut, describe: ref => `GOOGLE *GSUITE ${ref}`, primary: CATEGORIES.software, alternates: [CATEGORIES.marketing], amountRange: [6, 300] },
  { name: 'Amazon Web Services', direction: BankTransactionDirection.MoneyOut, describe: ref => `AMAZON WEB SERVICES AWS.AMAZON.CO ${ref}`, primary: CATEGORIES.software, alternates: [], amountRange: [20, 1500] },
  { name: 'Comcast', direction: BankTransactionDirection.MoneyOut, describe: ref => `COMCAST CABLE COMM ${ref}`, primary: CATEGORIES.utilities, alternates: [], amountRange: [60, 300] },
  { name: 'Verizon', direction: BankTransactionDirection.MoneyOut, describe: ref => `VZWRLSS*APOCC VISB ${ref}`, primary: CATEGORIES.utilities, alternates: [], amountRange: [45, 250] },
  { name: 'FedEx', direction: BankTransactionDirection.MoneyOut, describe: ref => `FEDEX ${ref} MEMPHIS TN`, primary: CATEGORIES.officeExpenses, alternates: [CATEGORIES.costOfGoodsSold], amountRange: [9, 150] },
  { name: 'WeWork', direction: BankTransactionDirection.MoneyOut, describe: ref => `WEWORK ${ref} NEW YORK NY`, primary: CATEGORIES.rent, alternates: [], amountRange: [350, 2500] },
  { name: 'Gusto', direction: BankTransactionDirection.MoneyOut, describe: ref => `GUSTO PAY ${ref}`, primary: CATEGORIES.payrollWages, alternates: [CATEGORIES.payrollContractors], amountRange: [800, 9000] },
  { name: 'State Farm', direction: BankTransactionDirection.MoneyOut, describe: ref => `STATE FARM INSURANCE ${ref}`, primary: CATEGORIES.insurance, alternates: [], amountRange: [80, 400] },
  { name: 'Meta', direction: BankTransactionDirection.MoneyOut, describe: ref => `FACEBK ADS ${ref}`, primary: CATEGORIES.marketing, alternates: [], amountRange: [25, 1200] },
  { name: 'Stripe', direction: BankTransactionDirection.MoneyIn, describe: ref => `STRIPE TRANSFER ST-${ref}`, primary: CATEGORIES.sales, alternates: [], amountRange: [100, 9000] },
  { name: 'Square', direction: BankTransactionDirection.MoneyIn, describe: ref => `SQUARE INC ${ref}`, primary: CATEGORIES.sales, alternates: [], amountRange: [50, 4000] },
  { name: 'Shopify', direction: BankTransactionDirection.MoneyIn, describe: ref => `SHOPIFY PAYMENTS ${ref}`, primary: CATEGORIES.sales, alternates: [], amountRange: [80, 6000] },
  { name: 'PayPal', direction: BankTransactionDirection.MoneyIn, describe: ref => `PAYPAL TRANSFER ${ref}`, primary: CATEGORIES.sales, alternates: [], amountRange: [20, 1500] },
]
