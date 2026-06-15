import { pipe, Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import type { CustomAccountTransactionRow, RawCustomTransaction } from '@schemas/customAccounts'
import { type APIError } from '@utils/api/apiError'
import { postWithFormData } from '@utils/api/authenticatedHttp'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { CUSTOM_ACCOUNTS_TAG_KEY } from '@hooks/api/businesses/[business-id]/custom-accounts/useCustomAccounts'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import type { PreviewCsv } from '@components/CsvUpload/types'

type CustomAccountParseCsvArgs = {
  file: File
  customAccountId: string
}

const PreviewCellSchema = <Value extends Schema.Schema.Any>(parsed: Value) =>
  Schema.Struct({
    raw: Schema.String,
    parsed,
    isValid: pipe(
      Schema.propertySignature(Schema.Boolean),
      Schema.fromKey('is_valid'),
    ),
  })

const PreviewRowSchema = Schema.Struct({
  date: PreviewCellSchema(Schema.String),
  description: PreviewCellSchema(Schema.String),
  amount: PreviewCellSchema(Schema.Number),
  externalId: Schema.optional(PreviewCellSchema(Schema.NullOr(Schema.String))).pipe(
    Schema.fromKey('external_id'),
  ),
  referenceNumber: Schema.optional(PreviewCellSchema(Schema.NullOr(Schema.String))).pipe(
    Schema.fromKey('reference_number'),
  ),
  row: Schema.Number,
  isValid: pipe(
    Schema.propertySignature(Schema.Boolean),
    Schema.fromKey('is_valid'),
  ),
})

/**
 * The full parse-csv response is validated, except `newTransactionsRequest`,
 * which is a server-built request body that is forwarded verbatim (snake_case)
 * to the create-transactions endpoint, so it is left as an opaque passthrough.
 */
const ParseCsvResponseSchema = Schema.Struct({
  isValid: pipe(
    Schema.propertySignature(Schema.Boolean),
    Schema.fromKey('is_valid'),
  ),
  newTransactionsPreview: pipe(
    Schema.propertySignature(Schema.Array(PreviewRowSchema)),
    Schema.fromKey('new_transactions_preview'),
  ),
  newTransactionsRequest: pipe(
    Schema.propertySignature(Schema.Unknown),
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

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      tags: [`${CUSTOM_ACCOUNTS_TAG_KEY}:parse-csv`],
    } as const
  }
}

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
  const withLocale = useLocalizedKey()
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  return useSWRMutation<
    CustomAccountParseCsvResponse,
    APIError,
    () => ReturnType<typeof buildKey>,
    CustomAccountParseCsvArgs
  >
      (
      () => withLocale(buildKey({
        ...data,
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
