import { type ReactNode } from 'react'

import { HStack } from '@ui/Stack/Stack'
import { P } from '@ui/Typography/Text'

type ComboBoxErrorMessageProps = {
  isError?: boolean
  errorMessage?: ReactNode
}

export function ComboBoxErrorMessage({ isError, errorMessage }: ComboBoxErrorMessageProps) {
  if (!isError) {
    return null
  }

  return (
    <HStack justify='end'>
      {errorMessage ?? (
        <P size='xs' status='error'>
          An error occurred.
        </P>
      )}
    </HStack>
  )
}
