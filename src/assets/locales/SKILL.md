---
name: translations
description: i18n — inline t() defaults, namespace/key naming, plural & conditional helpers, never hand-edit locale JSON, Crowdin pipeline
applies_to: src/assets/locales/**, src/utils/i18n/**
---

# Translations (i18n)

Locales: `en-US` (source) and `fr-CA`. Every user-visible string is translated — including
table headers, empty states, tooltips, `aria-label`s, and error copy.

## Never hand-edit the locale JSON

`src/assets/locales/**/*.json` is generated. Do not add, rename, or delete keys there — write
the key **and its English default inline at the call site** and let the pipeline do the rest.

## How to add or change a translated string

1. **Write it inline in the code**, with the key and the English default:
   `t('invoices:InvoiceTable.label.due_date', 'Due date')`. Reuse an existing key if one fits — check
   `common.json` first.
2. **Ship your PR without touching the locale JSON.** Your feature works immediately: i18next
   falls back to the inline default when the key is missing, so English renders correctly and
   `fr-CA` falls back to English until Crowdin translates it. Nothing is blocked on the
   pipeline.
3. **Keys get collected separately** by the manually-triggered
   [`i18n-extract-keys`](../../../.github/workflows/i18n-extract-keys.yml) workflow
   (`npx i18next-cli extract --sync-primary`), which opens/updates one standing
   `i18n/extract-keys` PR against `main`. It writes English values and scaffolds or removes
   `fr-CA` keys — it never writes French values.
4. **French comes from Crowdin.** Both directions run through one workflow,
   [`crowdin-sync`](../../../.github/workflows/crowdin-sync.yml), which picks its half from what
   the push changed:
   - **`en-US` changed** — uploads English sources, scaffolds `fr-CA` from the `en-US` diff
     (added → `""`, changed → blanked, removed → dropped), pre-translates untranslated strings
     (translation memory, then AI), downloads `fr-CA`, and opens/updates the
     `i18n/crowdin-fr-ca` PR.
   - **`fr-CA` changed** — uploads those edits so the next download can't revert them, and stops.
     This is what makes **local French edits win**; the overall model is bidirectional
     **last-writer-wins**.

   Sources always upload before translations: Crowdin rejects a translation whose source string
   it doesn't have, so a new or renamed namespace fails otherwise.

Manual runs default to the full flow, which is what a release needs. Uncheck `pretranslate` to
only pull down what Crowdin already has. `prune` additionally uploads sources with
`--delete-obsolete`, deleting files and folders that no longer match the source config — needed
after a namespace rename, and destructive, so it is opt-in.

Things to know when the pipeline misbehaves: full pre-translation runs need the
`CROWDIN_AI_PROMPT_ID` variable, and a stale folder left in the Crowdin project causes spurious
"omitted" warnings on download — `prune` clears those.

## Changing the English text of an existing key

**Change the key too.** Editing the default of `invoices:InvoiceTable.label.due_date` from
"Due date" to "Payment due" without renaming the key risks the stale `fr-CA` translation
surviving; a new key (`invoices:InvoiceTable.label.payment_due`) is unambiguously untranslated,
so Crowdin translates it fresh.

Grep for the old key and change **both the key and the default value at every call site** —
`t()`, `translationKey(...)` constants, `tPlural`/`tConditional` case maps. Half-migrating
leaves two keys with conflicting English, and the stragglers keep rendering the old French.

```diff
-t('invoices:InvoiceTable.label.due_date', 'Due date')
+t('invoices:InvoiceTable.label.payment_due', 'Payment due')
```

## Renaming or deleting a key

Change or remove it in the code; extraction reconciles the JSON on its next run. Don't delete
the JSON entry by hand — the scaffolding step keys off the `en-US` diff, and an out-of-band
edit desynchronizes `fr-CA`.

## Calling `t()`

```tsx
const { t } = useTranslation()

t('taxEstimates:TaxDetails.label.tax_details', 'Tax Details')
```

- Always pass the inline default as the second argument. Never `t('some.key')` bare.
- Apostrophes are typographic: `’`, never `'` or `ʼ`.
- Keys are `namespace:Owner.category.snake_case_key` — see below.

## Key naming

```
<namespace>:<Owner>.<category>.<snake_case_key>
```

The **namespace** is the JSON file, and it is derived from where the string is used:

| where the string is used | namespace |
|---|---|
| `src/{components,hooks,providers,schemas,types,utils}/features/<domain>/**` | `<domain>` |
| `src/components/blocks/**` | `blocks` |
| `src/components/ui/**` | `ui` |
| `src/views/<View>/**` | `views`, or any feature domain it composes |

The **owner** names the file that uses the string, so a key always leads you back to it:

| file | owner |
|---|---|
| `InvoiceTable/InvoiceTable.tsx` — the directory's namesake | `InvoiceTable` |
| `Tasks/TasksPanelNotification.tsx` — a sub-component | `Tasks.TasksPanelNotification` |
| `CallBooking/useCallBookingCountdownLabel.ts` — a colocated hook | `CallBooking.useCallBookingCountdownLabel` |
| `InvoiceForm/formUtils.ts` — a colocated helper | `InvoiceForm.formUtils` |
| `utils/features/generalLedger/constants.ts` — a module in the domain folder | `constants` |

Anything that is not its directory's namesake is a sub-part and is qualified by its parent. That
keeps the key pointing at the right file, and keeps generic filenames like `formUtils.ts` distinct
between components.

The **category** is one of `action`, `label`, `state`, `error`, `validation`, `empty`,
`placeholder`, `banner`, `tooltip`, `title`, `disclaimer`, `prompt`.

