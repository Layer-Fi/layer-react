import { useTranslation } from 'react-i18next'

import { Span } from '@ui/Typography/Text'

type ComboBoxErrorMessageProps = {
  isError?: boolean
  errorMessage?: string
}

export function ComboBoxErrorMessage({ isError, errorMessage }: ComboBoxErrorMessageProps) {
  const { t } = useTranslation()
  if (!isError) return null

  return (
    <Span size='xs' status='error'>
      {errorMessage ?? t('ui:error.generic', 'An error occurred.')}
    </Span>
  )
}
