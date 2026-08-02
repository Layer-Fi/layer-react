import { type UpdateParams, usePatchTrip } from '@api/businesses/[business-id]/mileage/trips/[trip-id]/patch'
import { type CreateParams, usePostTrip } from '@api/businesses/[business-id]/mileage/trips/post'
import { createUpsertHook } from '@hooks/utils/swr/createUpsertHook'

export type UpsertParams = CreateParams | UpdateParams

export const useUpsertTrip = createUpsertHook({
  useCreate: usePostTrip,
  useUpdate: usePatchTrip,
  toCreateOptions: () => undefined,
  toUpdateOptions: (props: { tripId: string }) => ({ tripId: props.tripId }),
})
