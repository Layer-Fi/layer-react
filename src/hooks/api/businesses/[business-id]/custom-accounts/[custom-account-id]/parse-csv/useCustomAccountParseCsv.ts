import { pipe, Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { PreviewCellSchema, type PreviewCsv, PreviewRowSchema } from '@schemas/csvUpload'
import type { CustomAccountTransactionRow, RawCustomTransaction } from '@schemas/customAccounts'
import { type APIError } from '@utils/api/apiError'
import { postWithFormData } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { CUSTOM_ACCOUNTS_TAG_KEY } from '@hooks/api/businesses/[business-id]/custom-accounts/useCustomAccounts'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

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

export type CustomAccountParseCsvResponse = {
  isValid: boolean
  newTransactionsRequest: { transactions: RawCustomTransaction[] }
  newTransactionsPreview: PreviewCsv<CustomAccountTransactionRow>
  invalidTransactionsCount: number
  totalTransactionsCount: number
}

const buildKey = createBuildKey<{ businessId: string }>([`${CUSTOM_ACCOUNTS_TAG_KEY}:parse-csv`])

const parseCsv = (baseUrl: string, accessToken: string, {
  businessId,
  customAccountId,
  file,
}: {
  businessId: string
  customAccountId: string
  file: File
}) => {
  const formData = new FormData()
  formData.append('file', file)

  const endpoint = `/v1/businesses/${businessId}/custom-accounts/${customAccountId}/parse-csv`
  return postWithFormData<
    { data: typeof ParseCsvResponseSchema.Encoded }
  >(
    endpoint,
    formData,
    baseUrl,
    accessToken,
  )
}

export function useCustomAccountParseCsv() {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  return useSWRMutation<
    CustomAccountParseCsvResponse,
    APIError,
    () => ReturnType<typeof buildKey>,
    CustomAccountParseCsvArgs
  >
      (
      () => withLocale(buildKey({
        ...auth,
        businessId,
      })),
      (
        { accessToken, apiUrl, businessId },
        { arg: { customAccountId, file } }: { arg: CustomAccountParseCsvArgs },
      ) => parseCsv(
        apiUrl,
        accessToken,
        {
          businessId,
          customAccountId,
          file,
        },
      )
        .then(({ data }) => Schema.decodeUnknownPromise(ParseCsvResponseSchema)(data))
        .then(decoded => ({
          isValid: decoded.isValid,
          newTransactionsPreview: decoded.newTransactionsPreview,
          newTransactionsRequest: decoded.newTransactionsRequest as { transactions: RawCustomTransaction[] },
          invalidTransactionsCount: decoded.invalidTransactionsCount,
          totalTransactionsCount: decoded.totalTransactionsCount,
        })),
      {
        revalidate: false,
      },
      )
}
