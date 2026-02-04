import { useCallback } from 'react'
import { Schema } from 'effect'
import type { Key } from 'swr'
import { useSWRConfig } from 'swr'
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation'

import { withSWRKeyTags } from '@utils/swr/withSWRKeyTags'
import { put } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import {
  type InvoicePaymentMethodsResponse,
  InvoicePaymentMethodsResponseSchema,
  type InvoicePaymentMethodType,
} from '@features/invoices/invoicePaymentMethodSchemas'

import { INVOICE_PAYMENT_METHODS_TAG_KEY } from './useInvoicePaymentMethods'

type UpdateInvoicePaymentMethodsBody = {
  payment_methods: InvoicePaymentMethodType[]
}

const UPDATE_INVOICE_PAYMENT_METHODS_TAG_KEY = '#update-invoice-payment-methods'

export const updateInvoicePaymentMethods = put<
  InvoicePaymentMethodsResponse,
  UpdateInvoicePaymentMethodsBody,
  { businessId: string, invoiceId: string }
>(({ businessId, invoiceId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}/payment-methods`)

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
      tags: [UPDATE_INVOICE_PAYMENT_METHODS_TAG_KEY],
    } as const
  }
}

type UpdateInvoicePaymentMethodsSWRMutationResponse =
    SWRMutationResponse<InvoicePaymentMethodsResponse, unknown, Key, UpdateInvoicePaymentMethodsBody>

class UpdateInvoicePaymentMethodsSWRResponse {
  private swrResponse: UpdateInvoicePaymentMethodsSWRMutationResponse

  constructor(swrResponse: UpdateInvoicePaymentMethodsSWRMutationResponse) {
    this.swrResponse = swrResponse
  }

  get data() {
    return this.swrResponse.data
  }

  get trigger() {
    return this.swrResponse.trigger
  }

  get isMutating() {
    return this.swrResponse.isMutating
  }

  get isError() {
    return this.swrResponse.error !== undefined
  }
}

type UseUpdatePaymentMethodsProps = {
  invoiceId: string
}

export function useUpdatePaymentMethods({ invoiceId }: UseUpdatePaymentMethodsProps) {
  const { data } = useAuth()
  const { businessId } = useLayerContext()
  const { mutate } = useSWRConfig()

  const rawMutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
      invoiceId,
    }),
    (
      { accessToken, apiUrl, businessId, invoiceId },
      { arg: body }: { arg: UpdateInvoicePaymentMethodsBody },
    ) => updateInvoicePaymentMethods(
      apiUrl,
      accessToken,
      {
        params: { businessId, invoiceId },
        body,
      },
    ).then(Schema.decodeUnknownPromise(InvoicePaymentMethodsResponseSchema)),
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const mutationResponse = new UpdateInvoicePaymentMethodsSWRResponse(rawMutationResponse)

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void mutate(key => withSWRKeyTags(
        key,
        ({ tags }) => tags.includes(INVOICE_PAYMENT_METHODS_TAG_KEY),
      ))

      return triggerResult
    },
    [originalTrigger, mutate],
  )

  return new Proxy(mutationResponse, {
    get(target, prop) {
      if (prop === 'trigger') {
        return stableProxiedTrigger
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Reflect.get(target, prop)
    },
  })
}
