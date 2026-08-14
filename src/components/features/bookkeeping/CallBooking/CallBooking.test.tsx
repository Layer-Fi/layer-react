import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { type CallBooking as CallBookingData, CallBookingPurpose, CallBookingState, CallBookingType } from '@schemas/features/bookkeeping/callBooking'
import { CallBooking, type CallBookingProps } from '@features/bookkeeping/CallBooking/CallBooking'

import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'

const MOCK_ONBOARDING_CALL_BOOKING: CallBookingData = {
  id: 'call-booking-1',
  businessId: 'business-1',
  externalId: 'external-1',
  purpose: CallBookingPurpose.BOOKKEEPING_ONBOARDING,
  state: CallBookingState.SCHEDULED,
  callType: CallBookingType.ZOOM,
  eventStartAt: new Date('2026-08-20T15:30:00.000Z'),
  eventEndAt: null,
  callLink: new URL('https://zoom.us/j/123456789'),
  cancellationReason: null,
  didAttend: null,
  bookkeeperName: 'Jamie Bookkeeper',
  bookkeeperEmail: 'jamie@layerfi.com',
  createdAt: new Date('2026-08-01T00:00:00.000Z'),
  updatedAt: new Date('2026-08-01T00:00:00.000Z'),
}

const MOCK_ADHOC_CALL_BOOKING: CallBookingData = {
  ...MOCK_ONBOARDING_CALL_BOOKING,
  purpose: CallBookingPurpose.ADHOC,
  callType: CallBookingType.GOOGLE_MEET,
}

const renderCallBooking = (props: Partial<CallBookingProps> = {}) => {
  const user = userEvent.setup()

  return {
    user,
    ...render(<CallBooking {...props} />, { wrapper: LayerTestProvider }),
  }
}

describe('CallBooking', () => {
  it('renders the empty state and emits an event when scheduling a call', async () => {
    const onBookCall = vi.fn()
    const { user } = renderCallBooking({ onBookCall })

    expect(screen.getByRole('heading', { name: 'Ready to get started?' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Schedule a call' }))

    expect(onBookCall).toHaveBeenCalledTimes(1)
  })

  it('renders empty-state string overrides when provided', () => {
    renderCallBooking({
      stringOverrides: {
        title: 'Custom title',
        description: 'Custom description',
      },
    })

    expect(screen.getByRole('heading', { name: 'Custom title' })).toBeInTheDocument()
    expect(screen.getByText('Custom description')).toBeInTheDocument()
  })

  it('renders onboarding call details, coverage list, and a join link', () => {
    renderCallBooking({ callBooking: MOCK_ONBOARDING_CALL_BOOKING })

    expect(screen.getByRole('heading', { name: 'Onboarding call' })).toBeInTheDocument()
    expect(screen.getByText('Meet with our bookkeeping team')).toBeInTheDocument()
    expect(screen.getByText('Zoom')).toBeInTheDocument()
    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)

    const joinLink = screen.getByRole('link', { name: /join call/i })
    expect(joinLink).toHaveAttribute('href', 'https://zoom.us/j/123456789')
  })

  it('renders ad hoc call details without the onboarding coverage list', () => {
    renderCallBooking({ callBooking: MOCK_ADHOC_CALL_BOOKING })

    expect(screen.getByRole('heading', { name: 'Ad hoc call' })).toBeInTheDocument()
    expect(screen.getByText('Google Meet')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('uses the custom onboarding title, description, and coverage string overrides', () => {
    renderCallBooking({
      callBooking: MOCK_ONBOARDING_CALL_BOOKING,
      stringOverrides: {
        title: 'Custom onboarding title',
        description: 'Custom onboarding description',
        coverage: 'Custom coverage summary',
      },
    })

    expect(screen.getByRole('heading', { name: 'Custom onboarding title' })).toBeInTheDocument()
    expect(screen.getByText('Custom onboarding description')).toBeInTheDocument()
    expect(screen.getByText('Custom coverage summary')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })
})
