import { pipe, Schema } from 'effect'

import { PreviewCellSchema, type PreviewCsv, PreviewRowSchema } from '@schemas/csvUpload'
import type { CustomAccountTransactionRow, RawCustomTransaction } from '@schemas/customAccounts'
import { postWithFormData } from '@utils/api/authenticatedHttp'
import { CUSTOM_ACCOUNTS_TAG_KEY } from '@hooks/api/businesses/[business-id]/custom-accounts/useCustomAccounts'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

type CustomAccountParseCsvArgs = {
  file: File
  customAccountId: string
}

const TransactionPreviewRowSchema = PreviewRowSchema({
  date: PreviewCellSchema(Schema.String),
  description: PreviewCellSchema(Schema.String),
  amount: Schema.NullishOr(PreviewCellSchema(Schema.Number)),
  externalId: pipe(
    Schema.propertySignature(Schema.NullishOr(PreviewCellSchema(Schema.String))),
    Schema.fromKey('external_id'),
  ),
  referenceNumber: pipe(
    Schema.propertySignature(Schema.NullishOr(PreviewCellSchema(Schema.String))),
    Schema.fromKey('reference_number'),
  ),
})

/**
 * The full parse-csv response is validated. `newTransactionsRequest` is a
 * server-built request body that is forwarded verbatim (snake_case) to the
 * create-transactions endpoint, so only its outer `{ transactions: [...] }`
 * shape is validated while the inner transaction objects are left opaque. It
 * is null when the uploaded CSV is invalid (no request to build).
 */
const ParseCsvResponseSchema = Schema.Struct({
  isValid: pipe(
    Schema.propertySignature(Schema.Boolean),
    Schema.fromKey('is_valid'),
  ),
  newTransactionsPreview: pipe(
    Schema.propertySignature(Schema.Array(TransactionPreviewRowSchema)),
    Schema.fromKey('new_transactions_preview'),
  ),
  newTransactionsRequest: pipe(
    Schema.propertySignature(
      Schema.NullishOr(Schema.Struct({ transactions: Schema.Array(Schema.Unknown) })),
    ),
    Schema.fromKey('new_transactions_request'),
  ),
  invalidTransactionsCount: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('invalid_transactions_count'),
  ),
  totalTransactionsCount: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('total_transactions_count'),
  ),
})

const ParseCsvReturnSchema = Schema.Struct({
  data: ParseCsvResponseSchema,
})

export type CustomAccountParseCsvResponse = {
  isValid: boolean
  newTransactionsRequest: { transactions: RawCustomTransaction[] }
  newTransactionsPreview: PreviewCsv<CustomAccountTransactionRow>
  invalidTransactionsCount: number
  totalTransactionsCount: number
}

type ParseCsvParams = {
  businessId: string
  customAccountId: string
}

type ParseCsvBody = {
  file: File
}

const parseCsv = (
  baseUrl: string,
  accessToken: string | undefined,
  options?: { params?: ParseCsvParams, body?: ParseCsvBody },
) => {
  const { businessId, customAccountId } = options?.params ?? ({} as ParseCsvParams)
  const { file } = options?.body ?? ({} as ParseCsvBody)

  const formData = new FormData()
  formData.append('file', file)

  const endpoint = `/v1/businesses/${businessId}/custom-accounts/${customAccountId}/parse-csv`
  return postWithFormData<typeof ParseCsvReturnSchema.Encoded>(
    endpoint,
    formData,
    baseUrl,
    accessToken,
  )
}

export const useCustomAccountParseCsv = createMutationHook({
  tags: [`${CUSTOM_ACCOUNTS_TAG_KEY}:parse-csv`],
  request: parseCsv,
  argToParams: ({ customAccountId }: CustomAccountParseCsvArgs) => ({ customAccountId }),
  argToBody: ({ file }: CustomAccountParseCsvArgs) => ({ file }),
  schema: ParseCsvReturnSchema,
  select: ({ data }): CustomAccountParseCsvResponse => ({
    isValid: data.isValid,
    newTransactionsPreview: data.newTransactionsPreview,
    newTransactionsRequest: data.newTransactionsRequest as { transactions: RawCustomTransaction[] },
    invalidTransactionsCount: data.invalidTransactionsCount,
    totalTransactionsCount: data.totalTransactionsCount,
  }),
})
