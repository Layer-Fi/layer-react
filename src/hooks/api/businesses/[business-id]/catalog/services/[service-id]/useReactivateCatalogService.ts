import { CatalogServiceSchema } from '@schemas/catalogService'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { post } from '@utils/api/authenticatedHttp'
import { useCatalogServicesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/catalog/services/useListCatalogServices'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

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

export const useReactivateCatalogService = createMutationHook({
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
