import { useCallback } from 'react'
import { Schema } from 'effect/index'
import useSWRMutation from 'swr/mutation'

import { post } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const DELETE_UPLOAD_TAG = 'delete-upload'

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
      tags: [DELETE_UPLOAD_TAG],
    }
  }
}

const DeleteUploadReturnSchema = Schema.Struct({
  data: Schema.Struct({
    id: Schema.String,
    archived_at: Schema.NullOr(Schema.String),
  }),
})

type DeleteUploadReturn = typeof DeleteUploadReturnSchema.Type

export const deleteUpload = post<DeleteUploadReturn>(
  ({ businessId, uploadId }) =>
    `/v1/businesses/${businessId}/transaction-uploads/${uploadId}/archive`,
)

export function useDeleteUpload(onSuccess?: () => void) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  const mutationResponse = useSWRMutation(
    () => buildKey({
      access_token: auth?.access_token,
      apiUrl: auth?.apiUrl,
      businessId,
    }),
    (
      { accessToken, apiUrl, businessId },
      { arg: uploadId }: { arg: string },
    ) => deleteUpload(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          uploadId,
        },
      },
    ).then(Schema.decodeUnknownPromise(DeleteUploadReturnSchema)),
    {
      revalidate: false,
    },
  )

  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResultPromise = originalTrigger(...triggerParameters)
      await triggerResultPromise
      if (onSuccess) {
        onSuccess()
      }
      return triggerResultPromise
    }, [onSuccess, originalTrigger],
  )

  return new Proxy(mutationResponse, {
    get(target, prop) {
      if (prop === 'trigger') {
        return stableProxiedTrigger
      }

      return Reflect.get(target, prop)
    },
  })
}
