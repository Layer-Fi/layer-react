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

  const eventHandlers = useMemo(() => ({
    onEventScheduled: (e: EventScheduledEvent) => {
      void onEventScheduled?.(e.data.payload)

      if (closeOnEventScheduled) {
        setIsCalendlyVisible(false)
      }
    },
  }), [onEventScheduled, closeOnEventScheduled])

  useCalendlyEventListener(eventHandlers)

  const openCalendly = useCallback((link: string) => {
    setCalendlyLink(link)
    setIsCalendlyVisible(true)
  }, [])

  const closeCalendly = useCallback(() => {
    setIsCalendlyVisible(false)
    onClose?.()
  }, [onClose])

  return {
    isCalendlyVisible,
    calendlyLink,
    calendlyRef,
    openCalendly,
    closeCalendly,
  }
}
