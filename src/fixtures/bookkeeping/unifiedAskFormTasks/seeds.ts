import { type UnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'

import { accountMaskTaskSeeds } from '@fixtures/bookkeeping/unifiedAskFormTasks/accountMask'
import { counterpartyTaskSeeds } from '@fixtures/bookkeeping/unifiedAskFormTasks/counterparty'
import { freeResponseTaskSeeds } from '@fixtures/bookkeeping/unifiedAskFormTasks/freeResponse'
import { p2pCounterpartyTaskSeeds } from '@fixtures/bookkeeping/unifiedAskFormTasks/p2pCounterparty'
import { type TaskSeeds } from '@fixtures/bookkeeping/unifiedAskFormTasks/utils'

const TASK_SEEDS: TaskSeeds[] = [freeResponseTaskSeeds, counterpartyTaskSeeds, p2pCounterpartyTaskSeeds, accountMaskTaskSeeds]

export const makeSeededTasks = (year: number, month: number): UnifiedAskFormTask[] =>
  TASK_SEEDS.flatMap(seeds => seeds(year, month))