```tsx
// src/components/features/invoices/InvoiceTable/InvoiceTable.tsx
t('invoices:InvoiceTable.action.view_invoice', 'View invoice')

// src/components/features/bookkeeping/Tasks/TasksPanelNotification.tsx
t('bookkeeping:Tasks.TasksPanelNotification.action.view_and_complete', 'View and complete')
```

**A component owns its keys — never reuse another component's.** The owner segment is what stops
two components sharing a key and passing different English, where extraction silently keeps
whichever call site it visited last. Duplicating the same English under two owners is fine; the
translation memory translates identical source identically.

### Shared namespaces

`common`, `date`, `upload`, and `usStates` are cross-cutting. They carry **no owner segment** and
are meant to be reused:

```tsx
t('common:action.cancel', 'Cancel')
```

Check `common.json` before adding a string to a domain namespace — "Cancel", "Save", "Loading…"
already exist. Because these keys have no owner to separate them, a shared key must have exactly
one English default everywhere; if two call sites need different copy, they need different keys.

## Stable releases require finished translations

`npm run i18n:check-release` fails unless both halves of the pipeline have run:

1. every key used in code exists in `en-US` — otherwise the string never reached Crowdin at all;
2. every `en-US` key has a non-empty value in every translated locale — otherwise it renders
   English through the fallback.

[`Release — Prepare`](../../../.github/workflows/release-prepare.yml) runs it when
`release_type=stable`, **before** the version bump. If it fails, Prepare dispatches the workflow
that can fix it — `i18n-extract-keys` when keys are unextracted, `crowdin-sync` when they are
merely untranslated — and then stops without cutting a release PR. Merge the PR it opens (an
extract PR landing on `main` triggers the Crowdin sync itself), then re-run Prepare.

[`Release — Publish`](../../../.github/workflows/release-publish.yml) runs it again against the
checked-out tag, since strings can land between cutting the release PR and tagging. That one is a
hard block on `npm publish --tag latest`.

If Publish does block, nothing was published, so the version is still free to reuse — don't burn
it on a new patch. Merge the i18n PRs, then run
[`Release — Tag`](../../../.github/workflows/release-tag.yml) manually with `retag=true` to move
the tag onto current `main`, and re-run Publish. That path refuses to move a tag whose version is
already on npm, since a published version must never be retagged.

Alpha releases are exempt; untranslated strings are expected there.

### Enforcement

`npm run i18n:check` (CI: [`i18n-check`](../../../.github/workflows/i18n-check.yml)) fails on a key
with two different English defaults, a key whose namespace or owner doesn't match its file, an
`en-US`/`fr-CA` structural mismatch, and straight apostrophes. ESLint additionally flags a foreign
namespace inline as you type. Both derive the same namespace/owner rules, in
`scripts/i18n/keyOwnership.mjs` and `eslint.config.mjs`.

## Strings outside JSX

For a translation key defined in a constant, options list, or column definition — anywhere
`t()` can't be called at declaration time — use `translationKey`
(`@utils/shared/i18n/translationKey`) so extraction still sees it:

```ts
import { translationKey } from '@utils/shared/i18n/translationKey'

const OPTIONS = [
  { value: PaymentMethod.Cash, ...translationKey('common:label.cash', 'Cash') },
]
```

It returns `{ i18nKey, defaultValue, ns? }` for the consumer to translate at render time.

## Plurals and conditionals

Don't build these with ternaries — the extraction plugins understand these helpers:

```ts
tPlural(t, 'invoices:InvoiceTable.label.invoice_count', { count, one: '{{count}} invoice', other: '{{count}} invoices' })

tConditional(t, 'bankTransactions:BankTransactionsTable.state.status', {
  condition: status,
  cases: { pending: 'Pending', posted: 'Posted' },
})
```

`tConditional` maps a condition onto i18next `context` variants; `tPlural` onto
`_one`/`_other` suffixes. Both live in `@utils/shared/i18n/{conditional,plural}.ts`.

For joining a list of labels, use `formatList` (`@utils/shared/i18n/list/formatters`) — it wraps
`Intl.ListFormat`, so don't `join(', ')`.

## Formatting is separate from translation

Numbers, currency, percentages, dates, and durations never go through `t()` — they go through
`useIntlFormatter()`. Full details in [`src/utils/shared/i18n/SKILL.md`](../../utils/shared/i18n/SKILL.md).
Short version: `<MoneySpan>` in JSX, `formatCurrencyFromCents` for raw strings (input is
**cents**), `formatPercent` (input is a **fraction**), `formatDate` with a `DateFormat` enum
value — never a custom format string, never `toLocaleString`/`toFixed`.

## Locale plumbing

- `SupportedLocale` / `DEFAULT_LOCALE` / `getIntlLocale` in `@utils/shared/i18n/supportedLocale`.
- `LayerI18nProvider` wires i18next, `react-intl`, and react-aria's `I18nProvider` together
  and exposes `useLocale()`.
- The locale is sent as a `Layer-Locale` header and is part of every SWR cache key, so
  switching locale refetches; `StaleLocaleCacheInvalidator` drops the previous locale's cache.
  This is why new query hooks should leave `isLocalized` at its default.
- `i18next-pseudo` (wired in `@utils/shared/i18n/init`) can pseudo-localize to expose untranslated
  strings and layouts that break under longer text.

## Related

- [`src/utils/shared/i18n/SKILL.md`](../../utils/shared/i18n/SKILL.md) — formatting money, dates, numbers
- [`src/components/ui/SKILL.md`](../../components/ui/SKILL.md) — primitives translate too
