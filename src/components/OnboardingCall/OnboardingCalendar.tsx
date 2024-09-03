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
          src='https://layer-public.s3.us-west-2.amazonaws.com/site-images/call-hosts.png'
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
