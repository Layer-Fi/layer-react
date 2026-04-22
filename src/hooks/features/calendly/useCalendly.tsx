import { useCallback, useEffect, useRef, useState } from 'react'

import { type LandingPageLink } from '@components/LandingPage/types'

export interface CalendlyPayload {
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

export interface UseCalendlyOptions {
  onEventScheduled?: (payload?: CalendlyPayload) => void | Promise<void>
  onClose?: () => void
  closeOnEventScheduled?: boolean
}

export const useCalendly = (options?: UseCalendlyOptions) => {
  const [isCalendlyVisible, setIsCalendlyVisible] = useState(false)
  const [calendlyLink, setCalendlyLink] = useState('')
  const calendlyRef = useRef<HTMLDivElement>(null)

  const { onEventScheduled, onClose, closeOnEventScheduled } = options ?? {}

  useEffect(() => {
    const handleCalendlyMessage = (e: MessageEvent) => {
      const data = e.data as CalendlyMessageData

      if (
        !data.event
        || typeof data.event !== 'string'
        || !data.event.startsWith('calendly')
      ) {
        return
      }

      if (data.event === 'calendly.event_scheduled') {
        void onEventScheduled?.(data.payload)

        if (closeOnEventScheduled) {
          setIsCalendlyVisible(false)
        }
      }
    }

    window.addEventListener('message', handleCalendlyMessage)
    return () => {
      window.removeEventListener('message', handleCalendlyMessage)
    }
  }, [onEventScheduled, closeOnEventScheduled])

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
