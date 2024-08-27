import React from 'react'
import { InlineWidget } from 'react-calendly'
import { useLayerContext } from '../../contexts/LayerContext'

export const OnboardingCallCalendar = () => {
  const { businessId } = useLayerContext()

  return (
    <div>
      <InlineWidget
        url='https://calendly.com/altalogy-tom-antas/15min'
        utm={{
          utmCampaign: 'Layer Onboarding',
          utmContent: 'Layer client A',
          utmMedium: 'Initial onboarding',
          utmSource: 'Layer test onboarding',
          utmTerm: 'Onboarding call',
        }}
      />
    </div>
  )
}
