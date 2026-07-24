import type { ReactNode } from 'react'

import { ErrorText } from '@components/Typography/ErrorText'

type FieldErrorsProps = {
  errors: ReadonlyArray<unknown>
  className?: string
}

export function FieldErrors({ errors, className }: FieldErrorsProps) {
  if (errors.length === 0) return null

  return (
    <div className={className}>
      <ErrorText size='xs'>{errors[0] as ReactNode}</ErrorText>
    </div>
  )
}
