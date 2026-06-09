import { type NestedLedgerAccountType } from '@schemas/generalLedger/ledgerAccount'
import { type LedgerAccountForm } from '@schemas/generalLedger/upsertLedgerAccount'

export type EditLedgerAccountContext = {
  account: NestedLedgerAccountType
  parentAccountId?: string
}

const DEFAULT_LEDGER_ACCOUNT_FORM = {
  parent: null,
  name: '',
  accountNumber: '',
  type: null,
  subType: null,
  normality: null,
}

export const getLedgerAccountFormDefaultValues = (
  edit?: EditLedgerAccountContext,
): LedgerAccountForm => {
  if (!edit) return DEFAULT_LEDGER_ACCOUNT_FORM

  const { account, parentAccountId } = edit

  return {
    parent: parentAccountId ?? null,
    name: account.name,
    accountNumber: account.accountNumber ?? '',
    type: account.accountType.value,
    subType: account.accountSubtype.value,
    normality: account.normality,
  }
}

export enum LedgerAccountInvalidReason {
  ParentRequired = 'parentRequired',
  NameRequired = 'nameRequired',
  TypeRequired = 'typeRequired',
  SubTypeRequired = 'subTypeRequired',
  NormalityRequired = 'normalityRequired',
}

export type LedgerAccountValidationError = {
  field: 'parent' | 'name' | 'type' | 'subType' | 'normality'
  reason: LedgerAccountInvalidReason
}

export const validateLedgerAccountForm = (
  form: LedgerAccountForm,
): LedgerAccountValidationError[] | null => {
  const errors: LedgerAccountValidationError[] = []

  if (!form.parent) {
    errors.push({ field: 'parent', reason: LedgerAccountInvalidReason.ParentRequired })
  }

  if (!form.name.trim()) {
    errors.push({ field: 'name', reason: LedgerAccountInvalidReason.NameRequired })
  }

  if (!form.type) {
    errors.push({ field: 'type', reason: LedgerAccountInvalidReason.TypeRequired })
  }

  if (!form.subType) {
    errors.push({ field: 'subType', reason: LedgerAccountInvalidReason.SubTypeRequired })
  }

  if (!form.normality) {
    errors.push({ field: 'normality', reason: LedgerAccountInvalidReason.NormalityRequired })
  }

  return errors.length > 0 ? errors : null
}

export const convertLedgerAccountFormToParams = (
  form: LedgerAccountForm,
  options?: { stableName?: string | null },
): unknown => ({
  name: form.name.trim(),
  accountNumber: form.accountNumber.trim() || undefined,
  normality: form.normality,
  parentId: form.parent ? { type: 'AccountId', id: form.parent } : undefined,
  accountType: form.type,
  accountSubtype: form.subType ?? undefined,
  stableName: options?.stableName
    ? { type: 'StableName', stableName: options.stableName }
    : undefined,
})
