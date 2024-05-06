import { Account, NewAccount } from '../../types'
import { JournalEntry } from '../../types/journal'
import { get, post } from './authenticated_http'

export const getJournal = get<{ data: JournalEntry[] }>(
  ({ businessId }) => `/v1/businesses/${businessId}/ledger/entries`,
)

export const addEntry = post<{ data: Account }, NewAccount>(
  ({ businessId }) => `/v1/businesses/${businessId}/ledger/entries`,
)
