import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { CatalogServiceSchema } from '@schemas/features/timeTracking/catalogService'
import { post } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { useCatalogServicesGlobalCacheActions } from '@api/businesses/[business-id]/catalog/services/get'

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

export const usePostArchiveCatalogService = createMutationHook({
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
