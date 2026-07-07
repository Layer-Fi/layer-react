import { Schema } from 'effect'

import { StopTrackerSchema } from '@schemas/timeTracking'

import { timeEntryStore } from '@msw/api/businesses/[business-id]/time-tracking/time-entries/store'
import { findActiveTimeEntry } from '@msw/api/businesses/[business-id]/time-tracking/tracker/activeTimeEntry'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'

const decodeStopTracker = Schema.decodeUnknownSync(StopTrackerSchema)

const MS_PER_MINUTE = 60_000

export const post = createMockEndpoint<{ id: string }, { data: { id: string } }>({
  method: 'post',
  path: '*/v1/businesses/:businessId/time-tracking/tracker/stop',
  resolve: async ({ override, request }) => {
    if (override) return apiData(override)

    decodeStopTracker(await readRequestJson(request))
    const active = findActiveTimeEntry()
    const now = new Date()

    if (active == null) return apiData({ id: crypto.randomUUID() })

    const durationMinutes = active.durationMinutes > 0
      ? active.durationMinutes
      : Math.max(1, Math.round((now.getTime() - active.createdAt.getTime()) / MS_PER_MINUTE))

    timeEntryStore.save({
      ...active,
      status: 'RECORDED',
      durationMinutes,
      stoppedAt: now,
      updatedAt: now,
    })

    return apiData({ id: active.id })
  },
})
