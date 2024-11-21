import React from 'react'
import Camera from '../../icons/Camera'
import Clock from '../../icons/Clock'
import { capitalizeFirstLetter, toRFC5545Date } from '../../utils/format'
import { Link } from '../Button'
import { Loader } from '../Loader'
import { Text, TextSize, TextWeight } from '../Typography'
import { OnboardingCalendarEvent, useOnboardingCalendarEvents } from '../../hooks/useOnboardingCalendarEvents'

const GOOGLE_CALENDAR_URL = 'https://calendar.google.com/calendar/r/eventedit'

export interface MeetingReminderProps {
  showOnlyIfData?: boolean
}

const buildGoogleCalendarEventLink = ({ startTime, endTime }: OnboardingCalendarEvent) => {
  if (!startTime || !endTime) {
    return
  }
  const startDate = new Date(startTime)
  const endDate = new Date(endTime)

  return `${GOOGLE_CALENDAR_URL}?text=Layer+Onboarding+call&dates=${toRFC5545Date(
    startDate,
  )}/${toRFC5545Date(endDate)}`
}

export const MeetingReminder = ({ showOnlyIfData }: MeetingReminderProps) => {
  const { isLoading, upcomingEvent } = useOnboardingCalendarEvents()
  
  if (showOnlyIfData && !upcomingEvent) {
    return
  }

  if (isLoading) {
    return <Loader />
  }

  if (!isLoading && upcomingEvent) {
    return (
      <div className='Layer__meeting-reminder'>
        <div className='Layer__meeting-reminder__header'>
          <img
            src='https://layer-public.s3.us-west-2.amazonaws.com/site-images/call-hosts.png'
            alt='Hosts'
          />
          <Text weight={TextWeight.bold}>Confirmed</Text>
          <Text
            size={TextSize.sm}
            className='Layer__meeting-reminder__header__subtitle'
          >
            Your call with bookkeeping team
          </Text>
        </div>
        <div className='Layer__meeting-reminder__content'>
          <div className='Layer__meeting-reminder__content-item'>
            <span className='Layer__meeting-reminder__green-circle' />
            <Text weight={TextWeight.bold}>Onboarding call</Text>
          </div>
          <div className='Layer__meeting-reminder__content-item'>
            <Camera size={15} />
            <Text>{capitalizeFirstLetter(upcomingEvent.kind ?? '')}</Text>
          </div>
          <div className='Layer__meeting-reminder__content-item'>
            <Clock size={15} />
            {upcomingEvent.startTime && upcomingEvent.endTime ? (
              <Text>
                {new Date(upcomingEvent.startTime).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}{' '}
                -{' '}
                {new Date(upcomingEvent.endTime).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
                ,{' '}
                {new Date(upcomingEvent.endTime).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            ) : null}
          </div>
        </div>
        <Link
          target='_blank'
          href={buildGoogleCalendarEventLink(upcomingEvent)}
        >
          Add to your calendar
        </Link>
      </div>
    )
  }

  return
}
