import { Schema } from 'effect'

import type { BankTransactionCounterparty } from '@schemas/bankTransactions/base'
import { type Classification, isClassificationAccountIdentifier } from '@schemas/categorization/categorization'
import {
  type BankDirectionFilter,
  type CategorizationRule,
  CreateCategorizationRuleSchema,
  PatchCategorizationRuleSchema,
} from '@schemas/categorization/categorizationRule'
import {
  convertCentsToNonRecursiveBigDecimal,
  convertNonRecursiveBigDecimalToCents,
  type NonRecursiveBigDecimal,
} from '@schemas/common/nonRecursiveBigDecimal'

export type CategorizationRuleFormState =
  | { mode: 'create' }
  | { mode: 'edit', rule: CategorizationRule }

export type DirectionFormValue = '' | BankDirectionFilter

export type CategorizationRuleFormValues = {
  counterparty: BankTransactionCounterparty | null
  category: Classification | null
  bankDirectionFilter: DirectionFormValue
  amountMinFilter: NonRecursiveBigDecimal | null
  amountMaxFilter: NonRecursiveBigDecimal | null
}

const centsToFormAmount = (cents: number | null | undefined): NonRecursiveBigDecimal | null => {
  if (cents == null) return null
  return convertCentsToNonRecursiveBigDecimal(cents)
}

const formAmountToCents = (amount: NonRecursiveBigDecimal | null): number | null => {
  if (amount == null) return null
  return convertNonRecursiveBigDecimalToCents(amount)
}

export const getCategorizationRuleFormDefaultValues = (
  state: CategorizationRuleFormState,
): CategorizationRuleFormValues => {
  if (state.mode === 'edit') {
    const { rule } = state
    return {
      counterparty: rule.counterpartyFilter ?? null,
      category: rule.category ?? null,
      bankDirectionFilter: rule.bankDirectionFilter ?? '',
      amountMinFilter: centsToFormAmount(rule.amountMinFilter),
      amountMaxFilter: centsToFormAmount(rule.amountMaxFilter),
    }
  }
  return {
    counterparty: null,
    category: null,
    bankDirectionFilter: '',
    amountMinFilter: null,
    amountMaxFilter: null,
  }
}

export const convertFormToCreateBody = (values: CategorizationRuleFormValues) => {
  if (!values.counterparty) {
    throw new Error('Counterparty is required to create a categorization rule')
  }
  if (!values.category || !isClassificationAccountIdentifier(values.category)) {
    throw new Error('Category is required to create a categorization rule')
  }

  const parsed = {
    applyRetroactively: false,
    category: values.category,
    bankDirectionFilter: values.bankDirectionFilter === '' ? null : values.bankDirectionFilter,
    amountMinFilter: formAmountToCents(values.amountMinFilter),
    amountMaxFilter: formAmountToCents(values.amountMaxFilter),
    counterpartyFilter: values.counterparty.id,
  }

  return Schema.encodeUnknownSync(CreateCategorizationRuleSchema)(parsed)
}

export const convertFormToPatchBody = (
  values: CategorizationRuleFormValues,
  transactionDescription: string | null,
) => {
  if (!values.counterparty && !transactionDescription) {
    throw new Error('Counterparty is required to update a categorization rule')
  }
  if (!values.category || !isClassificationAccountIdentifier(values.category)) {
    throw new Error('Category is required to update a categorization rule')
  }

  const parsed = {
    category: values.category,
    bankDirectionFilter: values.bankDirectionFilter === '' ? null : values.bankDirectionFilter,
    ...(values.counterparty
      ? { counterpartyFilter: values.counterparty.id, transactionDescriptionFilter: null }
      : {}),
    amountMinFilter: formAmountToCents(values.amountMinFilter),
    amountMaxFilter: formAmountToCents(values.amountMaxFilter),
  }

  return Schema.encodeUnknownSync(PatchCategorizationRuleSchema)(parsed)
}

export const getRuleTransactionDescription = (state: CategorizationRuleFormState) =>
  state.mode === 'edit' ? state.rule.readableTransactionDescriptionFilter?.trim() || null : null
