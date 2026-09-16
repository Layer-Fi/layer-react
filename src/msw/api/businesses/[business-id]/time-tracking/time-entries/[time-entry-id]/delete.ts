import { timeEntryStore } from '@msw/api/businesses/[business-id]/time-tracking/time-entries/store'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

export const del = createMockEndpoint<undefined, Record<string, never>>({
  method: 'delete',
  path: '*/v1/businesses/:businessId/time-tracking/time-entries/:timeEntryId',
  resolve: ({ params }) => {
    timeEntryStore.patchById(params.timeEntryId as string, entry => ({ ...entry, deletedAt: new Date() }))

    return {}
  },
})
