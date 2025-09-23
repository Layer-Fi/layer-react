import { useCallback } from 'react'
import useSWRMutation from 'swr/mutation'
import { post } from '../../../api/layer/authenticated_http'
import { useLayerContext } from '../../../contexts/LayerContext'
import { useAuth } from '../../../hooks/useAuth'
import { Schema } from 'effect'
import type { UpsertJournalEntry } from './journalEntryFormSchemas'
import type { JournalEntry } from '../../../types/journal'

const UPSERT_JOURNAL_ENTRY_TAG_KEY = '#upsert-journal-entry'

export enum UpsertJournalEntryMode {
  Create = 'Create',
  Update = 'Update',
}

type UpsertJournalEntryBody = UpsertJournalEntry

const JournalEntryReturnSchema = Schema.Struct({
  data: Schema.Array(Schema.Unknown), // The API returns an array of journal entries
})

type UpsertJournalEntryReturn = {
  data: JournalEntry[]
}

const createJournalEntry = post<
  UpsertJournalEntryReturn,
  UpsertJournalEntryBody,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/ledger/manual-entries`)

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      tags: [UPSERT_JOURNAL_ENTRY_TAG_KEY],
    } as const
  }
}

type UseUpsertJournalEntryProps = 
  | { mode: UpsertJournalEntryMode.Create }
  | { mode: UpsertJournalEntryMode.Update, journalEntryId: string }

export const useUpsertJournalEntry = (props: UseUpsertJournalEntryProps) => {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const { mode } = props
  // For now, we only support create mode since the API doesn't have an update endpoint
  if (mode === UpsertJournalEntryMode.Update) {
    throw new Error('Update mode is not yet supported for journal entries')
  }

  const rawMutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
    }),
    (
      { accessToken, apiUrl, businessId },
      { arg: body }: { arg: UpsertJournalEntryBody },
    ) => {
      return createJournalEntry({
        apiUrl,
        accessToken,
        body,
      }).then(response => {
        // Return the first journal entry from the array
        return {
          data: response.data[0] as JournalEntry,
        }
      })
    },
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const trigger = useCallback(
    async (body: UpsertJournalEntryBody) => {
      return rawMutationResponse.trigger(body)
    },
    [rawMutationResponse.trigger],
  )

  return {
    trigger,
    data: rawMutationResponse.data,
    error: rawMutationResponse.error,
    isMutating: rawMutationResponse.isMutating,
  }
}
