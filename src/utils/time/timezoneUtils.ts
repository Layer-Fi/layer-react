/**
 * Gets the timezone abbreviation for a given date based on the user's locale
 * @param date - The date to get the timezone for
 * @returns Timezone abbreviation (e.g., "PST", "EST", "GMT") or empty string if unable to determine
 */
export const getTimezoneDisplay = (date: Date): string => {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZoneName: 'short',
    })
    const parts = formatter.formatToParts(date)
    const timeZonePart = parts.find(part => part.type === 'timeZoneName')
    return timeZonePart?.value ?? ''
  }
  catch {
    return ''
  }
}
