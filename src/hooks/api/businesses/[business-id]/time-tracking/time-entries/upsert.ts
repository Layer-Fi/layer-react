import type { SWRMutationResult } from '@internal-types/swr/SWRResponseTypes'
import { type UpdateTimeEntryBody, usePatchTimeEntry } from '@api/businesses/[business-id]/time-tracking/time-entries/[time-entry-id]/patch'
import { type CreateTimeEntryBody, type UpsertTimeEntryReturn, usePostTimeEntry } from '@api/businesses/[business-id]/time-tracking/time-entries/post'

export enum UpsertTimeEntryMode {
  Create = 'Create',
  Update = 'Update',
}

type UpsertTimeEntryBody = CreateTimeEntryBody | UpdateTimeEntryBody

type UseUpsertTimeEntryCreateProps = { mode: UpsertTimeEntryMode.Create }
type UseUpsertTimeEntryUpdateProps = { mode: UpsertTimeEntryMode.Update, timeEntryId: string }
type UseUpsertTimeEntryProps = UseUpsertTimeEntryCreateProps | UseUpsertTimeEntryUpdateProps

export function useUpsertTimeEntry(props: UseUpsertTimeEntryCreateProps): SWRMutationResult<UpsertTimeEntryReturn, CreateTimeEntryBody>
export function useUpsertTimeEntry(props: UseUpsertTimeEntryUpdateProps): SWRMutationResult<UpsertTimeEntryReturn, UpdateTimeEntryBody>
export function useUpsertTimeEntry(props: UseUpsertTimeEntryProps): SWRMutationResult<UpsertTimeEntryReturn, UpsertTimeEntryBody>
export function useUpsertTimeEntry(props: UseUpsertTimeEntryProps) {
  const { mode } = props
  const timeEntryId = mode === UpsertTimeEntryMode.Update ? props.timeEntryId : undefined

  const createResponse = usePostTimeEntry()
  const updateResponse = usePatchTimeEntry({
    timeEntryId: timeEntryId ?? '',
  })

  if (mode === UpsertTimeEntryMode.Create) {
    return createResponse
  }

  return updateResponse
}
