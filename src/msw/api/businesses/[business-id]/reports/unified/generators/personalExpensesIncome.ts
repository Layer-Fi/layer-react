import { type SingleChartAccountType } from '@schemas/generalLedger/ledgerAccount'
import { type UnifiedReport } from '@schemas/reports/unifiedReport'

import { ledgerAccountStore } from '@msw/api/businesses/[business-id]/ledger/accounts/store'
import { reportRangeFromParams } from '@msw/api/businesses/[business-id]/reports/unified/generators/periods'
import { totalRowLabel } from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'
import {
  type Counterparty,
  customerCandidates,
  transactionLineItems,
  transactionReport,
  vendorCandidates,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/transactions'

const accountsOfSubtype = (subtype: string): SingleChartAccountType[] =>
  ledgerAccountStore.all().filter(account => account.accountSubtype?.value === subtype)

const generatePersonalReport = (
  params: URLSearchParams,
  subtype: string,
  counterpartyColumn: 'vendor' | 'customer',
  candidates: Counterparty[],
  total: { rowKey: string, label: string },
): UnifiedReport => transactionReport({
  counterpartyColumn,
  items: transactionLineItems({
    accounts: accountsOfSubtype(subtype),
    candidates,
    range: reportRangeFromParams(params),
    params,
    unsigned: true,
  }),
  total,
})

export const generatePersonalExpenses = (params: URLSearchParams) => generatePersonalReport(
  params,
  'DISTRIBUTIONS',
  'vendor',
  vendorCandidates(),
  { rowKey: 'personal_expenses', label: totalRowLabel('Personal Expenses') },
)

export const generatePersonalIncome = (params: URLSearchParams) => generatePersonalReport(
  params,
  'CONTRIBUTIONS',
  'customer',
  customerCandidates(),
  { rowKey: 'personal_income', label: totalRowLabel('Personal Income') },
)
