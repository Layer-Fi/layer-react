import { createFormHookContexts } from '@tanstack/react-form'

// Kept separate from useForm so the field components can read their context
// without importing the hook that composes them — createFormHook takes the field
// components as input, so a shared module is the only acyclic arrangement.
export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts()
