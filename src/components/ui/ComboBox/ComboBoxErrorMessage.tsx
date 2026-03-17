import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { HStack } from '@ui/Stack/Stack'
import { P } from '@ui/Typography/Text'

type ComboBoxErrorMessageProps = {
  isError?: boolean
  errorMessage?: ReactNode
}

export function ComboBoxErrorMessage({ isError, errorMessage }: ComboBoxErrorMessageProps) {
  const { t } = useTranslation()
  if (!isError) {
    return null
  }

  return (
    <HStack justify='end'>
      {errorMessage ?? (
        <P size='xs' status='error'>
          {t('ui:error.generic', 'An error occurred.')}
        </P>
      )}
    </HStack>
  )
}
