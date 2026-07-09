import { type NestedLedgerAccountEncoded } from '@schemas/generalLedger/ledgerAccount'

import { ledgerAccountStore } from '@msw/api/businesses/[business-id]/ledger/accounts/store'
import { toBalancesResponse } from '@msw/api/businesses/[business-id]/ledger/balances/get'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { csvPresignedUrlResponse, formatCsvCents } from '@msw/utils/csvPresignedUrl'

const HEADER = ['Account', 'Stable Name', 'Type', 'Sub-Type', 'Normality', 'Balance']

const flattenRows = (nodes: ReadonlyArray<NestedLedgerAccountEncoded>, depth = 0): string[][] =>
  nodes.flatMap(node => [
    [
      `${'  '.repeat(depth)}${node.name}`,
      node.stable_name ?? '',
      node.account_type.display_name,
      node.account_subtype.display_name,
      node.normality,
      formatCsvCents(node.balance),
    ],
    ...flattenRows(node.sub_accounts, depth + 1),
  ])

export const get = createMockEndpoint<undefined, ReturnType<typeof csvPresignedUrlResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/ledger/balances/exports/csv',
  resolve: () => {
    const { data } = toBalancesResponse(ledgerAccountStore.all())

    return csvPresignedUrlResponse('account-balances.csv', [HEADER, ...flattenRows(data.accounts)])
  },
})
