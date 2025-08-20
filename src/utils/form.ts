import { ValidationErrorMap } from '@tanstack/react-form'

export const notEmpty = (value?: string | null) => {
  if (!value) {
    return false
  }

  return value.trim().length > 0
}

export const validateEmailFormat = (email?: string, required = false) => {
  if (!email) {
    return !required
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function flattenValidationErrors(errors: ValidationErrorMap): string[] {
  return Object.values(errors)
    .filter((value): value is { [key: string]: string }[] =>
      Array.isArray(value)
      && value.every(entry => typeof entry === 'object' && entry !== null),
    )
    .flatMap(errorArray =>
      errorArray.flatMap(entry =>
        Object.values(entry),
      ),
    )
}
