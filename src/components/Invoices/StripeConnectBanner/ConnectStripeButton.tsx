import { ExternalLink, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@ui/Button/Button'

export const ConnectStripeButton = ({
  isError,
  isMutating,
  onClick,
}: {
  isError: boolean
  isMutating: boolean
  onClick: () => void
}) => {
  const { t } = useTranslation()

  return (
    <Button
      variant='solid'
      onPress={onClick}
      isDisabled={isMutating}
      isPending={isMutating}
    >
      {isError ? t('common:action.retry_label', 'Retry') : t('stripe:action.connect_stripe_label', 'Connect Stripe')}
      {isError ? <RotateCcw size={16} /> : <ExternalLink size={16} />}
    </Button>
  )
}
