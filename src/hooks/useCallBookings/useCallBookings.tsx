import useSWR from 'swr'
import { useLayerContext } from '../../contexts/LayerContext'
import { useAuth } from '../useAuth'
import { get } from '../../api/layer/authenticated_http'
import type { EnumWithUnknownValues } from '../../types/utility/enumWithUnknownValues'

export enum CallBookingState {
  SCHEDULED = 'SCHEDULED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}
export enum CallBookingType {
  ZOOM = 'ZOOM',
  GOOGLE_MEET = 'GOOGLE_MEET',
}
export enum CallBookingPurpose {
  BOOKKEEPING_ONBOARDING = 'BOOKKEEPING_ONBOARDING',
  BOOKKEEPING = 'BOOKKEEPING',
}
type RawCallBookingState = EnumWithUnknownValues<CallBookingState>
type RawCallBookingType = EnumWithUnknownValues<CallBookingType>
type RawCallBookingPurpose = EnumWithUnknownValues<CallBookingPurpose>

const CALL_BOOKING_STATES: string[] = Object.values(CallBookingState)
const CALL_BOOKING_TYPES: string[] = Object.values(CallBookingType)
const CALL_BOOKING_PURPOSES: string[] = Object.values(CallBookingPurpose)

function isCallBookingState(state: RawCallBookingState): state is CallBookingState {
  return CALL_BOOKING_STATES.includes(state)
}

function constrainToKnownCallBookingState(state: RawCallBookingState): CallBookingState {
  if (isCallBookingState(state)) {
    return state
  }

  return CallBookingState.SCHEDULED
}

function isCallBookingType(type: RawCallBookingType): type is CallBookingType {
  return CALL_BOOKING_TYPES.includes(type)
}

function constrainToKnownCallBookingType(type: RawCallBookingType): CallBookingType {
  if (isCallBookingType(type)) {
    return type
  }

  return CallBookingType.ZOOM
}

function isCallBookingPurpose(purpose: RawCallBookingPurpose): purpose is CallBookingPurpose {
  return CALL_BOOKING_PURPOSES.includes(purpose)
}

function constrainToKnownCallBookingPurpose(purpose: RawCallBookingPurpose): CallBookingPurpose {
  if (isCallBookingPurpose(purpose)) {
    return purpose
  }

  return CallBookingPurpose.BOOKKEEPING_ONBOARDING
}

type CallBooking = {
  id: string
  business_id: string
  external_id: string
  purpose: string
  state: string
  call_type: string
  event_start_at: string
  location: string
  cancellation_reason?: string
  did_attend?: boolean
  bookkeeper_name: string
  bookkeeper_email: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

const getCallBookings = get<
  {
    data: ReadonlyArray<CallBooking>
    meta: {
      pagination: {
        cursor?: string
        has_more: boolean
      }
    }
  },
  { businessId: string }
>(({ businessId }) => {
  return `/v1/businesses/${businessId}/call-bookings`
})

export const CALL_BOOKINGS_TAG_KEY = '#call-bookings'

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      tags: [CALL_BOOKINGS_TAG_KEY],
    } as const
  }
}

export function useCallBookings() {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  return useSWR(
    () => buildKey({
      ...auth,
      businessId,
    }),
    ({ accessToken, apiUrl, businessId }) => getCallBookings(
      apiUrl,
      accessToken,
      { params: { businessId } },
    )()
      .then(({ data }) => {
        return data.map(callBooking => ({
          ...callBooking,
          state: constrainToKnownCallBookingState(callBooking.state),
          callType: constrainToKnownCallBookingType(callBooking.call_type),
          purpose: constrainToKnownCallBookingPurpose(callBooking.purpose),
        } as CallBooking))
      }),
  )
}
