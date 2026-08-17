import type { PlaidLinkOnSuccessMetadata } from 'react-plaid-link'

import type { Awaitable } from '@internal-types/utility/awaitable'

/**
 * Public configuration for customer-managed Plaid items, accepted as a prop by exported
 * components that allow linking accounts.
 *
 * When supplied, the customer platform owns the Plaid item and mints a processor token scoped
 * to Layer, so every operation requiring the customer's Plaid credentials is delegated to these
 * callbacks. Layer still opens the Plaid Link modal and owns the surrounding UI.
 *
 * Mutually exclusive with `PlaidHostedLinkConfig`, which mints tokens through Layer's backend.
 */
export type CustomerManagedPlaidConfig = {
  /** Mints an add-flow link token with the customer's own Plaid client. */
  createLinkToken: () => Awaitable<{ linkToken: string }>

  /**
   * Mints an update-mode link token for the given connection. The id is the
   * `connectionExternalId` Layer holds on file: opaque to Layer, meaningful to the customer.
   */
  createUpdateModeLinkToken: (connectionExternalId: string) => Awaitable<{ linkToken: string }>

  /**
   * Hands off a successful Link result. The customer exchanges the public token, mints a
   * processor token for Layer, and posts it to Layer's API.
   *
   * Must not resolve until Layer has persisted the connection: resolution is what triggers the
   * accounts refetch. Nothing bounds how long this may take, so a callback that never settles
   * leaves the linking spinner up indefinitely.
   */
  onPublicTokenReceived: (
    handoff: { publicToken: string, metadata: PlaidLinkOnSuccessMetadata },
  ) => Awaitable<void>
}
