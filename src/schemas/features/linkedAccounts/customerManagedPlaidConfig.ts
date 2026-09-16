import type { PlaidLinkOnSuccessMetadata } from 'react-plaid-link'

import type { Awaitable } from '@internal-types/utility/awaitable'

/**
 * Public configuration for customer-managed Plaid items, accepted as a prop by exported
 * components that allow linking accounts.
 *
 * The customer platform owns the Plaid item and mints a processor token scoped to Layer, so
 * every operation needing the customer's Plaid credentials is delegated to these callbacks.
 * Layer still opens the Plaid Link modal and owns the surrounding UI.
 *
 * Mutually exclusive with `PlaidHostedLinkConfig`, which mints tokens through Layer's backend.
 */
export type CustomerManagedPlaidConfig = {
  /** Mints an add-flow link token with the customer's own Plaid client. */
  createLinkToken: () => Awaitable<{ linkToken: string }>

  /**
   * Mints an update-mode link token for the given connection. The id is the
   * `connectionExternalId` Layer holds on file: the Plaid item id for a Layer-managed item, or
   * the processor token for a customer-managed one.
   */
  createUpdateModeLinkToken: (connectionExternalId: string) => Awaitable<{ linkToken: string }>

  /**
   * Hands off a successful Link result. The customer exchanges the public token, mints a
   * processor token for Layer, and registers it via `plaid_processor_tokens` on
   * `POST`/`PUT /v1/businesses`.
   *
   * Must not resolve until Layer has persisted the connection: resolution triggers the refetch,
   * and nothing times this out.
   */
  onPublicTokenReceived: (
    handoff: { publicToken: string, metadata: PlaidLinkOnSuccessMetadata },
  ) => Awaitable<void>
}
