import { type SingleChartAccountType } from '@schemas/generalLedger/ledgerAccount'

export const accountCategorizationFields = (account: SingleChartAccountType) => ({
  id: account.accountId,
  stableName: account.stableName ?? null,
  category: account.stableName ?? account.accountId,
  displayName: account.name,
})
