/**
 * @TODO - change hosts image from base64 into assets
 */
import React from 'react'
import { InlineWidget, useCalendlyEventListener } from 'react-calendly'
import { useLayerContext } from '../../contexts/LayerContext'
import Camera from '../../icons/Camera'
import CheckCircle from '../../icons/CheckCircle'
import Clock from '../../icons/Clock'
import { Text, TextSize, TextWeight } from '../Typography'

export interface OnboardingCalendarProps {
  calendarUrl: string
  onScheduled?: () => void
}

export const OnboardingCalendar = ({
  calendarUrl,
  onScheduled,
}: OnboardingCalendarProps) => {
  const { businessId } = useLayerContext()

  /** @TODO Call API with the invitee / event details */
  useCalendlyEventListener({
    onEventScheduled: e => {
      localStorage.setItem('layerCall', JSON.stringify(e.data.payload))
      onScheduled && onScheduled()
    },
  })

  return (
    <div className='Layer__onboarding-calendar'>
      <div className='Layer__onboarding-calendar__header'>
        <img
          src='data:image/png;base64,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'
          alt='Hosts'
        />
        <Text
          weight={TextWeight.bold}
          className='Layer__onboarding-calendar__heading'
        >
          Onboarding call with bookkeeping team
        </Text>
        <div className='Layer__onboarding-calendar__call-details'>
          <div className='Layer__onboarding-calendar__call-detail'>
            <CheckCircle size={15} />{' '}
            <Text size={TextSize.sm}>Requires confirmation</Text>
          </div>
          <div className='Layer__onboarding-calendar__call-detail'>
            <Camera size={15} /> <Text size={TextSize.sm}>Google Meet</Text>
          </div>
          <div className='Layer__onboarding-calendar__call-detail'>
            <Clock size={15} /> <Text size={TextSize.sm}>30 min</Text>
          </div>
        </div>
      </div>
      <InlineWidget
        url={calendarUrl}
        pageSettings={{
          hideEventTypeDetails: true,
          hideLandingPageDetails: false,
        }}
      />
    </div>
  )
}
