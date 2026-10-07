import { type UnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'

import { accountMaskTaskSeeds } from '@fixtures/bookkeeping/unifiedAskFormTasks/accountMask'
import { counterpartyTaskSeeds } from '@fixtures/bookkeeping/unifiedAskFormTasks/counterparty'
import { p2pCounterpartyTaskSeeds } from '@fixtures/bookkeeping/unifiedAskFormTasks/p2pCounterparty'
import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'

const SEEDS = [counterpartyTaskSeeds, p2pCounterpartyTaskSeeds, accountMaskTaskSeeds]

export const makeSeededUnifiedAskFormTasks = (year: number, month: number): UnifiedAskFormTask[] =>
  (year === FIXTURE_YEAR ? SEEDS.flatMap(seeds => seeds[month] ?? []) : [])
