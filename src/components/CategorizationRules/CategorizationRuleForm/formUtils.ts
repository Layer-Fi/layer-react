import { BigDecimal as BD, Schema } from 'effect'
import type { TFunction } from 'i18next'

import type { BankTransactionCounterparty } from '@schemas/bankTransactions/base'
import {
  type BankDirectionFilter,
  type CategorizationRule,
  CreateCategorizationRuleSchema,
  PatchCategorizationRuleSchema,
} from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { type Classification, isClassificationAccountIdentifier } from '@schemas/categorization'
import {
  convertCentsToNonRecursiveBigDecimal,
  convertNonRecursiveBigDecimalToCents,
  fromNonRecursiveBigDecimal,
  type NonRecursiveBigDecimal,
} from '@schemas/nonRecursiveBigDecimal'

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

export const validateCategorizationRuleForm = (
  values: CategorizationRuleFormValues,
  t: TFunction,
) => {
  const errors: Array<Record<string, string>> = []

  if (!values.counterparty) {
    errors.push({
      counterparty: t('categorizationRules:validation.counterparty_required', 'Counterparty is required.'),
    })
  }

  if (!values.category || !isClassificationAccountIdentifier(values.category)) {
    errors.push({
      category: t('categorizationRules:validation.category_required', 'Category is required.'),
    })
  }

  if (values.amountMinFilter && values.amountMaxFilter) {
    const min = fromNonRecursiveBigDecimal(values.amountMinFilter)
    const max = fromNonRecursiveBigDecimal(values.amountMaxFilter)
    if (BD.greaterThan(min, max)) {
      errors.push({
        amountMinFilter: t('categorizationRules:validation.amount_min_greater_than_max', 'Minimum amount must be less than or equal to maximum amount.'),
      })
    }
  }

  return errors.length > 0 ? errors : null
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
    createdBySuggestionId: null,
    externalId: null,
    name: null,
    category: values.category,
    suggestion1: null,
    suggestion2: null,
    suggestion3: null,
    businessNameFilter: null,
    clientNameFilter: null,
    merchantTypeFilter: null,
    transactionDescriptionFilter: null,
    transactionTypeFilter: null,
    bankDirectionFilter: values.bankDirectionFilter === '' ? null : values.bankDirectionFilter,
    amountMinFilter: formAmountToCents(values.amountMinFilter),
    amountMaxFilter: formAmountToCents(values.amountMaxFilter),
    counterpartyFilter: values.counterparty.id,
    bankTransactionTypeFilter: null,
    mccFilter: null,
  }

  return Schema.encodeUnknownSync(CreateCategorizationRuleSchema)(parsed)
}

export const convertFormToPatchBody = (values: CategorizationRuleFormValues) => {
  if (!values.counterparty) {
    throw new Error('Counterparty is required to update a categorization rule')
  }
  if (!values.category || !isClassificationAccountIdentifier(values.category)) {
    throw new Error('Category is required to update a categorization rule')
  }

  const parsed = {
    category: values.category,
    bankDirectionFilter: values.bankDirectionFilter === '' ? null : values.bankDirectionFilter,
    counterpartyFilter: values.counterparty.id,
    amountMinFilter: formAmountToCents(values.amountMinFilter),
    amountMaxFilter: formAmountToCents(values.amountMaxFilter),
  }

  return Schema.encodeUnknownSync(PatchCategorizationRuleSchema)(parsed)
}
