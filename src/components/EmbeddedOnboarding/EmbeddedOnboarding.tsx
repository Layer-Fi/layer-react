import { type MouseEvent, useState } from 'react'
import { PopupModal, useCalendlyEventListener } from 'react-calendly'

import { CallBookingPurpose, CallBookingType } from '@schemas/callBooking'
import { useBookkeepingStatusGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bookkeeping/status/useBookkeepingStatus'
import { useCreateCallBooking } from '@hooks/api/businesses/[business-id]/call-bookings/useCreateCallBooking'

export interface EmbeddedOnboardingProps {
  onboardingCallUrl: string
  onComplete: () => void
}

export const EmbeddedOnboarding = (props: EmbeddedOnboardingProps) => (
  <EmbeddedOnboardingContent key={props.onboardingCallUrl} {...props} />
)

const EmbeddedOnboardingContent = ({ onboardingCallUrl, onComplete }: EmbeddedOnboardingProps) => {
  const [isModalOpen, setIsModalOpen] = useState(true)
  const { forceReloadBookkeepingStatus } = useBookkeepingStatusGlobalCacheActions()
  const { trigger: createCallBooking } = useCreateCallBooking()

  const closeModal = () => {
    setIsModalOpen(false)
  }

  useCalendlyEventListener({
    onEventScheduled: (e) => {
      const eventUri = e.data.payload.event.uri

      let externalId: string | undefined
      if (eventUri) {
        try {
          const segments = new URL(eventUri).pathname.split('/').filter(Boolean)
          externalId = segments.at(-1)
        }
        catch (_) {
          externalId = undefined
        }
      }

      if (externalId) {
        void createCallBooking({
          external_id: externalId,
          purpose: CallBookingPurpose.BOOKKEEPING_ONBOARDING,
          call_type: CallBookingType.GOOGLE_MEET,
        }).catch((error: unknown) => {
          console.error('Failed to record onboarding call booking', error)
        })
      }
    },
  })

  const handleModalClose = (_event: MouseEvent<HTMLElement>) => {
    onComplete()
    void forceReloadBookkeepingStatus()
    closeModal()
  }

  return (
    <PopupModal
      url={onboardingCallUrl}
      onModalClose={handleModalClose}
      open={isModalOpen}
      LoadingSpinner={() => <></>}
      rootElement={document.body}
    />
  )
}
