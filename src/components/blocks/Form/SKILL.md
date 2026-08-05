---
name: forms
description: Building a form — useAppForm, the Form*Field components, validators, submit and error handling, testing
applies_to: src/components/blocks/Form/**, src/hooks/features/forms/**, src/utils/form/**
---

# Forms

Forms are TanStack Form via the app wrapper. Never wire a raw `<Input>`/`<Select>` to `useState`
— every field goes through a `Form*Field` component so label association, error display, ARIA
invalid state, and read-only handling come for free.

## The shape of a form

Split it in two: a **hook** owning state, validation, and submission; a **component** rendering
fields. `CustomAccountForm` + `useCustomAccountForm` is the reference pair.

```ts
// useThingForm.ts
export const useThingForm = ({ onSuccess }: { onSuccess?: (thing: Thing) => void }) => {
  const { t } = useTranslation()
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)
  const { trigger: createThing } = useCreateThing()

  const form = useAppForm<ThingFormData>({
    defaultValues: { name: undefined, kind: undefined },
    onSubmit: async ({ value }) => { /* call trigger, setSubmitError on failure */ },
  })

  const isFormValid = useStore(form.store, state => state.isValid)
  const isSubmitting = useStore(form.store, state => state.isSubmitting)

  return { form, submitError, isFormValid, isSubmitting }
}
```

- `useAppForm` from `@hooks/features/forms/useForm` is the one to use — it's `useRawAppForm` with
  the field components pre-bound. Plain `useForm` from the same module exists for forms that need
  no field components; prefer `useAppForm`.
- **Read form state with `useStore(form.store, selector)`**, selecting the narrowest slice
  (`isValid`, `isSubmitting`). Don't subscribe to the whole store.
- Return `{ form, …derived }` from the hook; the component stays presentational.
- **Form values must be plain data.** Rich class types in `useAppForm` values trigger TS2589
  "type instantiation is excessively deep" — use `NonRecursiveBigDecimal` rather than
  `BigDecimal`, and thread class instances as props instead of putting them in values.
- Form data keys often mirror the **wire shape** (`account_name`) because the values feed a
  mutation body directly. That's fine and intentional here.

## Rendering fields

`form.AppField` exposes the bound components as `field.Form*Field`:

```tsx
<form.AppField
  name='account_name'
  validators={{
    onSubmit: ({ value }) =>
      notEmpty(value) ? undefined : t('generalLedger:validation.account_name_required', 'Account name is required'),
  }}
>
  {field => (
    <field.FormTextField
      label={t('generalLedger:label.account_name', 'Account name')}
      placeholder={t('generalLedger:label.enter_account_name', 'Enter account name…')}
    />
  )}
</form.AppField>
```

Use `form.Field` (not `AppField`) only when rendering a control that has no `Form*Field` wrapper.

## The field components

| Component | For |
| --- | --- |
| `FormTextField` | single-line text |
| `FormTextAreaField` | multi-line text |
| `FormNumberField` | plain numbers |
| `FormNonRecursiveBigDecimalField` | money and any precise decimal |
| `FormDateField` | a date value |
| `FormDatePickerField` | a date with a picker popover |
| `FormCheckboxField` | a single boolean |
| `FormSwitchField` | a boolean rendered as a toggle |
| `FormRadioGroupField` | one of N options (`RadioOption<T>[]`) |
| `FormRadioGroupYesNoField` | the common yes/no pair |
| `BaseFormTextField` | building a new text-like field — wrap your own control as the `slot='input'` child |

All of them accept `CommonFormFieldProps`:

- `label` — **required and translated**. It's the accessible name, and when `showLabel` is false
  it becomes the `aria-label` rather than disappearing.
- `showLabel`, `inline`, `showFieldError`, `isReadOnly`, `className`.

Adding a new field type means adding the component to `src/components/blocks/Form/` **and** registering
it in the `createFormHook` `fieldComponents` map in `@hooks/features/forms/useForm` — it isn't
available on `field.` until then.

## Validation

Per-field validators go in the `validators` prop, keyed by trigger (`onChange`, `onBlur`,
`onSubmit`). A validator returns a **translated message** on failure and `undefined` on success.

Shared validators live in `@utils/shared/form/validators`: `required`, `dateNotBefore`, `dateNotAfter`,
`dateNotInFuture`, `positiveAmount`, `amountRangeInOrder`, and `notEmpty` for string emptiness.
Add new reusable rules there rather than inlining a second copy.

Because validators take the message as an argument, call them with `t()` at the call site —
that's what keeps the copy translatable.

## Errors and submission

Three distinct layers; don't collapse them:

| Layer | Renders through |
| --- | --- |
| field validation | the field component itself (`showFieldError`), via `FieldError` |
| an explicit field-level message from outside validation | the field's `errorText` prop |
| form-level API failure | `FormErrorBanner` (`@blocks/FormErrorBanner`) |

`FieldErrors` (`@blocks/Form/FieldErrors`) renders the first error of an array for cases
outside a bound field. `flattenValidationErrors` (`@utils/shared/form/errors`) collapses a TanStack
`ValidationErrorMap` into a string list.

Submit with `SubmitButton` (`@ui/Button/SubmitButton`), driving it from the derived store values:
`isPending={isSubmitting}`, `isDisabled={!isFormValid}`, plus `isError`/`errorMessage` and
optionally `withRetry` to turn it into a retry affordance. It supplies its own icon and pending
spinner — don't add either.

For the mutation itself, prefer a per-call `throwOnError: false` and a guard on the result over
`try`/`catch`; see [`src/hooks/api/SKILL.md`](../../../hooks/api/SKILL.md).

## Testing

Drive forms with the form fillers, addressing fields by their accessible label — which is exactly
why `label` is required:

```tsx
const FORM_DATA = [
  { kind: 'text', field: 'Account name', value: 'Operating Account' },
  { kind: 'comboBox', field: 'Account type', option: 'Credit Card' },
] satisfies readonly FillFormSpec[]

await filler.fill(FORM_DATA)
```

Assert on the **request body** the mutation sent via the MSW handler's `onRequest`, not on form
internals. Details in [`src/testUtils/SKILL.md`](../../../testUtils/SKILL.md).

## Related

- [`src/components/SKILL.md`](../../SKILL.md) — component layering
- [`src/components/ui/SKILL.md`](../../ui/SKILL.md) — the underlying `Input`, `Form`, `Button` primitives
- [`src/schemas/SKILL.md`](../../../schemas/SKILL.md) — `NonRecursiveBigDecimal`, mutation body shapes
- [`src/assets/locales/SKILL.md`](../../../assets/locales/SKILL.md) — translating labels and messages
