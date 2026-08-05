import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { CatalogServiceSchema } from '@schemas/features/timeTracking/catalogService'
import { post } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { useCatalogServicesGlobalCacheActions } from '@api/businesses/[business-id]/catalog/services/get'

const REACTIVATE_CATALOG_SERVICE_TAG_KEY = '#reactivate-catalog-service'

const ReactivateCatalogServiceResponseSchema = UnwrappedDataResponseSchema(CatalogServiceSchema)

const reactivateCatalogService = post<
  typeof ReactivateCatalogServiceResponseSchema.Encoded,
  Record<string, unknown>,
  { businessId: string, serviceId: string }
>(
  ({ businessId, serviceId }) =>
    `/v1/businesses/${businessId}/catalog/services/${serviceId}/reactivate`,
)

export const usePostReactivateCatalogService = createMutationHook({
  tags: [REACTIVATE_CATALOG_SERVICE_TAG_KEY],
  request: reactivateCatalogService,
  keyParams: ['serviceId'],
  argToBody: (_arg: never) => undefined,
  schema: ReactivateCatalogServiceResponseSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const { forceReload: forceReloadCatalogServices } = useCatalogServicesGlobalCacheActions()

    return () => {
      void forceReloadCatalogServices()
    }
  },
})
