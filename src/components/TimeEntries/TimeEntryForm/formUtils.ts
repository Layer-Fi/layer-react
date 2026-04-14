import { getLocalTimeZone, today } from '@internationalized/date'
import type { TFunction } from 'i18next'

import { type TimeEntry, type TimeEntryForm } from '@schemas/timeTracking'

export const getTimeEntryFormDefaultValues = (entry?: TimeEntry): TimeEntryForm => {
  if (entry) {
    return {
      date: entry.date,
      durationMinutes: entry.durationMinutes,
      memo: entry.memo || '',
      customerId: entry.customer?.id ?? null,
      serviceId: entry.service?.id ?? '',
    }
  }

  return {
    date: today(getLocalTimeZone()),
    durationMinutes: 0,
    memo: '',
    customerId: null,
    serviceId: '',
  }
}

export const validateTimeEntryForm = ({ entry }: { entry: TimeEntryForm }, t: TFunction) => {
  const { date, durationMinutes, serviceId } = entry

  const errors = []

  if (date === null) {
    errors.push({ date: t('timeTracking:validation.entry_date_required', 'Entry date is a required field.') })
  }

  if (date && date.compare(today(getLocalTimeZone())) > 0) {
    errors.push({ date: t('timeTracking:validation.entry_date_not_future', 'Entry date cannot be in the future.') })
  }

  if (durationMinutes <= 0) {
    errors.push({ durationMinutes: t('timeTracking:validation.duration_greater_than_zero', 'Duration must be greater than zero.') })
  }

  if (!serviceId) {
    errors.push({ serviceId: t('timeTracking:validation.service_required', 'Service is a required field.') })
  }

  return errors.length > 0 ? errors : null
}

export const convertTimeEntryFormToUpsertTimeEntry = (form: TimeEntryForm, entry?: TimeEntry): unknown => {
  return {
    date: form.date,
    durationMinutes: form.durationMinutes,
    billable: entry?.billable ?? false,
    description: entry?.description?.trim() || null,
    memo: form.memo.trim() || null,
    serviceId: form.serviceId,
    ...(form.customerId ? { customerId: form.customerId } : {}),
  }
}
