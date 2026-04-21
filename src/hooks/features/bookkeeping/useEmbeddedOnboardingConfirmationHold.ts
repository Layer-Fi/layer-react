import { useCallback, useEffect, useMemo, useState } from 'react'

import { useBookkeepingStatusGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bookkeeping/status/useBookkeepingStatus'

const CONFIRMATION_DISPLAY_DELAY_MS = 2000

type UseEmbeddedOnboardingConfirmationHoldParams = {
  showEmbeddedOnboarding: boolean
  onboardingCallUrl: string | undefined
}

export function useEmbeddedOnboardingConfirmationHold({
  showEmbeddedOnboarding,
  onboardingCallUrl,
}: UseEmbeddedOnboardingConfirmationHoldParams) {
  const { forceReloadBookkeepingStatus } = useBookkeepingStatusGlobalCacheActions()
  const [isHoldingConfirmation, setIsHoldingConfirmation] = useState(false)
  const [heldOnboardingCallUrl, setHeldOnboardingCallUrl] = useState<string | undefined>()

  useEffect(() => {
    if (isHoldingConfirmation) {
      const timeout = setTimeout(() => {
        setIsHoldingConfirmation(false)
        void forceReloadBookkeepingStatus()
      }, CONFIRMATION_DISPLAY_DELAY_MS)

      return () => clearTimeout(timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHoldingConfirmation])

  const onEventScheduled = useCallback(() => {
    setHeldOnboardingCallUrl(onboardingCallUrl)
    setIsHoldingConfirmation(true)
  }, [onboardingCallUrl])

  const shouldShow = isHoldingConfirmation || showEmbeddedOnboarding
  const effectiveOnboardingCallUrl = isHoldingConfirmation
    ? heldOnboardingCallUrl
    : onboardingCallUrl

  return useMemo(
    () => ({
      shouldShow,
      onboardingCallUrl: effectiveOnboardingCallUrl,
      onEventScheduled,
    }),
    [shouldShow, effectiveOnboardingCallUrl, onEventScheduled],
  )
}
