import { useCallback, useEffect, useRef, useState } from 'react'
import { LandingPageLink } from '../../components/LandingPage/types'

interface CalendlyPayload {
  event: {
    uri: string
  }
  invitee: {
    uri: string
  }
}

export interface CalendlyMessageData {
  event?: string
  payload?: CalendlyPayload
}

const ALLOWED_CALENDLY_HOSTS = ['calendly.com', 'www.calendly.com']
export const isCalendlyLink = (link?: LandingPageLink) => {
  try {
    if (!link) return false
    const hostname = new URL(link.url).hostname
    return (ALLOWED_CALENDLY_HOSTS.includes(hostname) || hostname.endsWith('.calendly.com'))
  }
  catch (_) {
    return false
  }
}

export const createCalendlyMessageHandler = (
  onEventScheduled?: (payload?: CalendlyPayload) => void,
) => {
  return (e: MessageEvent) => {
    const data = e.data as CalendlyMessageData

    if (data.event && typeof data.event === 'string' && data.event.startsWith('calendly')) {
      if (data.event === 'calendly.event_scheduled') {
        onEventScheduled?.(data.payload)
      }
    }
  }
}

export interface UseCalendlyOptions {
  onEventScheduled?: (payload?: CalendlyPayload) => void
}

export const useCalendly = (options?: UseCalendlyOptions) => {
  const [isCalendlyVisible, setIsCalendlyVisible] = useState(false)
  const [calendlyLink, setCalendlyLink] = useState('')
  const calendlyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleCalendlyMessage = createCalendlyMessageHandler(options?.onEventScheduled)
    window.addEventListener('message', handleCalendlyMessage)
    return () => {
      window.removeEventListener('message', handleCalendlyMessage)
    }
  }, [options?.onEventScheduled])

  const openCalendly = useCallback((link: string) => {
    setCalendlyLink(link)
    setIsCalendlyVisible(true)
  }, [setCalendlyLink, setIsCalendlyVisible])

  const closeCalendly = useCallback(() => {
    setIsCalendlyVisible(false)
  }, [setIsCalendlyVisible])

  return {
    isCalendlyVisible,
    calendlyLink,
    calendlyRef,
    openCalendly,
    closeCalendly,
  }
}
