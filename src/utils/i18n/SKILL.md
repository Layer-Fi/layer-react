---
name: formatting
description: Formatting money, numbers, percentages, dates, and durations — always through useIntlFormatter, never by hand
applies_to: src/utils/i18n/**, src/hooks/utils/i18n/**
---

# Formatting

Never format money, numbers, percentages, dates, or durations by hand. Everything goes through
the centralized formatters, which resolve locale (`en-US` / `fr-CA`), currency (USD / CAD), and
timezone correctly. A hand-rolled `$${value}` or `toLocaleString()` is wrong in `fr-CA` and
invisible in review.

## The hook: `useIntlFormatter()`

`@hooks/utils/i18n/useIntlFormatter` returns nine locale-aware formatters. The returned object
is memoized and each formatter is stable, so they're safe in dependency arrays.

| Formatter | Purpose | Notable options |
| --- | --- | --- |
| `formatCurrencyFromCents(value, options?)` | cents → localized currency | `signDisplay`, `useGrouping` |
| `formatNumber(value, options?)` | decimal number | `minimumFractionDigits`, `maximumFractionDigits`, `notation`, `compactDisplay`, `useGrouping` |
| `formatPercent(value, options?)` | percentage from a **fraction** | `minimumFractionDigits`, `maximumFractionDigits` |
| `formatDate(value, format?)` | date, defaults to `DateFormat.DateShort` | any `DateFormat` member |
| `formatDateRange(start, end, format?)` | date range | any `DateFormat` member |
| `formatMonthName(monthNumber, format?)` | month number → localized name | a `MonthPattern` member |
| `formatMinutesAsDuration(totalMinutes, options?)` | minutes → human duration | `compact` (digital vs short style) |
| `formatSecondsAsDuration(totalSeconds)` | seconds → digital duration | — |
| `formatList(labels, options?)` | joins labels via `Intl.ListFormat` | `style`, `type` |

Implementations live in `src/utils/i18n/{number,date,duration,list}/formatters.ts`. The hook is
the only entry point components should use — don't import the raw `format*` functions, which
take an `IntlShape` as their first argument.

## Inputs are permissive; two are easy to get wrong

`NumberInput` is `number | string | null | undefined` and `DateInput` is `Date | string | number`,
so you can hand these formatters raw API values. Unparseable input returns `''` rather than
throwing or rendering `NaN` — so a blank cell means bad data, not a missing formatter call.

Two conventions that cause real bugs:

- **Currency input is cents.** `formatCurrencyFromCents` divides by 100 internally. Passing
  dollars renders a value 100× too small.
- **Percent input is a fraction.** `formatPercent(0.05)` → `"5%"`. If you have `5` meaning 5%,
  divide by 100 first.

Locale → currency mapping lives in `@utils/i18n/number/currency` (`getCurrencyForLocale`):
`en-US` → USD, `fr-CA` → CAD. That module also has `getLocaleCurrencySymbol` and
`transformCurrencyValue` for currency *input* fields, and `@utils/i18n/number/input` has
`toLocalizedCents` / `toLocalizedNumber` for parsing a user-typed string back to a number under
the locale's separators.

## Currency in JSX

Prefer `<MoneySpan>` (`@ui/Typography/MoneySpan`) to calling the formatter yourself — it accepts
every `TextStyleProps` prop, so it composes like any other `Span`:

```tsx
<MoneySpan amount={row.original.amount ?? 0} />
<MoneySpan amount={delta} displayPlusSign />
```

`displayPlusSign` maps to `signDisplay: 'always'`. Use `formatCurrencyFromCents` directly only
when you need a raw string — inside an `aria-label`, a `title`, or a non-rendered prop.

`<DurationSpan>` is the equivalent for durations.

## Dates

Use a `DateFormat` member from `@utils/i18n/date/patterns` — **never a custom format string**.
If a pattern you need is missing, add it to the enum rather than formatting inline.

```tsx
const { formatDate } = useIntlFormatter()
formatDate(invoice.dueAt, DateFormat.DateShort)
```

`DateFormat` is a union of narrower pattern enums, so you can accept just the relevant subset in
a prop type (`MonthPattern`, `MonthYearPattern`, `DatePattern`, `DateWithTimePattern`,
`TimePattern`, `YearPattern`, `DayPattern`, `WeekdayPattern`, `MonthDayPattern`). Representative
members:

| Member | Renders |
| --- | --- |
| `DateFormat.DateShort` | `Jan 5, 2026` |
| `DateFormat.DateNumeric` / `DateNumericPadded` | `1/5/2026` / `01/05/2026` |
| `DateFormat.MonthYear` / `MonthYearShort` | `January 2026` / `Jan 2026` |
| `DateFormat.MonthDayShort` | `Jan 5` |
| `DateFormat.DateWithTimeReadable` | `January 5, 2026 at 3:30 PM` |
| `DateFormat.DateWithTimeReadableWithTimezone` | `January 5, 2026, 3:30 PM PST` |
| `DateFormat.Time` | `3:30 PM` |
| `DateFormat.WeekdayShort` | `Mon` |

To format the currently-selected global date, use `useGlobalDateFormatter()` — it closes over
the date store so you pass only a format.

## Numbers and percentages

```tsx
const { formatNumber, formatPercent } = useIntlFormatter()

formatNumber(1234.5, { maximumFractionDigits: 2 })   // "1,234.5"
formatPercent(0.05)                                  // "5%"
formatPercent(0.0525, { maximumFractionDigits: 2 })  // "5.25%"
```

## Combining a formatted value with a translated string

Formatting and translation are separate systems that compose in exactly one direction: **format
the value, then pass the result into `t()` as an interpolation variable.**

```tsx
const { t } = useTranslation()
const { formatDate, formatNumber } = useIntlFormatter()

t('taxEstimates:label.due_at', 'Due on {{date}}', { date: formatDate(data.taxesDueAt) })
t('bookkeeping:action.show_all_tasks_count', 'Show all tasks ({{tasksCount}})', { tasksCount: formatNumber(tasksCount) })
```

Three ways to get this wrong:

- **Building the default string with a template literal** — putting `${formatDate(d)}` inside the
  default. The value becomes part of the key's default, so the extracted English string is
  polluted with one render's data.
- **Concatenating in JSX** — `{t('…', 'Due on')} {formatDate(d)}`. This hard-codes English word
  order; a translation that needs the date first has no way to express it.
- **Passing a formatted value to `t()`** — `t(formatCurrencyFromCents(amount))`. A formatted value
  is data, not a translatable string.

Two details that matter:

- **Placeholder names are part of the contract.** `{{date}}` in the default string must match the
  key in the options object, and renaming it is a translation change — the `fr-CA` value
  references the same placeholder.
- **`tPlural`'s `count` stays a raw number.** i18next picks the plural category from it, so don't
  hand it a formatted string. That means a bare `{{count}}` renders ungrouped — if the number is
  large enough to need separators, pass a second, formatted variable and reference that in the
  string instead of `{{count}}`.

For keys, namespaces, plurals, and the Crowdin pipeline see
[`src/assets/locales/SKILL.md`](../../assets/locales/SKILL.md).

## Anti-patterns

| Don't | Do |
| --- | --- |
| `` `$${amount.toFixed(2)}` ``, `'$' + value` | `<MoneySpan>` / `formatCurrencyFromCents` |
| `value.toLocaleString()`, `new Intl.NumberFormat(…)` | `formatNumber` |
| `<Span>{rate}%</Span>` | `formatPercent` (confirm the input is a fraction) |
| `new Date(x).toISOString()` / `.toLocaleDateString()` for display | `formatDate` with a `DateFormat` member |
| a `dd/MM/yyyy`-style format string | extend `DateFormat` |
| `labels.join(', ')` | `formatList` |
| hardcoded strings in JSX, headers, `aria-label` | wrap with `t()` |

## Related

- [`src/assets/locales/SKILL.md`](../../assets/locales/SKILL.md) — translated strings and the i18n pipeline
- [`src/components/ui/SKILL.md`](../../components/ui/SKILL.md) — `MoneySpan`, `DurationSpan`, typography props
- [`src/schemas/SKILL.md`](../../schemas/SKILL.md) — `NonRecursiveBigDecimal` and cents-based money fields
