# Customer-managed Plaid items

By default, Layer owns the Plaid Item for every linked bank account: Layer's backend mints the
`link_token`, exchanges the `public_token` for an access token, and holds the credentials.

`customerManagedPlaidConfig` inverts that. The customer platform owns the Plaid Item with its own
Plaid client and mints a **processor token** scoped to Layer, so Layer never receives an access
token. Layer keeps the entire UI: connect and reconnect buttons; empty, loading, disabled, and
error states; connected-account display; "Connect another bank"; account confirmation and
exclusion; account and transaction refreshes; `onPlaidConnectionSuccess` and `onComplete`; and all
existing copy, layout, accessibility, and responsive behavior.

Layer also still opens the Plaid Link modal — the customer supplies the token, not the widget.

## The prop

Accepted by `LinkAccounts`, `LinkedAccounts`, `BankTransactionsWithLinkedAccounts`, and
`SolopreneurOverview`. Mutually exclusive with `plaidHostedLinkConfig`; supplying both throws.

```tsx
<LinkAccounts
  customerManagedPlaidConfig={{
    createLinkToken,
    createUpdateModeLinkToken,
    onPublicTokenReceived,
  }}
  onPlaidConnectionSuccess={refreshMyDashboard}
/>
```

| Callback | Called when | Must do |
|---|---|---|
| `createLinkToken()` | User clicks Connect | Return `{ linkToken }` from `/link/token/create` on your Plaid client |
| `createUpdateModeLinkToken(connectionExternalId)` | User clicks Repair connection | Return `{ linkToken }` from `/link/token/create` in update mode for that item |
| `onPublicTokenReceived({ publicToken, metadata })` | Plaid Link succeeds | Exchange, mint a processor token, post it to Layer, and only then resolve |

All three may be async. A rejection surfaces the same error toast a failed Layer request would.

## Connection flow

```
User clicks Connect
  → Layer calls createLinkToken()
  → your backend: POST /link/token/create          (your Plaid client_id)
  → Layer opens Plaid Link with your token
  → user picks their bank and accounts
  → Layer calls onPublicTokenReceived({ publicToken, metadata })
      → your backend: POST /item/public_token/exchange   → access_token
      → your backend: POST /processor/token/create       → processor_token (per account)
      → your backend: POST Layer's processor-token endpoint
      → resolve
  → Layer refetches accounts and transactions, fires onPlaidConnectionSuccess
  → Layer's account confirmation step runs as usual
```

## What the customer needs to build

### 1. Enable Layer as a processor

In your Plaid dashboard, enable Layer under the processor partners for your client. Without this,
`/processor/token/create` rejects the `processor` value.

### 2. Link token endpoint

`POST /link/token/create` with your own `client_id` and `secret`. Include the `transactions`
product. Return only the token to the browser.

The environment (`sandbox` / `production`) is baked into the token you mint — Layer does not
override it, and the `usePlaidSandbox` prop on `LayerProvider` is ignored in this mode.

If your users hit OAuth institutions, register your `redirect_uri` in **your** Plaid dashboard,
not Layer's.

### 3. Update-mode link token endpoint

`POST /link/token/create` with the `access_token` for the item in question. Layer passes you the
`connectionExternalId` it holds for that connection, so store a mapping from that value to your
own item record when you first register the connection.

### 4. Exchange and processor-token endpoint

On `onPublicTokenReceived`:

1. `POST /item/public_token/exchange` → `access_token`, `item_id`
2. `POST /processor/token/create` with `processor: "layer"` for each account the user selected
3. Post the processor token(s) to Layer, along with the `item_id` and institution metadata

**Do not resolve the promise until step 3 succeeds.** Layer treats resolution as "the connection
is persisted" and immediately refetches. Resolving early produces an empty accounts list and a
confusing confirmation step.

Nothing bounds how long the callback may take, so a hung backend leaves Layer's linking spinner up
indefinitely. Apply your own timeout and reject rather than hanging.

### 5. Item lifecycle

Layer cannot act on an item it does not own, so these operate on your side:

- **Removing an item** — `/item/remove` is yours to call. Layer's item-level "unlink all accounts
  under this connection" is disabled in this mode (it is also being deprecated generally); leave
  `showUnlinkItem` unset. Per-account unlink in Layer's UI still works and only affects Layer's
  own records.
- **Sandbox test utilities** — `showBreakConnection` is inert in this mode.
- **Item webhooks** — `ITEM_LOGIN_REQUIRED` and `PENDING_EXPIRATION` go to you, not Layer. See the
  open question below.

## What Layer needs to build

The frontend in this package is complete. The following are backend prerequisites, and the feature
is not usable end-to-end until they exist.

### 1. Register as a Plaid processor partner

`/processor/token/create` requires a named processor. Customers cannot enable Layer in their Plaid
dashboard until this is done. This is the long-lead item.

### 2. Processor-token registration endpoint

A server-to-server endpoint for the customer's backend to post to. It must:

- Accept the processor token, the Plaid `item_id`, institution metadata, and account details
- Create the `ExternalAccountConnection` and `BankAccount` records
- Kick off the initial sync

In short, the same side effects `POST /v1/businesses/{id}/plaid/link/exchange` has today, so the
frontend's post-success refetch lands on the same data. Its contract — required fields,
idempotency on retry, and whether it returns before or after persistence — determines whether
`onPublicTokenReceived` resolving can be trusted as "done".

`connectionExternalId` on the created connection should hold the customer's `item_id`; that is the
value Layer hands back to `createUpdateModeLinkToken`.

### 3. Processor-based sync path

Transactions and balances move to `/processor/transactions/sync` and `/processor/balance/get`.

### 4. A customer-managed flag on the connection

Layer's backend needs to know an item is customer-managed so it can reject or route
`POST /v1/businesses/{id}/plaid/update-mode-link` and the unlink endpoint appropriately, rather
than attempting Plaid calls it has no credentials for.

### 5. `update-connection-status` must not assume Layer minted the token

After a successful repair, the frontend still calls
`POST /v1/businesses/{id}/external-accounts/update-connection-status` in both modes. It is a
Layer-side "this connection is healthy again, resync" trigger rather than a Plaid credential
operation, so it stays — but the backend behind it must work for an item Layer does not own.

### 6. Connection-health signal — open question

This is the biggest unresolved item and should be settled before customers integrate.

A processor token does not grant item-level webhook subscription the way an access token does.
Layer needs some path to learn that a customer-owned item has entered `ITEM_LOGIN_REQUIRED` or
`PENDING_EXPIRATION`, because `connectionNeedsRepairAsOf` and `reconnectWithNewCredentials` on
`ExternalAccountConnection` drive the entire repair-vs-re-add branch in the UI. Without it, the
"Fix account" pill never appears and broken connections go unnoticed.

The likely options are a customer-reported status endpoint (the customer forwards item webhooks to
Layer) or inferring health from processor sync errors. Either way it needs a decision, and if it
lands on the former, it is a second endpoint the customer must build.

## Reference

- Config type: `src/schemas/features/linkedAccounts/customerManagedPlaidConfig.ts`
- Branch points: `src/hooks/legacy/useLinkedAccounts.ts`,
  `src/hooks/features/linkedAccounts/usePlaidLinkModal.ts`
- Tests: `src/hooks/legacy/useLinkedAccounts.test.ts`,
  `src/hooks/features/linkedAccounts/usePlaidLinkModal.test.tsx`
