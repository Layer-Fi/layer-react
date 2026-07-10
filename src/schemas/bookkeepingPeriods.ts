import { Schema } from 'effect'

import { BusinessTaskSchema } from '@schemas/businessTasks/businessTask'

export enum BookkeepingPeriodStatus {
  BOOKKEEPING_NOT_ACTIVE = 'BOOKKEEPING_NOT_ACTIVE',
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS_AWAITING_BOOKKEEPER = 'IN_PROGRESS_AWAITING_BOOKKEEPER',
  IN_PROGRESS_AWAITING_CUSTOMER = 'IN_PROGRESS_AWAITING_CUSTOMER',
  CLOSING_IN_REVIEW = 'CLOSING_IN_REVIEW',
  CLOSING_OPEN_ITEMS = 'CLOSING_OPEN_ITEMS',
  CLOSED_OPEN_TASKS = 'CLOSED_OPEN_TASKS',
  CLOSED_COMPLETE = 'CLOSED_COMPLETE',
}

export const RawBookkeepingPeriodSchema = Schema.Struct({
  id: Schema.String,
  month: Schema.Number,
  year: Schema.Number,
  status: Schema.String,
  tasks: Schema.Array(BusinessTaskSchema),
})

export type RawBookkeepingPeriod = typeof RawBookkeepingPeriodSchema.Type

export const BookkeepingPeriodsSchema = Schema.Struct({
  periods: Schema.Array(RawBookkeepingPeriodSchema),
})
