import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { CatalogServiceSchema, type UpdateCatalogServiceEncoded } from '@schemas/features/timeTracking/catalogService'
import { patch } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { useCatalogServicesGlobalCacheActions } from '@api/businesses/[business-id]/catalog/services/get'

const UPDATE_CATALOG_SERVICE_TAG_KEY = '#update-catalog-service'

type UpdateCatalogServiceBody = UpdateCatalogServiceEncoded

const UpdateCatalogServiceResponseSchema = UnwrappedDataResponseSchema(CatalogServiceSchema)

const updateCatalogService = patch<
  typeof UpdateCatalogServiceResponseSchema.Encoded,
  UpdateCatalogServiceBody,
  { businessId: string, serviceId: string }
>(({ businessId, serviceId }) => `/v1/businesses/${businessId}/catalog/services/${serviceId}`)

export const usePatchCatalogService = createMutationHook({
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
