import { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { Button } from '../ui/Button/Button'
import { VStack } from '../ui/Stack/Stack'
import classNames from 'classnames'

export type AddToCalendarProps = {
  title: string
  description: string
  location?: string
  startDate: Date
  organizer: { name: string, email: string }
  className?: string
}

export const AddToCalendar = ({
  title,
  description,
  location,
  startDate,
  organizer,
  className,
}: AddToCalendarProps) => {
  const [isOpen, setIsOpen] = useState(false)

  // Format date for different calendar services
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  }

  const endDate = startDate

  // Generate Google Calendar URL
  const getGoogleCalendarUrl = () => {
    const baseUrl = 'https://calendar.google.com/calendar/render'
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
      details: description,
      location: location ?? '',
      ctz: startDate.toLocaleString(),
    })
    return `${baseUrl}?${params.toString()}`
  }

  // Generate ICS file content
  const generateICS = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Add to Calendar//EN',
      'BEGIN:VEVENT',
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      `ORGANIZER;CN=${organizer.name}:mailto:${organizer.email}`,
      `UID:${Date.now()}@addtocalendar.com`,
      `DTSTAMP:${formatDate(new Date())}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    setIsOpen(false)
  }

  // Handle calendar provider click
  const handleCalendarClick = (provider: string) => {
    let url
    switch (provider) {
      case 'google':
        url = getGoogleCalendarUrl()
        break
      case 'ics':
        generateICS()
        return
      default:
        return
    }
    window.open(url, '_blank')
    setIsOpen(false)
  }

  return (
    <div className={classNames('relative inline-block', className)}>
      {/* Add to Calendar Button */}
      <div className='relative'>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant='outlined'
        >
          <Calendar size={16} />
          Add to Calendar
          <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </Button>

        {/* Dropdown Menu */}
        {isOpen && (
          <VStack gap='xs' className='Layer__call-booking-add-to-calendar-dropdown'>
            <Button
              onClick={() => handleCalendarClick('google')}
              variant='ghost'
            >
              <Calendar size={16} />
              Google Calendar
            </Button>
            <Button
              onClick={() => handleCalendarClick('ics')}
              variant='ghost'
            >
              <Calendar size={16} />
              Download .ics file
            </Button>
          </VStack>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className='fixed inset-0 z-40'
          onClick={() => setIsOpen(false)}
        >
        </div>
      )}
    </div>
  )
}
