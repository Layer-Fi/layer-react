import { TimeEntrySchema, type UpsertTimeEntryEncoded } from '@schemas/timeTracking'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { patch, post } from '@utils/api/authenticatedHttp'
import type { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { useTimeTrackingSummaryGlobalCacheActions } from '@hooks/api/businesses/[business-id]/time-tracking/summary/useTimeTrackingSummary'
import { useTimeEntriesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/time-tracking/time-entries/useListTimeEntries'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const UPSERT_TIME_ENTRY_TAG_KEY = '#upsert-time-entry'

export enum UpsertTimeEntryMode {
  Create = 'Create',
  Update = 'Update',
}

type CreateTimeEntryBody = UpsertTimeEntryEncoded
type UpdateTimeEntryBody = Partial<UpsertTimeEntryEncoded>
type UpsertTimeEntryBody = CreateTimeEntryBody | UpdateTimeEntryBody

const UpsertTimeEntryReturnSchema = UnwrappedDataResponseSchema(TimeEntrySchema)

type UpsertTimeEntryReturn = typeof UpsertTimeEntryReturnSchema.Type
type UpsertTimeEntryReturnEncoded = typeof UpsertTimeEntryReturnSchema.Encoded

const createTimeEntry = post<UpsertTimeEntryReturnEncoded, CreateTimeEntryBody>(
  ({ businessId }) => `/v1/businesses/${businessId}/time-tracking/time-entries`,
)

const updateTimeEntry = patch<
  UpsertTimeEntryReturnEncoded,
  UpdateTimeEntryBody,
  { businessId: string, timeEntryId: string }
>(
  ({ businessId, timeEntryId }) => `/v1/businesses/${businessId}/time-tracking/time-entries/${timeEntryId}`,
)

const useCreateTimeEntry = createMutationHook({
  tags: [UPSERT_TIME_ENTRY_TAG_KEY],
  request: createTimeEntry,
  schema: UpsertTimeEntryReturnSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const { forceReload: forceReloadTimeEntries } = useTimeEntriesGlobalCacheActions()
    const { invalidate: invalidateTimeTrackingSummary } = useTimeTrackingSummaryGlobalCacheActions()

    return () => {
      void forceReloadTimeEntries()
      void invalidateTimeTrackingSummary()
    }
  },
})

const useUpdateTimeEntry = createMutationHook({
  tags: [UPSERT_TIME_ENTRY_TAG_KEY],
  request: updateTimeEntry,
  keyParams: ['timeEntryId'],
  schema: UpsertTimeEntryReturnSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const { patchByKey: patchTimeEntryByKey } = useTimeEntriesGlobalCacheActions()
    const { invalidate: invalidateTimeTrackingSummary } = useTimeTrackingSummaryGlobalCacheActions()

    return (data) => {
      void patchTimeEntryByKey(data)
      void invalidateTimeTrackingSummary()
    }
  },
})

type UseUpsertTimeEntryCreateProps = { mode: UpsertTimeEntryMode.Create }
type UseUpsertTimeEntryUpdateProps = { mode: UpsertTimeEntryMode.Update, timeEntryId: string }
type UseUpsertTimeEntryProps = UseUpsertTimeEntryCreateProps | UseUpsertTimeEntryUpdateProps

export function useUpsertTimeEntry(props: UseUpsertTimeEntryCreateProps): SWRMutationResult<UpsertTimeEntryReturn, CreateTimeEntryBody>
export function useUpsertTimeEntry(props: UseUpsertTimeEntryUpdateProps): SWRMutationResult<UpsertTimeEntryReturn, UpdateTimeEntryBody>
export function useUpsertTimeEntry(props: UseUpsertTimeEntryProps): SWRMutationResult<UpsertTimeEntryReturn, UpsertTimeEntryBody>
export function useUpsertTimeEntry(props: UseUpsertTimeEntryProps) {
  const { mode } = props
  const timeEntryId = mode === UpsertTimeEntryMode.Update ? props.timeEntryId : undefined

  const createResponse = useCreateTimeEntry()
  const updateResponse = useUpdateTimeEntry({
    timeEntryId: timeEntryId ?? '',
  })

  if (mode === UpsertTimeEntryMode.Create) {
    return createResponse
  }

  return updateResponse
}
