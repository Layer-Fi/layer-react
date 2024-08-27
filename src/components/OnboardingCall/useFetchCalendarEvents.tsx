/**
 * TEMPORARILY IN THIS FOLDER
 */
import React, { useEffect, useState } from 'react'
import { useLayerContext } from '../../contexts/LayerContext'

export const useFetchCalendarEvents = () => {
  const { businessId } = useLayerContext()

  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const apiToken = ''
  const orgId = ''

  const fetchUpcomingEvents = async () => {
    try {
      const response = await fetch(
        `https://api.calendly.com/scheduled_events?organization=https://api.calendly.com/organizations/${orgId}`,
        // 'https://api.calendly.com/users/me',
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
        },
      )

      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }

      const data = await response.json()
      const events = data.collection

      // Filter events to only include those in the future
      const futureEvents = events.filter(
        (event: any) => new Date(event.start_time) > new Date(),
      )

      setUpcomingEvents(futureEvents)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUpcomingEvents()
  }, [apiToken])

  console.log('events', isLoading, upcomingEvents)

  return { isLoading, upcomingEvents }
}
