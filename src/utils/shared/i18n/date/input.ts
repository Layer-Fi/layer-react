import { parseISO } from 'date-fns'

export type DateInput = Date | string | number

const isValidDate = (date: Date): boolean => !Number.isNaN(date.getTime())

export const toDate = (value: DateInput): Date | null => {
  if (value === undefined || value === null) {
    return null
  }

  if (value instanceof Date) {
    return isValidDate(value) ? value : null
  }

  if (typeof value === 'string') {
    const parsed = parseISO(value)
    return isValidDate(parsed) ? parsed : null
  }

  const parsed = new Date(value)
  return isValidDate(parsed) ? parsed : null
}
