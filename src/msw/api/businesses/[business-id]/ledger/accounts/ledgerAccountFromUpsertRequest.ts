import { Schema } from 'effect'

import { type SingleChartAccountType } from '@schemas/features/generalLedger/chartOfAccounts'
import { type LedgerAccountType, LedgerAccountTypeSchema } from '@schemas/features/generalLedger/ledgerAccountType'
import { UpsertLedgerAccountSchema } from '@schemas/features/generalLedger/upsertLedgerAccount'
import { SUBTYPES_CONFIG_BY_TYPE } from '@utils/features/generalLedger/constants'
import { humanizeEnum } from '@utils/shared/string/format'

import { ACCOUNT_TYPE_DISPLAY_NAME } from '@fixtures/chartOfAccounts/constants'
import { accountParentStore } from '@msw/api/businesses/[business-id]/ledger/accounts/store'
import { readRequestJson } from '@msw/utils/request'

const decodeUpsert = Schema.decodeUnknownSync(UpsertLedgerAccountSchema)

const isLedgerAccountType = Schema.is(LedgerAccountTypeSchema)

const toLedgerAccountType = (value: string, fallback: LedgerAccountType): LedgerAccountType =>
  isLedgerAccountType(value) ? value : fallback

const SUBTYPE_DISPLAY_NAME = new Map(
  Object.values(SUBTYPES_CONFIG_BY_TYPE).flat().map(({ value, defaultValue }) => [value, defaultValue]),
)

const subtypeDisplayName = (value: string) => SUBTYPE_DISPLAY_NAME.get(value) ?? humanizeEnum(value)

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
      ? { value: accountSubtype, displayName: subtypeDisplayName(accountSubtype) }
      : base.accountSubtype,
  }
}
