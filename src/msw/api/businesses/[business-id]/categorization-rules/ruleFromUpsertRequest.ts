import { Schema } from 'effect'

import {
  type CategorizationRule,
  type CreateCategorizationRule,
  CreateCategorizationRuleSchema,
  type PatchCategorizationRule,
  PatchCategorizationRuleSchema,
} from '@schemas/bankTransactions/categorizationRules/categorizationRule'

import { readRequestJson } from '@msw/utils/request'

const decodeCreateBody = Schema.decodeUnknownSync(CreateCategorizationRuleSchema)
const decodePatchBody = Schema.decodeUnknownSync(PatchCategorizationRuleSchema)

// The description filter is echoed as the readable filter, and the bare
// counterparty id becomes a minimal counterparty the real API would resolve.
const applyRuleFields = (
  base: CategorizationRule,
  body: CreateCategorizationRule | PatchCategorizationRule,
): CategorizationRule => ({
  ...base,
  ...(body.name !== undefined && { name: body.name ?? null }),
  ...(body.category !== undefined && { category: body.category ?? null }),
  ...(body.suggestion1 !== undefined && { suggestion1: body.suggestion1 ?? null }),
  ...(body.suggestion2 !== undefined && { suggestion2: body.suggestion2 ?? null }),
  ...(body.suggestion3 !== undefined && { suggestion3: body.suggestion3 ?? null }),
  ...(body.transactionDescriptionFilter !== undefined && {
    readableTransactionDescriptionFilter: body.transactionDescriptionFilter ?? null,
  }),
  ...(body.bankDirectionFilter !== undefined && { bankDirectionFilter: body.bankDirectionFilter ?? null }),
  ...(body.amountMinFilter !== undefined && { amountMinFilter: body.amountMinFilter ?? null }),
  ...(body.amountMaxFilter !== undefined && { amountMaxFilter: body.amountMaxFilter ?? null }),
  ...(body.counterpartyFilter !== undefined && {
    counterpartyFilter: body.counterpartyFilter == null
      ? null
      : { id: body.counterpartyFilter, name: null, mccs: [] },
  }),
  updatedAt: new Date(),
})

export const ruleFromCreateRequest = async (
  request: Request,
  base: CategorizationRule,
): Promise<CategorizationRule> =>
  applyRuleFields(base, decodeCreateBody(await readRequestJson(request)))

export const ruleFromPatchRequest = async (
  request: Request,
  base: CategorizationRule,
): Promise<CategorizationRule> =>
  applyRuleFields(base, decodePatchBody(await readRequestJson(request)))
