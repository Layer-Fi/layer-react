import { LedgerAccountType } from '@schemas/features/generalLedger/ledgerAccountType'
import { type UnifiedReport } from '@schemas/features/unifiedReports/unifiedReport'

import { leafAccountsOfTypes } from '@msw/api/businesses/[business-id]/reports/unified/generators/accountEngine'
import { reportRangeFromParams } from '@msw/api/businesses/[business-id]/reports/unified/generators/periods'
import { totalRowLabel } from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'
import {
  byAccount,
  byCounterparty,
  customerCandidates,
  transactionLineItems,
  transactionReport,
  vendorCandidates,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/transactions'

export const generateBusinessExpenses = (params: URLSearchParams): UnifiedReport => {
  const groupBy = params.get('group_by')

  return transactionReport({
    counterpartyColumn: 'vendor',
    items: transactionLineItems({
      accounts: leafAccountsOfTypes([LedgerAccountType.Expense]),
      candidates: vendorCandidates(),
      range: reportRangeFromParams(params),
      params,
    }),
    groupsFor: groupBy === 'VENDOR'
      ? byCounterparty('vendor', 'Unnamed Vendor')
      : groupBy === 'ACCOUNT' ? byAccount : undefined,
    total: { rowKey: 'expenses', label: totalRowLabel('Expenses') },
  })
}

export const generateBusinessIncome = (params: URLSearchParams): UnifiedReport => transactionReport({
  counterpartyColumn: 'customer',
  items: transactionLineItems({
    accounts: leafAccountsOfTypes([LedgerAccountType.Revenue]),
    candidates: customerCandidates(),
    range: reportRangeFromParams(params),
    params,
  }),
  groupsFor: params.get('group_by') === 'CUSTOMER'
    ? byCounterparty('customer', 'Unnamed Customer')
    : undefined,
  total: { rowKey: 'income', label: totalRowLabel('Income') },
})
