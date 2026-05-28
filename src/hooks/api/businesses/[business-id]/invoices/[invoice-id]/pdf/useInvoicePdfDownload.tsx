import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import type { Awaitable } from '@internal-types/utility/promises'
import { S3PresignedUrlSchema, type S3PresignedUrlSchemaType } from '@schemas/common/s3PresignedUrl'
import { get } from '@utils/api/authenticatedHttp'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

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

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  invoiceId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  invoiceId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      invoiceId,
      tags: [DOWNLOAD_INVOICE_PDF_TAG_KEY],
    } as const
  }
}

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
  const withLocale = useLocalizedKey()
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const rawMutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...data,
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

  return new Proxy(mutationResponse, {
    get(target, prop) {
      if (prop === 'trigger') {
        return stableProxiedTrigger
      }

      return Reflect.get(target, prop) as unknown
    },
  })
}
