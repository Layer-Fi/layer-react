import { type BankTransactionMetadataUpdateEncoded } from '@schemas/bankTransactions/metadataUpdate'
import { patch } from '@utils/api/authenticatedHttp'
import {
  BankTransactionMetadataResponseSchema,
} from '@hooks/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/metadata/useBankTransactionsMetadata'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const BANK_TRANSACTION_METADATA_MUTATION_TAG_KEY = '#bank-transaction-metadata-mutation'

type BankTransactionMetadataResponseEncoded = typeof BankTransactionMetadataResponseSchema.Encoded

const patchBankTransactionMetadata = patch<
  BankTransactionMetadataResponseEncoded,
  BankTransactionMetadataUpdateEncoded,
  { businessId: string, bankTransactionId: string }
>(
  ({ businessId, bankTransactionId }) =>
    `/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}/metadata`,
)

/**
 * Shared base for the bank-transaction metadata PATCH endpoint. Both the memo and
 * counterparty mutations partial-update the same record; each wrapper supplies its
 * own `argToBody` (so its public trigger shape is preserved) and its own cache
 * side effects, while the transport and full-metadata response decode live here.
 */
export const createBankTransactionMetadataMutationHook = <TArg>(
  argToBody: (arg: TArg) => BankTransactionMetadataUpdateEncoded,
) =>
  createMutationHook({
    tags: [BANK_TRANSACTION_METADATA_MUTATION_TAG_KEY],
    request: patchBankTransactionMetadata,
    keyParams: ['bankTransactionId'],
    argToBody,
    schema: BankTransactionMetadataResponseSchema,
    swrOptions: { throwOnError: false },
  })
