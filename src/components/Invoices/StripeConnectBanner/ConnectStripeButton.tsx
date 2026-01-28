import { ExternalLink, RotateCcw } from 'lucide-react'

import { Button } from '@ui/Button/Button'

export const ConnectStripeButton = ({
  isError,
  isMutating,
  onClick,
}: {
  isError: boolean
  isMutating: boolean
  onClick: () => void
}) => (
  <Button
    variant='solid'
    onPress={onClick}
    isDisabled={isMutating}
    isPending={isMutating}
  >
    {isError ? 'Retry' : 'Connect Stripe'}
    {isError ? <RotateCcw size={16} /> : <ExternalLink size={16} />}
  </Button>
)
