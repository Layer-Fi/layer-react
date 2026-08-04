import { type ValidationErrorMap } from '@tanstack/react-form'

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
