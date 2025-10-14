import { useCallback, useMemo } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { Button } from '../ui/Button/Button'
import { DropdownMenu, MenuItem, MenuList } from '../ui/DropdownMenu/DropdownMenu'
import { Span } from '../ui/Typography/Text'
import { generateIcsCalendar, type IcsCalendar, type IcsEvent } from 'ts-ics'
import { uniqueId } from 'lodash'
import { CalendarEvent, google, office365, outlook, yahoo } from 'calendar-link'

/**
 * This property specifies the identifier for the product that
 * created the iCalendar object.
 *
 * This is required by the iCalendar standard.
 * https://datatracker.ietf.org/doc/html/rfc5545#section-3.7.3
 */
const LAYER_ICS_PRODUCT_ID = '-//Layer//Layer Calendar//EN'

const prepareIcsFilename = (title: string) => {
  return title.replace(/[^a-z0-9]/gi, '_').toLowerCase().trim()
}

export type AddToCalendarProps = {
  title: string
  description: string
  location?: string
  startDate: Date
  endDate?: Date | null
  organizer: { name: string, email: string }
}

export const AddToCalendar = ({
  title,
  description,
  location,
  startDate,
  endDate,
  organizer,
}: AddToCalendarProps) => {
  let effectiveEndDate = endDate
  if (!effectiveEndDate) {
    const defaultDurationInMinutes = 15
    // We can set a temporary end date if not specified.
    //
    // Backend: Once the external event resource is created on Calendly and we request to create
    // a new call booking, the backend will automatically lift event details from Calendly.
    //
    // Frontend: We do not have calendly secrets locally, so we just need a temporary date to
    // generate the iCalendar file. We use a conservative duration of 15 minutes.
    effectiveEndDate = new Date(startDate.getTime() + 1000 * 60 * defaultDurationInMinutes)
  }

  const calendarEvent: CalendarEvent = useMemo(() => ({
    title,
    description,
    location,
    start: startDate,
    end: effectiveEndDate,
    organizer: { name: organizer.name, email: organizer.email },
    status: 'CONFIRMED' as const,
  }), [title, description, location, startDate, effectiveEndDate, organizer])

  const generateICS = useCallback(() => {
    const event: IcsEvent = {
      summary: calendarEvent.title,
      description: calendarEvent.description,
      uid: uniqueId('ics-'),
      stamp: { date: new Date() },
      start: { date: startDate },
      end: { date: effectiveEndDate },
      location: location ?? '',
      organizer: { name: organizer.name, email: organizer.email },
      status: calendarEvent.status,
    }

    const calendar: IcsCalendar = {
      version: '2.0',
      prodId: LAYER_ICS_PRODUCT_ID,
      events: [event],
    }

    const value = generateIcsCalendar(calendar)
    const blob = new Blob([value], { type: 'text/calendar' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    const filename = prepareIcsFilename(calendarEvent.title)

    link.href = url
    link.download = `${filename}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }, [calendarEvent, startDate, effectiveEndDate, location, organizer.email, organizer.name])

  const handleCalendarClick = useCallback((provider: string) => {
    let url
    switch (provider) {
      case 'google':
        url = google(calendarEvent)
        break
      case 'outlook':
        url = outlook(calendarEvent)
        break
      case 'office365':
        url = office365(calendarEvent)
        break
      case 'yahoo':
        url = yahoo(calendarEvent)
        break
      case 'ics':
        generateICS()
        return
      default:
        return
    }
    window.open(url, '_blank')
  }, [generateICS, calendarEvent])

  const Trigger = useCallback(() => {
    return (
      <Button variant='outlined'>
        <Calendar size={16} />
        Add to Calendar
        <ChevronDown size={16} />
      </Button>
    )
  }, [])

  return (
    <DropdownMenu
      ariaLabel='Add to Calendar'
      slots={{ Trigger }}
      slotProps={{
        Dialog: { width: '10rem' },
      }}
      variant='compact'
    >
      <MenuList>
        <MenuItem key='google' onClick={() => handleCalendarClick('google')}>
          <Span size='sm'>Google Calendar</Span>
        </MenuItem>
        <MenuItem key='ics' onClick={() => handleCalendarClick('outlook')}>
          <Span size='sm'>Outlook</Span>
        </MenuItem>
        <MenuItem key='ics' onClick={() => handleCalendarClick('office365')}>
          <Span size='sm'>Office 365</Span>
        </MenuItem>
        <MenuItem key='ics' onClick={() => handleCalendarClick('yahoo')}>
          <Span size='sm'>Yahoo</Span>
        </MenuItem>
        <MenuItem key='ics' onClick={() => handleCalendarClick('ics')}>
          <Span size='sm'>Download .ics file</Span>
        </MenuItem>
      </MenuList>
    </DropdownMenu>
  )
}
