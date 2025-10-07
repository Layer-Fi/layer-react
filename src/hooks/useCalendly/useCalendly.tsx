import { useCallback, useEffect, useRef, useState } from 'react'
import { ServiceOfferingLink } from '../../components/ServiceOffering/types'

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
export const isCalendlyLink = (link?: ServiceOfferingLink) => {
  try {
    if (!link) return false
    const hostname = new URL(link.url).hostname
    return (ALLOWED_CALENDLY_HOSTS.includes(hostname) || hostname.endsWith('.calendly.com'))
  }
  catch (_) {
    return false
  }
}

const handleCalendlyMessage = (e: MessageEvent) => {
  const data = e.data as CalendlyMessageData

  if (data.event && typeof data.event === 'string' && data.event.indexOf('calendly') === 0) {
    console.debug('Calendly event:', data.event)

    if (data.event === 'calendly.event_scheduled') {
      console.debug('Booking successful!', data.payload)
    }
  }
}

export const useCalendly = () => {
  const [isCalendlyVisible, setIsCalendlyVisible] = useState(false)
  const [calendlyLink, setCalendlyLink] = useState('')
  const calendlyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.addEventListener('message', handleCalendlyMessage)

    return () => {
      window.removeEventListener('message', handleCalendlyMessage)
    }
  }, [])

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
