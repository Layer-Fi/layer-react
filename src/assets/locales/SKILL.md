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
   `t('invoices:label.due_date', 'Due date')`. Reuse an existing key if one fits — check
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
4. **French comes from Crowdin.** Merging `en-US` changes to `main` triggers
   [`crowdin-sync`](../../../.github/workflows/crowdin-sync.yml): it scaffolds `fr-CA` keys from
   the `en-US` diff (added → `""`, changed → blanked, removed → dropped), uploads English
   sources, pre-translates untranslated strings (translation memory, then AI), downloads
   `fr-CA`, and opens/updates the `i18n/crowdin-fr-ca` PR. A manual run defaults to
   download-only for pulling upstream Crowdin edits.
5. **Local French edits are honored, not clobbered.** Changing an `fr-CA` file on `main`
   triggers [`crowdin-upload`](../../../.github/workflows/crowdin-upload.yml), which pushes
   sources then translations so the next download can't revert you. The overall model is
   bidirectional **last-writer-wins**.

Things to know when the pipeline misbehaves: both Crowdin workflows share a
`i18n-crowdin-sync` concurrency group, so they queue rather than race; full pre-translation
runs need the `CROWDIN_AI_PROMPT_ID` variable; and a stale `main/` folder left in the Crowdin
project causes spurious "omitted" warnings on download.

## Changing the English text of an existing key

**Change the key too.** Editing the default of `invoices:label.due_date` from "Due date" to
"Payment due" without renaming the key risks the stale `fr-CA` translation surviving; a new key
(`invoices:label.payment_due`) is unambiguously untranslated, so Crowdin translates it fresh.

Grep for the old key and change **both the key and the default value at every call site** —
`t()`, `translationKey(...)` constants, `tPlural`/`tConditional` case maps. Half-migrating
leaves two keys with conflicting English, and the stragglers keep rendering the old French.

```diff
-t('invoices:label.due_date', 'Due date')
+t('invoices:label.payment_due', 'Payment due')
```

## Renaming or deleting a key

Change or remove it in the code; extraction reconciles the JSON on its next run. Don't delete
the JSON entry by hand — the scaffolding step keys off the `en-US` diff, and an out-of-band
edit desynchronizes `fr-CA`.

## Calling `t()`

```tsx
const { t } = useTranslation()

t('taxEstimates:label.tax_details', 'Tax Details')
```

- Always pass the inline default as the second argument. Never `t('some.key')` bare.
- Keys are `namespace:category.snake_case_key`. The namespace is the JSON file
  (`common`, `bankTransactions`, `invoices`, `reports`, `taxEstimates`, `ui`, …); add a new
  namespace file only for a genuinely new domain.
- Categories follow existing usage: `action.*`, `label.*`, `state.*`, `title.*`, `error.*`,
  `description.*`. Look in `common.json` first — generic strings ("Cancel", "Save", "Loading…")
  already exist there and should be reused, not re-keyed per feature.

## Strings outside JSX

For a translation key defined in a constant, options list, or column definition — anywhere
`t()` can't be called at declaration time — use `translationKey`
(`@utils/i18n/translationKey`) so extraction still sees it:

```ts
import { translationKey } from '@utils/i18n/translationKey'

const OPTIONS = [
  { value: PaymentMethod.Cash, ...translationKey('common:label.cash', 'Cash') },
]
```

It returns `{ i18nKey, defaultValue, ns? }` for the consumer to translate at render time.

## Plurals and conditionals

Don't build these with ternaries — the extraction plugins understand these helpers:

```ts
tPlural(t, 'invoices:label.invoice_count', { count, one: '{{count}} invoice', other: '{{count}} invoices' })

tConditional(t, 'bankTransactions:state.status', {
  condition: status,
  cases: { pending: 'Pending', posted: 'Posted' },
})
```

`tConditional` maps a condition onto i18next `context` variants; `tPlural` onto
`_one`/`_other` suffixes. Both live in `@utils/i18n/{conditional,plural}.ts`.

For joining a list of labels, use `formatList` (`@utils/i18n/list/formatters`) — it wraps
`Intl.ListFormat`, so don't `join(', ')`.

## Formatting is separate from translation

Numbers, currency, percentages, dates, and durations never go through `t()` — they go through
`useIntlFormatter()`. Full details in [`src/utils/i18n/SKILL.md`](../../utils/i18n/SKILL.md).
Short version: `<MoneySpan>` in JSX, `formatCurrencyFromCents` for raw strings (input is
**cents**), `formatPercent` (input is a **fraction**), `formatDate` with a `DateFormat` enum
value — never a custom format string, never `toLocaleString`/`toFixed`.

## Locale plumbing

- `SupportedLocale` / `DEFAULT_LOCALE` / `getIntlLocale` in `@utils/i18n/supportedLocale`.
- `LayerI18nProvider` wires i18next, `react-intl`, and react-aria's `I18nProvider` together
  and exposes `useLocale()`.
- The locale is sent as a `Layer-Locale` header and is part of every SWR cache key, so
  switching locale refetches; `StaleLocaleCacheInvalidator` drops the previous locale's cache.
  This is why new query hooks should leave `isLocalized` at its default.
- `i18next-pseudo` (`@utils/i18n/pseudoConfig`) can pseudo-localize to expose untranslated
  strings and layouts that break under longer text.

## Related

- [`src/utils/i18n/SKILL.md`](../../utils/i18n/SKILL.md) — formatting money, dates, numbers
- [`src/components/ui/SKILL.md`](../../components/ui/SKILL.md) — primitives translate too
