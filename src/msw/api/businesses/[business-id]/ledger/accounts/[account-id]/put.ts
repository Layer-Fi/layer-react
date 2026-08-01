import { Schema } from 'effect'

import { SingleChartAccountSchema, type SingleChartAccountType } from '@schemas/generalLedger/ledgerAccount'

import { ledgerAccountFromUpsertRequest } from '@msw/api/businesses/[business-id]/ledger/accounts/ledgerAccountFromUpsertRequest'
import { ledgerAccountStore } from '@msw/api/businesses/[business-id]/ledger/accounts/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { createStoreUpdateResolver } from '@msw/utils/createStoreResolvers'
import { makeChartAccount } from '@fixtures/chartOfAccounts/mocks'

const encodeLedgerAccount = Schema.encodeSync(SingleChartAccountSchema)

export const toUpdateLedgerAccountResponse = (account: SingleChartAccountType) =>
  apiData(encodeLedgerAccount(account))

export const put = createMockEndpoint<SingleChartAccountType, ReturnType<typeof toUpdateLedgerAccountResponse>>({
  method: 'put',
  path: '*/v1/businesses/:businessId/ledger/accounts/:accountId',
  resolve: createStoreUpdateResolver({
    idParam: 'accountId',
    store: ledgerAccountStore,
    makeBase: id => makeChartAccount({ accountId: id }),
    fromRequest: ledgerAccountFromUpsertRequest,
    toResponse: toUpdateLedgerAccountResponse,
    setId: (account, id) => ({ ...account, accountId: id }),
  }),
})
