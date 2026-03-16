import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useStripeConnectAccountLink } from '@hooks/api/businesses/[business-id]/stripe/connect-account-link/useStripeConnectAccountLink'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export function useStripeConnect() {
  const { t } = useTranslation()
  const { addToast } = useLayerContext()
  const { trigger, isMutating, isError } = useStripeConnectAccountLink()

  const handleConnectStripe = useCallback(async () => {
    try {
      const result = await trigger()
      if (result?.connectAccountUrl) {
        window.open(result.connectAccountUrl, '_blank')
      }
      else {
        addToast({ content: t('stripe:stripeMisconfiguredConnectLink', 'Stripe has sent a misconfigured connect account onboarding link. Please try again.'), type: 'error' })
      }
    }
    catch {
      addToast({ content: t('stripe:unableToConnectToStripe', 'Unable to connect to Stripe. Please try again.'), type: 'error' })
    }
  }, [trigger, addToast, t])

  return useMemo(() => ({
    handleConnectStripe,
    isMutating,
    isStripeConnectError: isError,
  }), [handleConnectStripe, isMutating, isError])
}
