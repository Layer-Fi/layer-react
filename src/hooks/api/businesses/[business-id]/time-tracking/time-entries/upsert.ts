import { createUpsertHook } from '@hooks/utils/swr/createUpsertHook'
import { usePatchTimeEntry } from '@api/businesses/[business-id]/time-tracking/time-entries/[time-entry-id]/patch'
import { usePostTimeEntry } from '@api/businesses/[business-id]/time-tracking/time-entries/post'

export const useUpsertTimeEntry = createUpsertHook({
  useCreate: usePostTimeEntry,
  useUpdate: usePatchTimeEntry,
  toCreateOptions: () => undefined,
  toUpdateOptions: (props: { timeEntryId: string }) => ({ timeEntryId: props.timeEntryId }),
})
