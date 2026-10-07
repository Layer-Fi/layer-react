import { pipe, Schema } from 'effect'

import { createOpenEnumSchema } from '@schemas/common/utils'
import { AskFormNextSchema } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNext'

export enum AskFormStepType {
  Choice = 'CHOICE',
  Search = 'SEARCH',
  SearchWithFreeform = 'SEARCH_WITH_FREEFORM',
  Category = 'CATEGORY',
  Text = 'TEXT',
  Action = 'ACTION',
  Upload = 'UPLOAD',
}

export enum AskFormSearchEntity {
  Category = 'CATEGORY',
  Vendor = 'VENDOR',
  Customer = 'CUSTOMER',
}

export enum AskFormCategoryScope {
  Task = 'TASK',
  EachTransaction = 'EACH_TRANSACTION',
}

export enum AskFormAction {
  ConnectAccount = 'CONNECT_ACCOUNT',
}

// Passed unchanged to GET /search, which accepts any entity the API puts in a form.
const AskFormSearchEntitySchema = createOpenEnumSchema(AskFormSearchEntity)

const AskFormActionSchema = Schema.Enums(AskFormAction)

const AskFormCategoryScopeSchema = Schema.Enums(AskFormCategoryScope)

const optionalBoolean = Schema.optionalWith(Schema.Boolean, { default: () => false, nullable: true })

const createStepSchema = <Option extends Schema.Schema.Any, Identity extends Schema.Struct.Fields>(
  optionSchema: Option,
  identity: Identity,
) => {
  const options = Schema.optionalWith(Schema.Array(optionSchema), { default: () => [], nullable: true })
  const prompt = Schema.NullishOr(Schema.String)
  const placeholder = Schema.NullishOr(Schema.String)

  return Schema.Union(
    Schema.Struct({
      ...identity,
      type: Schema.Literal(AskFormStepType.Choice),
      prompt,
      options,
      autoAdvance: pipe(optionalBoolean, Schema.fromKey('auto_advance')),
    }),
    Schema.Struct({
      ...identity,
      type: Schema.Literal(AskFormStepType.Search, AskFormStepType.SearchWithFreeform),
      prompt,
      entity: AskFormSearchEntitySchema,
      options,
      placeholder,
    }),
    Schema.Struct({
      ...identity,
      type: Schema.Literal(AskFormStepType.Category),
      prompt,
      options,
      search: optionalBoolean,
      scope: Schema.optionalWith(AskFormCategoryScopeSchema, { default: () => AskFormCategoryScope.Task, nullable: true }),
    }),
    Schema.Struct({
      ...identity,
      type: Schema.Literal(AskFormStepType.Text),
      prompt,
      placeholder,
      multiline: optionalBoolean,
      required: Schema.optionalWith(Schema.Boolean, { default: () => true, nullable: true }),
    }),
    Schema.Struct({
      ...identity,
      type: Schema.Literal(AskFormStepType.Action),
      prompt,
      action: AskFormActionSchema,
    }),
    Schema.Struct({
      ...identity,
      type: Schema.Literal(AskFormStepType.Upload),
      prompt,
      accept: Schema.optionalWith(Schema.Array(Schema.String), { default: () => [], nullable: true }),
      multiple: optionalBoolean,
    }),
  )
}

const AskFormFollowUpOptionSchema = Schema.Struct({
  value: Schema.String,
  label: Schema.String,
})

export const AskFormFollowUpSchema = createStepSchema(AskFormFollowUpOptionSchema, {})

export type AskFormFollowUp = typeof AskFormFollowUpSchema.Type

export const AskFormOptionSchema = Schema.Struct({
  value: Schema.String,
  label: Schema.String,
  next: Schema.optional(Schema.NullishOr(AskFormNextSchema)),
  followUp: pipe(
    Schema.optional(Schema.NullishOr(AskFormFollowUpSchema)),
    Schema.fromKey('follow_up'),
  ),
})

export type AskFormOption = typeof AskFormOptionSchema.Type

export const AskFormStepSchema = createStepSchema(AskFormOptionSchema, { id: Schema.String })

export type AskFormStep = typeof AskFormStepSchema.Type
export type AskFormStepEncoded = typeof AskFormStepSchema.Encoded
