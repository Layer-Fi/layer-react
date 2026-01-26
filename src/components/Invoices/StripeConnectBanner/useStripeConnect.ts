import { useCallback } from 'react'

import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { useStripeConnectAccountLink } from '@features/invoices/api/useStripeConnectAccountLink'

export function useStripeConnect() {
  const { addToast } = useLayerContext()
  const { trigger, isMutating, isError } = useStripeConnectAccountLink()

  const handleConnectStripe = useCallback(async () => {
    try {
      const result = await trigger()
      if (result?.connectAccountUrl) {
        window.location.assign(result.connectAccountUrl)
      }
      else {
        addToast({ content: 'Stripe has sent a misconfigured connect account onboarding link. Please try again.', type: 'error' })
      }
    }
    catch {
      addToast({ content: 'Unable to connect to Stripe. Please try again.', type: 'error' })
    }
  }, [trigger, addToast])

  return {
    handleConnectStripe,
    isMutating,
    isConnectError: isError,
  }
}
