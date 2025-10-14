import { useCallback } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { Button } from '../ui/Button/Button'
import { DropdownMenu, MenuItem, MenuList } from '../ui/DropdownMenu/DropdownMenu'
import { Span } from '../ui/Typography/Text'
import { generateIcsCalendar, type IcsCalendar, type IcsEvent } from 'ts-ics'
import { uniqueId } from 'lodash'

// Format date for Google Calendar URL
// Input:  2025-10-14T15:30:45.123Z
//          ↓ (remove - and :)
//         20251014T153045.123Z
//          ↓ (remove .123 milliseconds)
// Output: 20251014T153045Z
//
// Reference: https://stackoverflow.com/questions/22757908/what-parameters-are-required-to-create-an-add-to-google-calendar-link
const formatDate = (date: Date) => {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
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
    effectiveEndDate = new Date(startDate.getTime() + 1000 * 60 * defaultDurationInMinutes)
  }

  const getGoogleCalendarUrl = useCallback(() => {
    const baseUrl = 'https://calendar.google.com/calendar/render'
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: `${formatDate(startDate)}/${formatDate(effectiveEndDate)}`,
      details: description,
      location: location ?? '',
      ctz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
    return `${baseUrl}?${params.toString()}`
  }, [title, description, location, startDate, effectiveEndDate])

  const generateICS = useCallback(() => {
    const event: IcsEvent = {
      summary: title,
      description,
      uid: uniqueId('ics-'),
      stamp: { date: new Date() },
      start: { date: startDate },
      end: { date: effectiveEndDate },
      location: location ?? '',
      organizer: { name: organizer.name, email: organizer.email },
      status: 'CONFIRMED' as const,
    }

    const calendar: IcsCalendar = {
      version: '2.0',
      prodId: '-//Layer//Layer Calendar//EN',
      events: [event],
    }

    const value = generateIcsCalendar(calendar)
    const blob = new Blob([value], { type: 'text/calendar' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }, [title, description, location, organizer, startDate, effectiveEndDate])

  const handleCalendarClick = useCallback((provider: string) => {
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
  }, [generateICS, getGoogleCalendarUrl])

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
        <MenuItem key='ics' onClick={() => handleCalendarClick('ics')}>
          <Span size='sm'>Download .ics file</Span>
        </MenuItem>
      </MenuList>
    </DropdownMenu>
  )
}
