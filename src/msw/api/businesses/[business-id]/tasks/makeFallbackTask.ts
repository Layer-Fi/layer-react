import { Schema } from 'effect'

import {
  type LegacyBusinessTask,
  LegacyBusinessTaskSchema,
} from '@schemas/features/bookkeeping/businessTasks/legacyBusinessTask'

const decodeLegacyBusinessTask = Schema.decodeSync(LegacyBusinessTaskSchema)

/** Response fallback for task mutations when the id isn't in the periods store. */
export const makeFallbackTask = (
  id: string,
  overrides?: Partial<LegacyBusinessTask>,
): LegacyBusinessTask => ({
  ...decodeLegacyBusinessTask({
    id,
    status: 'TODO',
    task_type: null,
    title: '',
    question: '',
    user_response: null,
    user_response_type: 'UPLOAD_DOCUMENT',
    documents: null,
  }),
  ...overrides,
})
