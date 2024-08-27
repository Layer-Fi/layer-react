import React from 'react'
import { useFetchCalendarEvents } from './useFetchCalendarEvents'

export const CallReminder = () => {
  const { isLoading, upcomingEvents } = useFetchCalendarEvents()
  return <div>Reminder:</div>
}
