import { CatalogServiceSchema, type UpdateCatalogServiceEncoded } from '@schemas/catalogService'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { patch } from '@utils/api/authenticatedHttp'
import { useCatalogServicesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/catalog/services/useListCatalogServices'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const UPDATE_CATALOG_SERVICE_TAG_KEY = '#update-catalog-service'

type UpdateCatalogServiceBody = UpdateCatalogServiceEncoded

const UpdateCatalogServiceResponseSchema = UnwrappedDataResponseSchema(CatalogServiceSchema)

const updateCatalogService = patch<
  typeof UpdateCatalogServiceResponseSchema.Encoded,
  UpdateCatalogServiceBody,
  { businessId: string, serviceId: string }
>(({ businessId, serviceId }) => `/v1/businesses/${businessId}/catalog/services/${serviceId}`)

export const useUpdateCatalogService = createMutationHook({
  tags: [UPDATE_CATALOG_SERVICE_TAG_KEY],
  request: updateCatalogService,
  keyParams: ['serviceId'],
  schema: UpdateCatalogServiceResponseSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const { patchByKey: patchCatalogServiceByKey } = useCatalogServicesGlobalCacheActions()
    return (data) => {
      void patchCatalogServiceByKey(data)
    }
  },
})
