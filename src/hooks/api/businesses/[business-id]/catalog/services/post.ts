import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { CatalogServiceSchema, type CreateCatalogServiceEncoded } from '@schemas/features/timeTracking/catalogService'
import { post } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { useCatalogServicesGlobalCacheActions } from '@api/businesses/[business-id]/catalog/services/get'

const CREATE_CATALOG_SERVICE_TAG_KEY = '#create-catalog-service'

type CreateCatalogServiceBody = CreateCatalogServiceEncoded

const CreateCatalogServiceResponseSchema = UnwrappedDataResponseSchema(CatalogServiceSchema)

const createCatalogService = post<
  typeof CreateCatalogServiceResponseSchema.Encoded,
  CreateCatalogServiceBody,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/catalog/services`)

export const usePostCatalogService = createMutationHook({
  tags: [CREATE_CATALOG_SERVICE_TAG_KEY],
  request: createCatalogService,
  schema: CreateCatalogServiceResponseSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const { forceReload: forceReloadCatalogServices } = useCatalogServicesGlobalCacheActions()

    return () => {
      void forceReloadCatalogServices()
    }
  },
})
