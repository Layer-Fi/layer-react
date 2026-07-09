import { Schema } from 'effect'

import {
  type LedgerAccountType,
  LedgerAccountTypeSchema,
  type SingleChartAccountType,
} from '@schemas/generalLedger/ledgerAccount'
import { UpsertLedgerAccountSchema } from '@schemas/generalLedger/upsertLedgerAccount'

import { accountParentStore } from '@msw/api/businesses/[business-id]/ledger/accounts/store'
import { readRequestJson } from '@msw/utils/request'
import { ACCOUNT_TYPE_DISPLAY_NAME } from '@fixtures/chartOfAccounts/constants'

const decodeUpsert = Schema.decodeUnknownSync(UpsertLedgerAccountSchema)

const isLedgerAccountType = Schema.is(LedgerAccountTypeSchema)

const toLedgerAccountType = (value: string, fallback: LedgerAccountType): LedgerAccountType =>
  isLedgerAccountType(value) ? value : fallback

export const ledgerAccountFromUpsertRequest = async (
  request: Request,
  base: SingleChartAccountType,
): Promise<SingleChartAccountType> => {
  const { accountNumber, stableName, accountType, accountSubtype, parentId, ...scalars } =
    decodeUpsert(await readRequestJson(request))

  if (parentId != null) {
    accountParentStore.save({ id: base.accountId, parentAccountId: parentId.id })
  }

  const accountTypeValue = toLedgerAccountType(accountType, base.accountType.value)

  return {
    ...base,
    ...scalars,
    accountNumber: accountNumber ?? null,
    stableName: stableName?.stableName ?? base.stableName,
    accountType: { value: accountTypeValue, displayName: ACCOUNT_TYPE_DISPLAY_NAME[accountTypeValue] },
    accountSubtype: accountSubtype != null
      ? { value: accountSubtype, displayName: base.accountSubtype.displayName }
      : base.accountSubtype,
  }
}
