import { CatalogServiceSchema, type CreateCatalogServiceEncoded } from '@schemas/catalogService'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { post } from '@utils/api/authenticatedHttp'
import { useCatalogServicesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/catalog/services/useListCatalogServices'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const CREATE_CATALOG_SERVICE_TAG_KEY = '#create-catalog-service'

type CreateCatalogServiceBody = CreateCatalogServiceEncoded

const CreateCatalogServiceResponseSchema = UnwrappedDataResponseSchema(CatalogServiceSchema)

const createCatalogService = post<
  typeof CreateCatalogServiceResponseSchema.Encoded,
  CreateCatalogServiceBody,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/catalog/services`)

export const useCreateCatalogService = createMutationHook({
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
