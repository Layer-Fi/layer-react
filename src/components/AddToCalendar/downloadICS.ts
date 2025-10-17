import { generateIcsCalendar, IcsCalendar } from 'ts-ics'

export function prepareIcsFilename(title: string) {
  return title.replace(/[^a-z0-9]/gi, '_').toLowerCase().trim()
}

export function downloadICS(calendar: IcsCalendar, filename: string, triggerInvisibleDownload: (options: { url: string, filename?: string }) => void) {
  const icsContent = generateIcsCalendar(calendar)
  const blob = new Blob([icsContent], { type: 'text/calendar' })
  const url = window.URL.createObjectURL(blob)
  triggerInvisibleDownload({ url, filename: `${filename}.ics` })
}
