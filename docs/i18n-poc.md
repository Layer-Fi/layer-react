# I18N Implementation Summary (Layer React)

This document explains the current state of internationalization in `layer-react`, how it works, and how a customer integrates it.

---

## What we built

We added **i18n infrastructure** to the `layer-react` component library with **built-in translations** for English and Spanish. The library works out of the box in English and customers can switch languages by passing a single `locale` prop.

### Key change from the POC

The original POC expected **customers to provide translation resources**. The current implementation **bundles all translations internally** within `layer-react`. Customers only need to specify a language — they never supply translation files.

### In the library (`layer-react`)

- **i18n initialization** with `i18next` + `react-i18next`
- **Built-in locale files** for English (`en`) and Spanish (`es`) bundled in the library
- **Intl settings context** to hold locale state
- **Provider** that keeps `i18next` language in sync and exposes locale settings to the app
- **Header injection** so API calls include the locale contract (`X-Layer-Intl`)
- **Basic formatter helpers** for locale-aware formatting
- **Translated components**: `DataState`, `BankTransactionsHeaderMenu`, `BankTransactionsHeader` (Toggle labels)

---

## How it works (architecture at a glance)

### Design goals (embedded accounting context)

Layer is an **embedded accounting** experience. That has a few i18n implications:

- We may be rendered inside **many different host apps** with their own i18n stacks (or none at all).
- We need a **single place to set locale** that affects UI strings, number/date/currency formatting, and API behavior.
- We need a **cross-tier locale contract** so backend responses can match the user's locale.
- We need predictable behavior when translations are incomplete (fallback rather than broken UX).
- **Customers should not need to manage translations** — the library owns all translated strings.

### 1) Built-in translations are the source of truth

Translations live in `src/i18n/locales/` as TypeScript files:

- `en.ts` — English (default)
- `es.ts` — Spanish

Each locale file exports a single `translation` namespace with nested keys organized by domain:

```typescript
const en = {
  translation: {
    common: {
      refresh: 'Refresh',
      download: 'Download',
      confirm: 'Confirm',
      cancel: 'Cancel',
      save: 'Save',
      allDone: 'All done',
    },
    bankTransactions: {
      downloadTransactions: 'Download transactions',
      uploadTransactionsManually: 'Upload transactions manually',
      manageCategorizationRules: 'Manage categorization rules',
      additionalActionsAriaLabel: 'Additional bank transactions actions',
      toReview: 'To Review',
      categorized: 'Categorized',
      categorizationStatusAriaLabel: 'Categorization status',
    },
  },
} as const
```

Components access translations via `t('bankTransactions.toReview')` — the dot navigates the nested object within the single `translation` namespace.

### 2) Locale settings control everything

`IntlSettings` defines the full locale contract:

- `language` (e.g. `en`, `es`)
- `formatRegion` (e.g. `US`, `MX`)
- `shortDateFormat` (e.g. `MM/DD/YYYY`)
- `numberFormat` (e.g. `,#.`)
- `currency` (e.g. `USD`, `MXN`)

Default is English/US. Customers override by passing `locale` to `LayerProvider`.

### 3) Provider bridges locale settings and i18next

`IntlProvider` (wrapped by `LayerProvider`):

- Stores `IntlSettings` in React state
- Initializes the shared `i18next` instance with built-in resources on first render
- Calls `i18next.changeLanguage()` when `language` changes
- Writes settings to an in-memory store so non-React code (API client) can read the current locale

### 4) API requests include locale context

All API calls add an `X-Layer-Intl` header containing a JSON string of the locale contract. This enables backend services to align formatting and translations.

### 5) Runtime flow (end-to-end)

1. **Customer mounts `LayerProvider`** with an optional `locale` prop (e.g. `{ language: 'es' }`)
2. `LayerProvider` wraps `IntlProvider`, which merges `locale` with `DEFAULT_INTL_SETTINGS`
3. On first render, `IntlProvider` initializes i18next with **built-in English and Spanish resources**
4. If `locale.language` is not `'en'`, `i18nInstance.changeLanguage()` switches to the requested language
5. All `useTranslation()` calls in components resolve to the correct language's strings
6. API requests include `X-Layer-Intl` with the current locale

### 6) Customer-provided resources (optional override)

`LayerProvider` still accepts an optional `resources` prop. If provided, these are deep-merged on top of built-in translations via `addResourceBundle(..., true, true)`. This allows customers to override specific strings if needed, but is not required for normal usage.

---

## Technical details

### i18n initialization (`src/i18n/index.ts`)

- Creates a dedicated i18next instance (`i18nInstance`) — not the global singleton
- Built-in resources are loaded at init time from `locales/en.ts` and `locales/es.ts`
- Default namespace is `translation` (all keys live under this single namespace)
- Fallback language is `en` — missing keys in the active language fall back to English
- Initialization is **synchronous** to avoid blank-screen issues
- `interpolation.escapeValue: false` (React handles escaping)
- Versions: `i18next: ^23.16.8`, `react-i18next: ^15.4.1`

### Namespace structure

