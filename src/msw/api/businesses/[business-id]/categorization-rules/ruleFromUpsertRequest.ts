import { Schema } from 'effect'

import { type CategorizationRule } from '@schemas/features/categorization/categorizationRule'
import { type CreateCategorizationRule, CreateCategorizationRuleSchema } from '@schemas/features/categorization/createCategorizationRule'
import { type PatchCategorizationRule, PatchCategorizationRuleSchema } from '@schemas/features/categorization/patchCategorizationRule'

import { counterpartyStore } from '@msw/api/businesses/[business-id]/counterparties/store'
import { readRequestJson } from '@msw/utils/request'

const decodeCreateBody = Schema.decodeUnknownSync(CreateCategorizationRuleSchema)
const decodePatchBody = Schema.decodeUnknownSync(PatchCategorizationRuleSchema)

const resolveCounterparty = (counterpartyId: string) =>
  counterpartyStore.findById(counterpartyId) ?? { id: counterpartyId, name: null, mccs: [] }

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
      : resolveCounterparty(body.counterpartyFilter),
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
