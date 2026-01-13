import { useCallback } from 'react'
import { Effect, Schema } from 'effect'
import type { Key } from 'swr'
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation'

import { CustomerSchema, type UpsertCustomerEncoded } from '@schemas/customer'
import { patch, post } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { CUSTOMERS_TAG_KEY, useCustomersGlobalCacheActions } from '@features/customers/api/useListCustomers'
import { useInvoicesGlobalCacheActions } from '@features/invoices/api/useListInvoices'

const UPSERT_CUSTOMER_TAG_KEY = '#upsert-customer'

export enum UpsertCustomerMode {
  Create = 'Create',
  Update = 'Update',
}

type UpsertCustomerBody = UpsertCustomerEncoded

const createCustomer = post<
  UpsertCustomerReturn,
  UpsertCustomerBody,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/customers`)

const updateCustomer = patch<
  UpsertCustomerReturn,
  UpsertCustomerBody,
  { businessId: string, customerId: string }
>(({ businessId, customerId }) => `/v1/businesses/${businessId}/customers/${customerId}`)

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  customerId = undefined,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  customerId?: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      customerId,
      tags: [UPSERT_CUSTOMER_TAG_KEY, CUSTOMERS_TAG_KEY],
    } as const
  }
}

const UpsertCustomerReturnSchema = Schema.Struct({
  data: CustomerSchema,
})
type UpsertCustomerReturn = typeof UpsertCustomerReturnSchema.Type

type UpsertCustomerSWRMutationResponse =
  SWRMutationResponse<UpsertCustomerReturn, unknown, Key, UpsertCustomerBody>

class UpsertCustomerSWRResponse {
  private swrResponse: UpsertCustomerSWRMutationResponse

  constructor(swrResponse: UpsertCustomerSWRMutationResponse) {
    this.swrResponse = swrResponse
  }

  get trigger() {
    return this.swrResponse.trigger
  }

  get isMutating() {
    return this.swrResponse.isMutating
  }

  get data() {
    return this.swrResponse.data
  }

  get error() {
    return this.swrResponse.error
  }
}

type RequestArgs = {
  apiUrl: string
  accessToken: string
  body: UpsertCustomerBody
}

const CreateParamsSchema = Schema.Struct({
  businessId: Schema.UUID,
  customerId: Schema.Undefined,
})

const UpdateParamsSchema = Schema.Struct({
  businessId: Schema.UUID,
  customerId: Schema.UUID,
})

type CreateParams = typeof CreateParamsSchema.Type
type UpdateParams = typeof UpdateParamsSchema.Type

type UpsertParams = CreateParams | UpdateParams

type UpsertRequestFn = (args: RequestArgs) => Promise<UpsertCustomerReturn>

const isParamsValidForMode = <M extends UpsertCustomerMode>(
  mode: M,
  params: unknown,
): params is M extends UpsertCustomerMode.Update ? UpdateParams : CreateParams => {
  if (mode === UpsertCustomerMode.Update) {
    return Effect.runSync(Effect.either(Schema.decodeUnknown(UpdateParamsSchema)(params)))._tag === 'Right'
  }

  if (mode === UpsertCustomerMode.Create) {
    return Effect.runSync(Effect.either(Schema.decodeUnknown(CreateParamsSchema)(params)))._tag === 'Right'
  }

  return false
}

function getRequestFn(
  mode: UpsertCustomerMode,
  params: UpsertParams,
): UpsertRequestFn {
  if (mode === UpsertCustomerMode.Update) {
    if (!isParamsValidForMode(UpsertCustomerMode.Update, params)) {
      throw new Error('Invalid params for update mode')
    }

    return ({ apiUrl, accessToken, body }: RequestArgs) =>
      updateCustomer(apiUrl, accessToken, { params, body })
  }
  else {
    if (!isParamsValidForMode(UpsertCustomerMode.Create, params)) {
      throw new Error('Invalid params for create mode')
    }

    return ({ apiUrl, accessToken, body }: RequestArgs) =>
      createCustomer(apiUrl, accessToken, { params, body })
  }
}

type UseUpsertCustomerProps =
  | { mode: UpsertCustomerMode.Create }
  | { mode: UpsertCustomerMode.Update, customerId: string }

export const useUpsertCustomer = (props: UseUpsertCustomerProps) => {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const { mode } = props
  const customerId = mode === UpsertCustomerMode.Update ? props.customerId : undefined

  const rawMutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
      customerId,
    }),
    (
      { accessToken, apiUrl, businessId, customerId },
      { arg: body }: { arg: UpsertCustomerBody },
    ) => {
      const request = getRequestFn(mode, { businessId, customerId })

      return request({
        apiUrl,
        accessToken,
        body,
      }).then(Schema.decodeUnknownPromise(UpsertCustomerReturnSchema))
    },
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const mutationResponse = new UpsertCustomerSWRResponse(rawMutationResponse)

  const { patchCustomerByKey, forceReloadCustomers } = useCustomersGlobalCacheActions()
  const { forceReloadInvoices } = useInvoicesGlobalCacheActions()

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      if (mode === UpsertCustomerMode.Update) {
        void patchCustomerByKey(triggerResult.data)
        void forceReloadInvoices()
      }
      else {
        void forceReloadCustomers()
      }

      return triggerResult
    },
    [originalTrigger, mode, patchCustomerByKey, forceReloadInvoices, forceReloadCustomers],
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
