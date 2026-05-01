# Formatting conventions for Claude

Never format money, numbers, percentages, or dates by hand. Always go through the centralized helpers — they handle locale (en-US / fr-CA), currency (USD / CAD), and timezone correctly.

## The hook: `useIntlFormatter()`

Source: `src/hooks/utils/i18n/useIntlFormatter.ts`. Returns eight locale-aware formatters:

| Formatter | Purpose |
| --- | --- |
| `formatCurrencyFromCents(value, options?)` | Cents → localized currency string. `options`: `signDisplay`, `useGrouping`. |
| `formatNumber(value, options?)` | Decimal number. `options`: `minimumFractionDigits`, `maximumFractionDigits`, `notation`, `compactDisplay`, `useGrouping`. |
| `formatPercent(value, options?)` | Percentage. **Input is a fraction:** `0.05` → `"5%"`. |
| `formatDate(value, format?)` | Date with a `DateFormat` enum value. |
| `formatDateRange(start, end, format?)` | Date range. |
| `formatMonthName(monthNumber, format?)` | Month number → localized name. |
| `formatMinutesAsDuration(totalMinutes, options?)` | Minutes → human duration. |
| `formatSecondsAsDuration(totalSeconds)` | Seconds → human duration. |

Underlying implementations live in `src/utils/i18n/{number,date,duration}/formatters.ts`.

## Currency

In JSX, prefer `<MoneySpan>` (`src/components/ui/Typography/MoneySpan.tsx`):

```tsx
<MoneySpan amount={row.original.amount ?? 0} />
<MoneySpan amount={delta} displayPlusSign />
```

Use `formatCurrencyFromCents` only when you need a raw string (e.g. inside an `aria-label` or a non-rendered prop).

- Inputs are always **cents** (the helper divides by 100 internally).
- Locale → currency mapping lives in `src/utils/i18n/number/currency.ts` (`getCurrencyForLocale`): en-US → USD, fr-CA → CAD.

## Dates

Use the `DateFormat` enum from `src/utils/i18n/date/patterns.ts` — never pass a custom format string. Notable patterns:

- `DateFormat.DateShort` — `Jan 5, 2026`
- `DateFormat.DateNumeric` — `1/5/2026`
- `DateFormat.MonthYear` — `January 2026`
- `DateFormat.DateWithTimeReadable` — `January 5, 2026 at 3:30 PM`
- `DateFormat.DateWithTimeReadableWithTimezone` — `January 5, 2026, 3:30 PM PST`
- `DateFormat.Time` — `3:30 PM`

```tsx
const { formatDate } = useIntlFormatter()
formatDate(invoice.dueAt, DateFormat.DateShort)
```

## Numbers and percentages

```tsx
const { formatNumber, formatPercent } = useIntlFormatter()

formatNumber(1234.5, { maximumFractionDigits: 2 })  // "1,234.5"
formatPercent(0.05)                                  // "5%"
formatPercent(0.0525, { maximumFractionDigits: 2 }) // "5.25%"
```

Percent input is a **fraction**, not an integer percentage. If you have `5` (meaning 5%), divide by 100 first.

## Translation strings

UI strings go through `react-i18next`'s `useTranslation()`:

```tsx
const { t } = useTranslation()
t('taxEstimates:label.tax_details', 'Tax Details')
```

When adding new keys, see `docs/ai/i18n.md` — fr-CA entries must ship as empty strings.

## Anti-patterns — do not do this

- `` `$${amount.toFixed(2)}` `` or `'$' + value` — use `<MoneySpan>` / `formatCurrencyFromCents`.
- `value.toLocaleString()` or `new Intl.NumberFormat(...)` directly — use `formatNumber`.
- `<Span>{rate}%</Span>` — use `formatPercent` (and confirm the input is a fraction).
- Hardcoded UI strings in JSX, table headers, `aria-label`, etc. — wrap with `t()`.
- `new Date(x).toISOString()` / `.toLocaleDateString()` for display — use `formatDate` with a `DateFormat` enum value.
- Custom `dd/MM/yyyy`-style format strings — extend `DateFormat` instead.
