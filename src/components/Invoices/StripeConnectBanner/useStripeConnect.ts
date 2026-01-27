import { useCallback, useMemo } from 'react'

import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { useStripeConnectAccountLink } from '@features/invoices/api/useStripeConnectAccountLink'

export function useStripeConnect() {
  const { addToast } = useLayerContext()
  const { trigger, isMutating, isError } = useStripeConnectAccountLink()

  const handleConnectStripe = useCallback(async () => {
    try {
      const result = await trigger()
      if (result?.connectAccountUrl) {
        window.open(result.connectAccountUrl, '_blank')
      }
      else {
        addToast({ content: 'Stripe has sent a misconfigured connect account onboarding link. Please try again.', type: 'error' })
      }
    }
    catch {
      addToast({ content: 'Unable to connect to Stripe. Please try again.', type: 'error' })
    }
  }, [trigger, addToast])

  return useMemo(() => ({
    handleConnectStripe,
    isMutating,
    isStripeConnectError: isError,
  }), [handleConnectStripe, isMutating, isError])
}