All translations use a **single `translation` namespace** with nested keys organized by domain (`common`, `bankTransactions`, etc.). Components use dot-separated paths:

```tsx
const { t } = useTranslation()
t('common.refresh')                           // → "Refresh" or "Actualizar"
t('bankTransactions.toReview')                // → "To Review" or "Para revisar"
t('bankTransactions.categorizationStatusAriaLabel') // → "Categorization status"
```

This avoids the complexity of multiple i18next namespaces while keeping translations organized.

### Locale settings contract (`src/i18n/types.ts`)

- `IntlSettings` defines the full contract shared across frontend and backend
- `DEFAULT_INTL_SETTINGS` ensures predictable defaults (English/US)
- `IntlSettingsInput` allows partial updates from customer apps

### Embedded/SDK constraints

Module-level singletons (`i18nInstance`, `settingsStore`) mean **multiple Layer embeds with different locales on the same page are not isolated**. The last mounted provider wins. We assume multi-embeds use the same locale.

---

## How a customer integrates

### Minimal integration (just switch to Spanish)

```tsx
import { LayerProvider } from '@layerfi/components'

export const App = () => (
  <LayerProvider
    businessId="your-business-id"
    businessAccessToken="your-token"
    locale={{ language: 'es' }}
  >
    <YourApp />
  </LayerProvider>
)
```

That's it. No translation files needed. The library renders all translated components in Spanish automatically.

### Full locale customization

```tsx
<LayerProvider
  businessId="your-business-id"
  businessAccessToken="your-token"
  locale={{
    language: 'es',
    formatRegion: 'MX',
    currency: 'MXN',
  }}
>
  <YourApp />
</LayerProvider>
```

### Overriding specific strings (optional)

If a customer needs to customize specific strings, they can pass `resources`:

```tsx
<LayerProvider
  businessId="your-business-id"
  businessAccessToken="your-token"
  locale={{ language: 'es' }}
  resources={{
    es: {
      translation: {
        bankTransactions: {
          toReview: 'Pendiente de revisión',
        },
      },
    },
  }}
>
  <YourApp />
</LayerProvider>
```

Customer-provided resources are deep-merged on top of built-in translations.

---

## Translated components (current scope)


| Component                         | Keys used                                                                                                                                                                           |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DataState`                       | `common.refresh`                                                                                                                                                                    |
| `BankTransactionsHeaderMenu`      | `bankTransactions.downloadTransactions`, `bankTransactions.uploadTransactionsManually`, `bankTransactions.manageCategorizationRules`, `bankTransactions.additionalActionsAriaLabel` |
| `BankTransactionsHeader` (Toggle) | `bankTransactions.toReview`, `bankTransactions.categorized`, `bankTransactions.categorizationStatusAriaLabel`                                                                       |


---

## Files added/updated

### Library

- `src/i18n/index.ts` – i18next init with built-in resources
- `src/i18n/types.ts` – locale contract + defaults
- `src/i18n/locales/en.ts` – built-in English translations
- `src/i18n/locales/es.ts` – built-in Spanish translations
- `src/contexts/IntlContext/IntlContext.tsx`
- `src/providers/IntlProvider/IntlProvider.tsx`
- `src/providers/LayerProvider/LayerProvider.tsx` – `locale` and `resources` props
- `src/utils/intl/settingsStore.ts`
- `src/api/layer/authenticated_http.ts` – `X-Layer-Intl` header
- `src/components/DataState/DataState.tsx` – uses `t('common.refresh')`
- `src/components/BankTransactions/BankTransactionsHeaderMenu.tsx` – uses `useTranslation()`
- `src/components/BankTransactions/BankTransactionsHeader.tsx` – uses `useTranslation()`
- `eslint.config.mjs` – added `@i18n/` to import alias ignore list
- `tsconfig.json` – `@i18n/*` path alias
- `package.json` – `i18next`, `react-i18next`

---

## Notes / limitations

- Only a **small subset of components** have been translated (3 components, ~10 keys per language)
- **No bulk string extraction** has been done yet for existing hardcoded UI text
- Formatting utilities are available but **not wired into existing components**
- Backend consumption of `X-Layer-Intl` is not implemented yet
- Only **English and Spanish** are bundled; adding a language means creating a new locale file and importing it in `src/i18n/index.ts`

---

## Adding a new language

1. Create `src/i18n/locales/{lang}.ts` mirroring the structure of `en.ts`
2. Import it in `src/i18n/index.ts` and add to `builtInResources`
3. Rebuild the library

---

## Adding translations to a new component

1. Add the translation keys to both `en.ts` and `es.ts` (and any other locale files) under the appropriate domain
2. In the component, import `useTranslation` from `react-i18next`
3. Call `const { t } = useTranslation()` and replace hardcoded strings with `t('domain.keyName')`

---

## Recommended next steps

1. **Extract strings** from high-traffic components into locale files
2. **Replace hardcoded `en-US` formatters** with the locale-aware formatter utilities
3. **Add backend middleware** to parse `X-Layer-Intl` and localize responses
4. **Add more languages** as needed by creating locale files

