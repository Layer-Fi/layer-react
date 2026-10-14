import { Schema } from 'effect'

export enum PlaidLinkClientOutcome {
  Completed = 'COMPLETED',
  Exited = 'EXITED',
  Error = 'ERROR',
}

export const ReportPlaidLinkOutcomeParamsSchema = Schema.Struct({
  outcome: Schema.Enums(PlaidLinkClientOutcome),

  errorCode: Schema.optional(Schema.String).pipe(
    Schema.fromKey('error_code'),
  ),
})

export type ReportPlaidLinkOutcomeParams = typeof ReportPlaidLinkOutcomeParamsSchema.Type
export type ReportPlaidLinkOutcomeParamsEncoded = typeof ReportPlaidLinkOutcomeParamsSchema.Encoded

export const encodeReportPlaidLinkOutcomeParams = Schema.encodeSync(ReportPlaidLinkOutcomeParamsSchema)
