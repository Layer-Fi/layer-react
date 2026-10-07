import { pipe, Schema } from 'effect'

import { createOpenEnumSchema } from '@schemas/common/utils'
import { BaseBusinessTaskSchema } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import { AskFormSchema } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import { AskFormAnswersSchema } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormAnswer'

export const UNIFIED_ASK_FORM_TASK_TYPE = 'UNIFIED_ASK_FORM'

/** The `form_version` this client renders. The API serves every ask and human task unified at or above it. */
export const UNIFIED_ASK_FORM_VERSION = 1

export enum AskFormSubtype {
  Counterparty = 'COUNTERPARTY',
  P2PCounterparty = 'P2P_COUNTERPARTY',
  AccountMask = 'ACCOUNT_MASK',
  FreeResponse = 'FREE_RESPONSE',
  UploadDocument = 'UPLOAD_DOCUMENT',
}

export enum AskFormResolutionKind {
  ResolvedByTask = 'RESOLVED_BY_TASK',
}

const AskFormTransactionSchema = Schema.Struct({
  id: Schema.String,
  date: Schema.Date,
  /** Signed cents: negative is money out. */
  amount: Schema.Number,
  description: Schema.NullishOr(Schema.String),
})

export type AskFormTransaction = typeof AskFormTransactionSchema.Type

const AskFormResolutionSchema = Schema.Struct({
  kind: createOpenEnumSchema(AskFormResolutionKind),
  taskId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('task_id'),
  ),
})

export const UnifiedAskFormTaskSchema = Schema.extend(
  BaseBusinessTaskSchema,
  Schema.Struct({
    taskType: pipe(
      Schema.propertySignature(Schema.Literal(UNIFIED_ASK_FORM_TASK_TYPE)),
      Schema.fromKey('task_type'),
    ),
    formSubtype: pipe(
      Schema.propertySignature(createOpenEnumSchema(AskFormSubtype)),
      Schema.fromKey('form_subtype'),
    ),
    transactions: Schema.optionalWith(Schema.Array(AskFormTransactionSchema), {
      default: () => [],
      nullable: true,
    }),
    form: AskFormSchema,
    answers: Schema.NullishOr(AskFormAnswersSchema),
    answerSummary: pipe(
      Schema.propertySignature(Schema.NullishOr(Schema.String)),
      Schema.fromKey('answer_summary'),
    ),
    resolution: Schema.NullishOr(AskFormResolutionSchema),
  }),
)

export type UnifiedAskFormTask = typeof UnifiedAskFormTaskSchema.Type
export type UnifiedAskFormTaskEncoded = typeof UnifiedAskFormTaskSchema.Encoded
