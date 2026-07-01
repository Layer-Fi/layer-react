import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import type { Awaitable } from '@internal-types/utility/promises'
import { S3PresignedUrlSchema, type S3PresignedUrlSchemaType } from '@schemas/common/s3PresignedUrl'
import { get } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

const getInvoicePdf = get<
  { data: S3PresignedUrlSchemaType },
  { businessId: string, invoiceId: string }
>(
  ({ businessId, invoiceId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}/pdf`,
)

const DOWNLOAD_INVOICE_PDF_TAG_KEY = '#download-invoice-pdf'

const InvoicePdfReturnSchema = Schema.Struct({
  data: S3PresignedUrlSchema,
})

const buildKey = createBuildKey<{ businessId: string, invoiceId: string }>([DOWNLOAD_INVOICE_PDF_TAG_KEY])

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
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const rawMutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...auth,
      businessId,
      invoiceId,
    })),
    ({ accessToken, apiUrl, businessId, invoiceId }) => getInvoicePdf(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          invoiceId,
        },
      },
    )()
      .then(Schema.decodeUnknownPromise(InvoicePdfReturnSchema))
      .then(async ({ data }) => {
        if (onSuccess) {
          await onSuccess(data)
        }
        return data
      }),
    {
      revalidate: false,
      throwOnError: false,
      onError,
    },
  )

  const mutationResponse = new SWRMutationResult(rawMutationResponse)
  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => originalTrigger(...triggerParameters),
    [originalTrigger],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
