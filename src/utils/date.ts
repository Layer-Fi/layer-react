const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export const getMonthNameFromNumber = (monthNumber: number): string => {
  if (monthNumber < 1 || monthNumber > 12) {
    return ''
  }

  return monthNames.at(monthNumber - 1) ?? ''
}
