import { useCallback, useMemo } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { Button } from '../ui/Button/Button'
import { DropdownMenu, MenuItem, MenuList } from '../ui/DropdownMenu/DropdownMenu'
import { Span } from '../ui/Typography/Text'
import { generateIcsCalendar, type IcsCalendar, type IcsEvent } from 'ts-ics'
import { uniqueId } from 'lodash'
import { CalendarEvent, google, outlook, yahoo } from 'calendar-link'
import GoogleIcon from '../../assets/images/google-calendar.png'
import OutlookIcon from '../../assets/images/outlook-icon.webp'
import YahooIcon from '../../assets/images/yahoo-calendar-icon.webp'
import { HStack } from '../ui/Stack/Stack'

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

const DEFAULT_DURATION_MS = 15 * 60 * 1000 // 15 minutes

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
  const effectiveEndDate = useMemo(() => endDate ?? new Date(startDate.getTime() + DEFAULT_DURATION_MS), [endDate, startDate])

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
    >
      <MenuList>
        <MenuItem key='google' onClick={() => handleCalendarClick('google')}>
          <HStack gap='sm'>
            <img className='Layer__AddToCalendar__CalendarIcon' src={GoogleIcon} alt='Google Calendar' />
            <Span size='sm'>Google Calendar</Span>
          </HStack>
        </MenuItem>
        <MenuItem key='outlook' onClick={() => handleCalendarClick('outlook')}>
          <HStack gap='sm'>
            <img className='Layer__AddToCalendar__CalendarIcon' src={OutlookIcon} alt='Outlook Calendar' />
            <Span size='sm'>Outlook</Span>
          </HStack>
        </MenuItem>
        <MenuItem key='yahoo' onClick={() => handleCalendarClick('yahoo')}>
          <HStack gap='sm'>
            <img className='Layer__AddToCalendar__CalendarIcon' src={YahooIcon} alt='Yahoo Calendar' />
            <Span size='sm'>Yahoo</Span>
          </HStack>
        </MenuItem>
        <MenuItem key='ics' onClick={() => handleCalendarClick('ics')}>
          <HStack gap='sm'>
            <Calendar size={16} />
            <Span size='sm'>Download .ics file</Span>
          </HStack>
        </MenuItem>
      </MenuList>
    </DropdownMenu>
  )
}
