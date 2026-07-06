import { Schema } from 'effect'

import { type BankAccount, BankAccountSchema } from '@schemas/bankAccounts/bankAccount'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { get } from '@utils/api/authenticatedHttp'
import { createResourceGlobalCacheActions } from '@hooks/utils/swr/createGlobalCacheActions'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

export const BANK_ACCOUNTS_TAG_KEY = '#bank-accounts'

const ListBankAccountsResponseSchema = UnwrappedDataResponseSchema(Schema.Array(BankAccountSchema))

const listBankAccounts = get<
  typeof ListBankAccountsResponseSchema.Encoded,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/bank-accounts`)

export const useListBankAccounts = createQueryHook({
  tags: [BANK_ACCOUNTS_TAG_KEY],
  request: listBankAccounts,
  schema: ListBankAccountsResponseSchema,
  select: (data): BankAccount[] => [...data],
  isLocalized: false,
})

export const useBankAccountsGlobalCacheActions =
  createResourceGlobalCacheActions<BankAccount[]>(BANK_ACCOUNTS_TAG_KEY)
