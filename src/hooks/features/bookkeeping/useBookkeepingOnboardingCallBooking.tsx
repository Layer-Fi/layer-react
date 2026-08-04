import { useCallback } from 'react'

import { type CallBooking, CallBookingPurpose, CallBookingType } from '@schemas/bookkeeping/callBooking'
import { useGetBookkeepingConfiguration } from '@api/businesses/[business-id]/bookkeeping/config/get'
import { useBookkeepingStatusGlobalCacheActions, useGetBookkeepingStatus } from '@api/businesses/[business-id]/bookkeeping/status/get'
import { useGetListCallBookings } from '@api/businesses/[business-id]/call-bookings/get'
import { usePostCallBooking } from '@api/businesses/[business-id]/call-bookings/post'
import { type CalendlyPayload, useCalendly } from '@hooks/features/calendly/useCalendly'
import { type CallBookingStringOverrides } from '@features/bookkeeping/CallBooking/CallBooking'

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
  const { data: bookkeepingStatus } = useGetBookkeepingStatus()
  const { data: bookkeepingConfiguration } = useGetBookkeepingConfiguration()
  const { forceReload: forceReloadBookkeepingStatus } = useBookkeepingStatusGlobalCacheActions()
  const { trigger: createCallBooking } = usePostCallBooking()
  const { data: callBookings, isError, isLoading } = useGetListCallBookings({ limit: 1 })

  const onboardingCallUrl = bookkeepingStatus?.showEmbeddedOnboarding
    ? bookkeepingStatus.onboardingCallUrl
    : undefined

  const callBookingStringOverrides: CallBookingStringOverrides = {
    title: bookkeepingConfiguration?.onboardingCallCardTitleText ?? undefined,
    description: bookkeepingConfiguration?.onboardingCallCardDescriptionText ?? undefined,
    coverage: bookkeepingConfiguration?.onboardingCallCardCoverageText ?? undefined,
  }

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
      void forceReloadBookkeepingStatus()
    }
    catch (error: unknown) {
      console.error('Failed to record onboarding call booking', error)
    }
  }, [createCallBooking, forceReloadBookkeepingStatus])

  const { isCalendlyVisible, calendlyLink, calendlyRef, openCalendly, closeCalendly } = useCalendly({
    onEventScheduled: recordCalendlyScheduled,
  })

  const callBooking: CallBooking | null = callBookings?.[0]?.data[0] ?? null
  const hasResolvedCallBooking = !isLoading && !isError

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

  return {
    callBooking: callBooking ?? undefined,
    showCallBookingCard: showScheduledCallBooking || showEmptyCallBooking,
    handleBookCall,
    callBookingStringOverrides,
    isCalendlyVisible,
    calendlyLink,
    calendlyRef,
    closeCalendly,
  }
}
