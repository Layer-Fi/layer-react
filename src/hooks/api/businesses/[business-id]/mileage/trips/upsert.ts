import { type UpdateParams, usePatchTrip } from '@api/businesses/[business-id]/mileage/trips/[trip-id]/patch'
import { type CreateParams, usePostTrip } from '@api/businesses/[business-id]/mileage/trips/post'

export type UpsertParams = CreateParams | UpdateParams

export enum UpsertTripMode {
  Create = 'Create',
  Update = 'Update',
}

type UseUpsertTripProps =
  | { mode: UpsertTripMode.Create }
  | { mode: UpsertTripMode.Update, tripId: string }

export const useUpsertTrip = (props: UseUpsertTripProps) => {
  const { mode } = props
  const tripId = mode === UpsertTripMode.Update ? props.tripId : undefined

  const createResponse = usePostTrip()
  const updateResponse = usePatchTrip({
    tripId: tripId ?? '',
  })

  return mode === UpsertTripMode.Create ? createResponse : updateResponse
}
