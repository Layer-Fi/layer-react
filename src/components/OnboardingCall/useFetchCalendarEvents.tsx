/**
 * TEMPORARILY IN THIS FOLDER
 * @TODO call Layer API instead of Calendly API
 */
import React, { useEffect, useState } from 'react'
import { useLayerContext } from '../../contexts/LayerContext'

export interface FutureEvent {
  kind?: string
  startTime?: string
  endTime?: string
  timezone?: string
  location?: string
  name?: string
}

export const useFetchCalendarEvents = () => {
  const { businessId } = useLayerContext()

  const [upcomingEvent, setUpcomingEvent] = useState<FutureEvent | undefined>(
    undefined,
  )
  const [isLoading, setIsLoading] = useState(true)

  // const apiToken = ''
  // const orgId = ''
  const apiToken =
    'eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY2Y4ZGM1YmFmYThhNjVlNjg0MDIzZjdjMzJiZTgzNDliMjM4MDEzNWI0IiwidHlwIjoiUEFUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNzI0NzYxMjQ3LCJqdGkiOiJiYWJiNGIyNy00ZmFkLTQ3YTktYmJjOS0xMjBkMzk2ZmUwY2IiLCJ1c2VyX3V1aWQiOiI2ZjIxZjQxOS01ZWU2LTQ2NjMtYTc0Yy1lNzlmYmNiMDYwMWMifQ.XrTNrAvgd7aK3MNJgcSi7mjw35kWQXpFdVE9aeZcqEUTLDA-WdnyRS1ShNpwx1clqGMiNR5fGf3EE1jeCHsUcA'

  const fetchUpcomingEvents = async () => {
    try {
      const payload = localStorage.getItem('layerCall')
      if (!payload) {
        return
      }

      const parsed = payload && JSON.parse(payload)
      /**
       * Example:
       * 
        {
          "event": {
            "uri": "https://api.calendly.com/scheduled_events/b2401910-c90d-4c90-adaa-27bb98438e15"
          },
          "invitee": {
            "uri": "https://api.calendly.com/scheduled_events/b2401910-c90d-4c90-adaa-27bb98438e15/invitees/09432586-7d18-4a09-8cce-f8821925b03b"
          }
        }
       */
      // const inviteeRaw = parsed.invitee.uri
      // const invitee = inviteeRaw.split('/').at(-1)
      const eventRaw = parsed.event.uri
      // const event = eventRaw.split('/').at(-1)

      const eventDataRaw = await fetch(eventRaw, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      })

      const eventData = await eventDataRaw.json()

      // const inviteeDataRaw = await fetch(inviteeRaw, {
      //   headers: {
      //     Authorization: `Bearer ${apiToken}`,
      //     'Content-Type': 'application/json',
      //   },
      // })

      // const inviteeData = await inviteeDataRaw.json()

      // const allEventsDataRaw = await fetch(
      //   `https://api.calendly.com/scheduled_events?organization=https://api.calendly.com/organizations/${orgId}`,
      //   // 'https://api.calendly.com/users/me',
      //   {
      //     headers: {
      //       Authorization: `Bearer ${apiToken}`,
      //       'Content-Type': 'application/json',
      //     },
      //   },
      // )

      // const allEventsData = await allEventsDataRaw.json()

      if (!eventData) {
        return
      }

      setUpcomingEvent({
        kind: eventData.resource.calendar_event.kind,
        startTime: eventData.resource.start_time,
        endTime: eventData.resource.end_time,
        timezone: eventData.resource.timezone,
        location: eventData.resource.location,
        name: eventData.resource.name,
      })
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUpcomingEvents()
  }, [apiToken])

  return { isLoading, upcomingEvent }
}
