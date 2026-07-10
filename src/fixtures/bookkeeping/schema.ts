import { Schema } from 'effect'

import { taskSeedArbitrary } from '@fixtures/bookkeeping/arbitrary'
import { FixtureIdPrefix, idArbitrary } from '@fixtures/utils/arbitrary/id'

export const TaskSeedSchema = Schema.Struct({
  id: Schema.UUID,
  day: Schema.Number,
  amountCents: Schema.Number,
  merchant: Schema.String,
}).annotations({ arbitrary: () => taskSeedArbitrary })

export const schema = TaskSeedSchema

export const PeriodIdSchema = Schema.UUID.annotations({
  arbitrary: () => idArbitrary(FixtureIdPrefix.bookkeepingPeriod),
})
