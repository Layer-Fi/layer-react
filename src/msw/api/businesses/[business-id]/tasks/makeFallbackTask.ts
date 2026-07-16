import { Schema } from 'effect'

import { type BusinessTask, BusinessTaskSchema } from '@schemas/businessTasks/businessTask'

const makeBusinessTask = Schema.decodeSync(BusinessTaskSchema)

/** Response fallback for task mutations when the id isn't in the periods store. */
export const makeFallbackTask = (id: string, overrides?: Partial<BusinessTask>): BusinessTask => ({
  ...makeBusinessTask({
    id,
    status: 'TODO',
    title: '',
    question: '',
    user_response: null,
    user_response_type: 'UPLOAD_DOCUMENT',
    documents: null,
  }),
  ...overrides,
})
