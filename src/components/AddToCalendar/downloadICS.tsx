import { generateIcsCalendar, IcsCalendar } from 'ts-ics'

const prepareIcsFilename = (title: string) => {
  return title.replace(/[^a-z0-9]/gi, '_').toLowerCase().trim()
}

export function downloadICS(calendar: IcsCalendar, title: string) {
  const value = generateIcsCalendar(calendar)
  const blob = new Blob([value], { type: 'text/calendar' })

  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  const filename = prepareIcsFilename(title)

  link.href = url
  link.download = `${filename}.ics`
  document.body.appendChild(link)
  link.click()

  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
