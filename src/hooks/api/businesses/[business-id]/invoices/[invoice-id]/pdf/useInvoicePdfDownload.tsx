import type { Awaitable } from '@internal-types/utility/promises'
import { S3PresignedUrlSchema, type S3PresignedUrlSchemaType } from '@schemas/common/s3PresignedUrl'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { get } from '@utils/api/authenticatedHttp'
import { getAsMutation } from '@utils/api/getAsMutation'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const InvoicePdfReturnSchema = UnwrappedDataResponseSchema(S3PresignedUrlSchema)

type GetInvoicePdfParams = {
  businessId: string
  invoiceId: string
}

const getInvoicePdf = get<
  typeof InvoicePdfReturnSchema.Encoded,
  GetInvoicePdfParams
>(
  ({ businessId, invoiceId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}/pdf`,
)

const requestInvoicePdf = getAsMutation(getInvoicePdf)

const DOWNLOAD_INVOICE_PDF_TAG_KEY = '#download-invoice-pdf'

const useInvoicePdfDownloadMutation = createMutationHook({
  tags: [DOWNLOAD_INVOICE_PDF_TAG_KEY],
  request: requestInvoicePdf,
  keyParamNames: ['invoiceId'],
  argToBody: (_arg: undefined) => undefined,
  schema: InvoicePdfReturnSchema,
  swrOptions: { throwOnError: false },
})

type UseInvoicePdfDownloadProps = {
  invoiceId: string
  onSuccess?: (url: S3PresignedUrlSchemaType) => Awaitable<unknown>
  onError?: () => void
}

export function useInvoicePdfDownload({
  invoiceId,
  onSuccess,
  onError,
}: UseInvoicePdfDownloadProps) {
  return useInvoicePdfDownloadMutation({
    invoiceId,
    swrOptions: {
      onSuccess: (data) => { void onSuccess?.(data) },
      onError,
    },
  })
}
