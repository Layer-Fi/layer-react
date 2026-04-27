import { useCallback, useMemo, useRef, useState } from 'react'
import { type EventScheduledEvent, useCalendlyEventListener } from 'react-calendly'

import { type LandingPageLink } from '@components/LandingPage/types'

export type CalendlyPayload = EventScheduledEvent['data']['payload']

const ALLOWED_CALENDLY_HOSTS = ['calendly.com', 'www.calendly.com']
export const isCalendlyLink = (link?: LandingPageLink) => {
  try {
    if (!link) return false
    const hostname = new URL(link.url).hostname
    return (ALLOWED_CALENDLY_HOSTS.includes(hostname) || hostname.endsWith('.calendly.com'))
  }
  catch {
    return false
  }
}

export interface UseCalendlyOptions {
  onEventScheduled?: (payload: CalendlyPayload) => void | Promise<void>
  onClose?: () => void
  closeOnEventScheduled?: boolean
}

export const useCalendly = (options?: UseCalendlyOptions) => {
  const [isCalendlyVisible, setIsCalendlyVisible] = useState(false)
  const [calendlyLink, setCalendlyLink] = useState('')
  const calendlyRef = useRef<HTMLDivElement>(null)

  const { onEventScheduled, onClose, closeOnEventScheduled } = options ?? {}

  const closeCalendly = useCallback(() => {
    setIsCalendlyVisible(false)
    onClose?.()
  }, [onClose])

  const eventHandlers = useMemo(() => ({
    onEventScheduled: (e: EventScheduledEvent) => {
      void (async () => {
        try {
          await Promise.resolve(onEventScheduled?.(e.data.payload))
          if (closeOnEventScheduled) {
            closeCalendly()
          }
        }
        catch (error: unknown) {
          console.error('Calendly onEventScheduled handler failed', error)
        }
      })()
    },
  }), [onEventScheduled, closeOnEventScheduled, closeCalendly])

  useCalendlyEventListener(eventHandlers)

  const openCalendly = useCallback((link: string) => {
    setCalendlyLink(link)
    setIsCalendlyVisible(true)
  }, [])

  return {
    isCalendlyVisible,
    calendlyLink,
    calendlyRef,
    openCalendly,
    closeCalendly,
  }
}
