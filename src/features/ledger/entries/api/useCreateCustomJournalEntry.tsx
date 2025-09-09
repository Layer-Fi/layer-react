import type { Key } from 'swr'
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation'
import { useLayerContext } from '../../../../contexts/LayerContext'
import { useAuth } from '../../../../hooks/useAuth'
import { type CustomJournalEntry, type CreateCustomJournalEntry } from '../../../../schemas/generalLedger/customJournalEntry'
import { createCustomJournalEntry } from './journalNew'

const CREATE_CUSTOM_JOURNAL_ENTRY_TAG_KEY = '#create-custom-journal-entry'

type CreateCustomJournalEntryReturn = { data: CustomJournalEntry }

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
      tags: [CREATE_CUSTOM_JOURNAL_ENTRY_TAG_KEY],
    }
  }
  return null
}

export const useCreateCustomJournalEntry = (): SWRMutationResponse<
  CreateCustomJournalEntryReturn,
  Error,
  Key,
  CreateCustomJournalEntry
> => {
  const { businessId } = useLayerContext()
  const auth = useAuth()

  const key = buildKey({
    access_token: auth.data?.access_token,
    apiUrl: auth.data?.apiUrl,
    businessId,
  })

  return useSWRMutation(
    key,
    async (_key, { arg }: { arg: CreateCustomJournalEntry }) => {
      if (!key) {
        throw new Error('Missing authentication or business context')
      }

      const { accessToken, apiUrl: url, businessId: bId } = key

      return createCustomJournalEntry(
        url,
        accessToken,
        {
          params: { businessId: bId },
          body: arg,
        },
      )
    },
    {
      throwOnError: true,
    },
  )
}
