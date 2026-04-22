import { useCallback, useEffect, useState } from 'react'

import { type CallBooking, CallBookingPurpose, CallBookingType } from '@schemas/callBooking'
import { useBookkeepingStatus, useBookkeepingStatusGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bookkeeping/status/useBookkeepingStatus'
import { useCallBookings } from '@hooks/api/businesses/[business-id]/call-bookings/useCallBookings'
import { useCreateCallBooking } from '@hooks/api/businesses/[business-id]/call-bookings/useCreateCallBooking'
import { useCalendly, type UseCalendlyOptions } from '@hooks/features/calendly/useCalendly'

type CalendlyPayload = Parameters<NonNullable<UseCalendlyOptions['onEventScheduled']>>[0]

const getExternalIdFromCalendlyPayload = (payload?: CalendlyPayload) => {
  const eventUri = payload?.event.uri

  if (eventUri == null) {
    return
  }

  try {
    const segments = new URL(eventUri).pathname.split('/').filter(Boolean)

    return segments.at(-1)
  }
  catch (_) {
    return
  }
}

export const useBookkeepingOverviewCalendly = () => {
  const { data: bookkeepingStatus } = useBookkeepingStatus()
  const { forceReloadBookkeepingStatus } = useBookkeepingStatusGlobalCacheActions()
  const { trigger: createCallBooking } = useCreateCallBooking()
  const { data: callBookings, isError, isLoading, isValidating } = useCallBookings({ limit: 1 })

  const [embedDismissed, setEmbedDismissed] = useState(false)
  const [hasScheduledCallInSession, setHasScheduledCallInSession] = useState(false)

  const onboardingCallUrl =
    bookkeepingStatus != null
    && bookkeepingStatus.showEmbeddedOnboarding
    && bookkeepingStatus.onboardingCallUrl != null
      ? bookkeepingStatus.onboardingCallUrl
      : undefined

  const recordCalendlyScheduled = useCallback(async (payload?: CalendlyPayload) => {
    const externalId = getExternalIdFromCalendlyPayload(payload)

    if (externalId == null) {
      return
    }

    setHasScheduledCallInSession(true)

    try {
      await createCallBooking({
        external_id: externalId,
        purpose: CallBookingPurpose.BOOKKEEPING_ONBOARDING,
        call_type: CallBookingType.GOOGLE_MEET,
      })
      void forceReloadBookkeepingStatus()
    }
    catch (error: unknown) {
      console.error('Failed to record onboarding call booking', error)
    }
  }, [createCallBooking, forceReloadBookkeepingStatus])

  const handleCalendlyScheduled = useCallback((payload?: CalendlyPayload) => {
    void recordCalendlyScheduled(payload)
  }, [recordCalendlyScheduled])

  const { isCalendlyVisible, calendlyLink, calendlyRef, openCalendly, closeCalendly } = useCalendly({
    onEventScheduled: handleCalendlyScheduled,
  })

  const callBooking: CallBooking | null = callBookings?.[0]?.data[0] ?? null
  const hasResolvedCallBooking = !isLoading && !isValidating && !isError
  const showScheduledCallBooking = hasResolvedCallBooking && callBooking != null
  const showEmptyCallBooking = hasResolvedCallBooking
    && callBooking == null
    && onboardingCallUrl != null
    && embedDismissed
    && !hasScheduledCallInSession

  const handleBookCall = useCallback(() => {
    if (onboardingCallUrl != null) {
      openCalendly(onboardingCallUrl)
    }
  }, [onboardingCallUrl, openCalendly])

  const handleCloseCalendly = useCallback(() => {
    setEmbedDismissed(true)
    void forceReloadBookkeepingStatus()
    closeCalendly()
  }, [closeCalendly, forceReloadBookkeepingStatus])

  useEffect(() => {
    if (
      !hasResolvedCallBooking
      || callBooking != null
      || onboardingCallUrl == null
      || embedDismissed
      || hasScheduledCallInSession
      || isCalendlyVisible
    ) {
      return
    }

    openCalendly(onboardingCallUrl)
  }, [
    callBooking,
    embedDismissed,
    hasResolvedCallBooking,
    hasScheduledCallInSession,
    isCalendlyVisible,
    onboardingCallUrl,
    openCalendly,
  ])

  return {
    callBooking: showScheduledCallBooking ? callBooking ?? undefined : undefined,
    showCallBookingCard: showScheduledCallBooking || showEmptyCallBooking,
    handleBookCall,
    isCalendlyVisible,
    calendlyLink,
    calendlyRef,
    handleCloseCalendly,
  }
}
