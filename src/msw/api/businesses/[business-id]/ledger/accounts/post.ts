import { Schema } from 'effect'

import { SingleChartAccountSchema, type SingleChartAccountType } from '@schemas/generalLedger/ledgerAccount'

import { ledgerAccountFromUpsertRequest } from '@msw/api/businesses/[business-id]/ledger/accounts/ledgerAccountFromUpsertRequest'
import { ledgerAccountStore } from '@msw/api/businesses/[business-id]/ledger/accounts/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { createStoreCreateResolver } from '@msw/utils/createStoreResolvers'
import { makeChartAccount } from '@fixtures/chartOfAccounts/mocks'

const encodeLedgerAccount = Schema.encodeSync(SingleChartAccountSchema)

export const toCreateLedgerAccountResponse = (account: SingleChartAccountType) =>
  apiData(encodeLedgerAccount(account))

export const post = createMockEndpoint<SingleChartAccountType, ReturnType<typeof toCreateLedgerAccountResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/ledger/accounts',
  resolve: createStoreCreateResolver({
    store: ledgerAccountStore,
    makeBase: id => makeChartAccount({ accountId: id }),
    fromRequest: ledgerAccountFromUpsertRequest,
    toResponse: toCreateLedgerAccountResponse,
  }),
})
