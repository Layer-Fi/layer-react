import { useCallback, useEffect, useState } from 'react'

import { type CallBooking, CallBookingPurpose, CallBookingType } from '@schemas/callBooking'
import { useBookkeepingStatus, useBookkeepingStatusGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bookkeeping/status/useBookkeepingStatus'
import { useCallBookings } from '@hooks/api/businesses/[business-id]/call-bookings/useCallBookings'
import { useCreateCallBooking } from '@hooks/api/businesses/[business-id]/call-bookings/useCreateCallBooking'
import { type CalendlyPayload, useCalendly } from '@hooks/features/calendly/useCalendly'

const getUuidFromCalendlyUri = (uri: string) => {
  try {
    const segments = new URL(uri).pathname.split('/').filter(Boolean)

    return segments.at(-1)
  }
  catch {
    return
  }
}

export const useBookkeepingOnboardingCallBooking = () => {
  const { data: bookkeepingStatus } = useBookkeepingStatus()
  const { forceReloadBookkeepingStatus } = useBookkeepingStatusGlobalCacheActions()
  const { trigger: createCallBooking } = useCreateCallBooking()
  const { data: callBookings, isError, isLoading } = useCallBookings({ limit: 1 })

  const [embedDismissed, setEmbedDismissed] = useState(false)
  const [hasScheduledCallInSession, setHasScheduledCallInSession] = useState(false)

  const onboardingCallUrl = bookkeepingStatus?.showEmbeddedOnboarding
    ? bookkeepingStatus.onboardingCallUrl
    : undefined

  const recordCalendlyScheduled = useCallback(async (payload: CalendlyPayload) => {
    const externalId = getUuidFromCalendlyUri(payload.event.uri)

    if (externalId == null) {
      return
    }

    const inviteeId = getUuidFromCalendlyUri(payload.invitee.uri)

    if (inviteeId == null) {
      return
    }

    try {
      await createCallBooking({
        external_id: externalId,
        invitee_id: inviteeId,
        purpose: CallBookingPurpose.BOOKKEEPING_ONBOARDING,
        call_type: CallBookingType.GOOGLE_MEET,
      })
      setHasScheduledCallInSession(true)
      void forceReloadBookkeepingStatus()
    }
    catch (error: unknown) {
      console.error('Failed to record onboarding call booking', error)
    }
  }, [createCallBooking, forceReloadBookkeepingStatus])

  const handleCalendlyClose = useCallback(() => {
    setEmbedDismissed(true)
  }, [])

  const { isCalendlyVisible, calendlyLink, calendlyRef, openCalendly, closeCalendly } = useCalendly({
    onEventScheduled: recordCalendlyScheduled,
    onClose: handleCalendlyClose,
  })

  const callBooking: CallBooking | null = callBookings?.[0]?.data[0] ?? null
  const hasResolvedCallBooking = !isLoading && !isError

  const shouldOfferOnboarding = hasResolvedCallBooking
    && callBooking == null
    && onboardingCallUrl != null
    && !hasScheduledCallInSession

  const shouldAutoOpenEmbed = shouldOfferOnboarding && !embedDismissed
  const showScheduledCallBooking = hasResolvedCallBooking && callBooking != null
  const showEmptyCallBooking =
    bookkeepingStatus?.showEmbeddedOnboarding === true
    && hasResolvedCallBooking
    && callBooking == null

  const handleBookCall = useCallback(() => {
    if (onboardingCallUrl != null) {
      openCalendly(onboardingCallUrl)
    }
  }, [onboardingCallUrl, openCalendly])

  useEffect(() => {
    if (!shouldAutoOpenEmbed || onboardingCallUrl == null) {
      return
    }

    openCalendly(onboardingCallUrl)
  }, [shouldAutoOpenEmbed, onboardingCallUrl, openCalendly])

  return {
    callBooking: callBooking ?? undefined,
    showCallBookingCard: showScheduledCallBooking || showEmptyCallBooking,
    handleBookCall,
    isCalendlyVisible,
    calendlyLink,
    calendlyRef,
    closeCalendly,
  }
}
