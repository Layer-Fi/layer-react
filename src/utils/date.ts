/** Get month name from number. Index starts from 0 (January = 0, December = 11) */
export const getMonthNameFromNumber = (month: number): string => {
  if (month > 11) {
    return ''
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  return monthNames[month]
}
