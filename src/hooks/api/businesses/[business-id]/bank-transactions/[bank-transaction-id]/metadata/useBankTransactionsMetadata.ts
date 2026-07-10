import { Schema } from 'effect'

import { type BankTransactionMetadata } from '@internal-types/bankTransactions'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { get } from '@utils/api/authenticatedHttp'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'
import { createResourceGlobalCacheActions } from '@hooks/utils/swr/createResourceGlobalCacheActions'

export const GET_BANK_TRANSACTION_METADATA_TAG_KEY = '#bank-transaction-metadata'

const BankTransactionMetadataSchema = Schema.Struct({
  memo: Schema.NullishOr(Schema.String),
})

const GetBankTransactionMetadataResponseSchema = UnwrappedDataResponseSchema(BankTransactionMetadataSchema)

const getBankTransactionMetadata = get<
  typeof GetBankTransactionMetadataResponseSchema.Encoded,
  {
    businessId: string
    bankTransactionId: string
  }
>(
  ({ businessId, bankTransactionId }) =>
    `/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}/metadata`,
)

export const useBankTransactionMetadata = createQueryHook({
  tags: [GET_BANK_TRANSACTION_METADATA_TAG_KEY],
  request: getBankTransactionMetadata,
  schema: GetBankTransactionMetadataResponseSchema,
})

export const useBankTransactionMetadataGlobalCacheActions =
  createResourceGlobalCacheActions<BankTransactionMetadata>(GET_BANK_TRANSACTION_METADATA_TAG_KEY)
