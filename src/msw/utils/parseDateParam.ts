import { isValid, parseISO } from 'date-fns'

// parseISO keeps date-only strings in local time, matching how the app builds ranges.
export const parseDateParam = (value: string | null, fallback: Date) => {
  const parsed = parseISO(value ?? '')
  return isValid(parsed) ? parsed : fallback
}
