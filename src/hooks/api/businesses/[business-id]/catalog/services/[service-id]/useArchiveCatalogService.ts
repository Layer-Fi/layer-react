import { CatalogServiceSchema } from '@schemas/catalogService'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { post } from '@utils/api/authenticatedHttp'
import { useCatalogServicesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/catalog/services/useListCatalogServices'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const ARCHIVE_CATALOG_SERVICE_TAG_KEY = '#archive-catalog-service'

const ArchiveCatalogServiceResponseSchema = UnwrappedDataResponseSchema(CatalogServiceSchema)

const archiveCatalogService = post<
  typeof ArchiveCatalogServiceResponseSchema.Encoded,
  Record<string, unknown>,
  { businessId: string, serviceId: string }
>(
  ({ businessId, serviceId }) =>
    `/v1/businesses/${businessId}/catalog/services/${serviceId}/archive`,
)

export const useArchiveCatalogService = createMutationHook({
  tags: [ARCHIVE_CATALOG_SERVICE_TAG_KEY],
  request: archiveCatalogService,
  keyParams: ['serviceId'],
  argToBody: (_arg: never) => undefined,
  schema: ArchiveCatalogServiceResponseSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const { forceReload: forceReloadCatalogServices } = useCatalogServicesGlobalCacheActions()

    return () => {
      void forceReloadCatalogServices()
    }
  },
})
