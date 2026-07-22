import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { type UpsertVendorEncoded, VendorSchema } from '@schemas/vendor'
import { patch, post } from '@utils/api/authenticatedHttp'
import { useVendorsGlobalCacheActions, VENDORS_TAG_KEY } from '@hooks/api/businesses/[business-id]/vendors/useListVendors'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const UPSERT_VENDOR_TAG_KEY = '#upsert-vendor'

export enum UpsertVendorMode {
  Create = 'Create',
  Update = 'Update',
}

type UpsertVendorBody = UpsertVendorEncoded

const UpsertVendorReturnSchema = UnwrappedDataResponseSchema(VendorSchema)

type UpsertVendorReturnEncoded = typeof UpsertVendorReturnSchema.Encoded

const createVendor = post<UpsertVendorReturnEncoded, UpsertVendorBody>(
  ({ businessId }) => `/v1/businesses/${businessId}/vendors`,
)

const updateVendor = patch<
  UpsertVendorReturnEncoded,
  UpsertVendorBody,
  { businessId: string, vendorId: string }
>(({ businessId, vendorId }) => `/v1/businesses/${businessId}/vendors/${vendorId}`)

const useCreateVendor = createMutationHook({
  tags: [UPSERT_VENDOR_TAG_KEY, VENDORS_TAG_KEY],
  request: createVendor,
  schema: UpsertVendorReturnSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const { forceReload: forceReloadVendors } = useVendorsGlobalCacheActions()

    return () => {
      void forceReloadVendors()
    }
  },
})

const useUpdateVendor = createMutationHook({
  tags: [UPSERT_VENDOR_TAG_KEY, VENDORS_TAG_KEY],
  request: updateVendor,
  keyParams: ['vendorId'],
  schema: UpsertVendorReturnSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const { patchByKey: patchVendorByKey } = useVendorsGlobalCacheActions()

    return (data) => {
      void patchVendorByKey(data)
    }
  },
})

type UseUpsertVendorProps =
  | { mode: UpsertVendorMode.Create }
  | { mode: UpsertVendorMode.Update, vendorId: string }

export const useUpsertVendor = (props: UseUpsertVendorProps) => {
  const { mode } = props
  const vendorId = mode === UpsertVendorMode.Update ? props.vendorId : undefined

  const createResponse = useCreateVendor()
  const updateResponse = useUpdateVendor({
    vendorId: vendorId ?? '',
  })

  return mode === UpsertVendorMode.Create ? createResponse : updateResponse
}
