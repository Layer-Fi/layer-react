import { BusinessTaskStatus } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import { type AskForm, type AskFormPage } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import { type AskFormNext, AskFormNextKind } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNext'
import {
  AskFormCategoryScope,
  type AskFormFollowUp,
  type AskFormOption,
  AskFormSearchEntity,
  type AskFormStep,
  AskFormStepType,
} from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import {
  type AskFormTransaction,
  UNIFIED_ASK_FORM_TASK_TYPE,
  UNIFIED_ASK_FORM_VERSION,
  type UnifiedAskFormTask,
} from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'

import { type BankTransactionCategory } from '@fixtures/bankTransactions/constants'
import { makeBusiness } from '@fixtures/business/mocks'
import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
import { createFixtureFactory } from '@fixtures/utils/createFixtureFactory'

export const ASK_FORM_STEP_IDS = {
  category: 'category',
  rows: 'rows',
  alwaysThis: 'always_this',
  response: 'response',
  accountType: 'account_type',
  vendorCategory: 'vendor_category',
} as const

export const COUNTERPARTY_ASK_FORM_VALUES = {
  notSure: 'not_sure',
  mix: 'mix',
  always: 'always',
  ask: 'ask',
} as const

export const SEARCH_ID_PREFIXES: Record<AskFormSearchEntity, string> = {
  [AskFormSearchEntity.Category]: 'acct_',
  [AskFormSearchEntity.Vendor]: 'vend_',
  [AskFormSearchEntity.Customer]: 'cust_',
}

export const toSearchId = (entity: AskFormSearchEntity, id: string) => `${SEARCH_ID_PREFIXES[entity]}${id}`

export const fixtureId = (suffix: string) => `00000000-0000-4000-8000-${suffix.padStart(12, '0')}`

export const SUBMIT: AskFormNext = { kind: AskFormNextKind.Submit, review: false }

export const toPage = (pageId: string): AskFormNext => ({ kind: AskFormNextKind.Page, pageId })

export const askFormNextPageUrl = (taskId: string) =>
  `/v1/businesses/${makeBusiness().id}/unified-tasks/${taskId}/next-page?form_version=${UNIFIED_ASK_FORM_VERSION}`

export const page = (id: string, steps: AskFormStep[], next: AskFormNext = SUBMIT): AskFormPage => ({ id, steps, next })

export const singlePageForm = (formPage: AskFormPage): AskForm => ({ entryPageId: formPage.id, pages: [formPage] })

export const choiceOptions = (labelsByValue: Record<string, string>): AskFormOption[] =>
  Object.entries(labelsByValue).map(([value, label]) => ({ value, label }))

export const categoryOption = ({ id, displayName }: BankTransactionCategory): AskFormOption => ({
  value: toSearchId(AskFormSearchEntity.Category, id),
  label: displayName,
})

export const textFollowUp = (prompt: string | null, placeholder: string | null = null): AskFormFollowUp => ({
  type: AskFormStepType.Text,
  prompt,
  placeholder,
  multiline: true,
  required: true,
})

export const choiceStep = (id: string, prompt: string, options: AskFormOption[]): AskFormStep => ({
  id,
  type: AskFormStepType.Choice,
  prompt,
  options,
  autoAdvance: false,
})

type CategoryStepOptions = { scope?: AskFormCategoryScope, search?: boolean }

export const categoryStep = (
  id: string,
  prompt: string,
  options: AskFormOption[],
  { scope = AskFormCategoryScope.Task, search = false }: CategoryStepOptions = {},
): AskFormStep => ({ id, type: AskFormStepType.Category, prompt, options, scope, search })

export const textStep = (id: string, prompt: string): AskFormStep => ({
  id,
  type: AskFormStepType.Text,
  prompt,
  placeholder: null,
  multiline: true,
  required: true,
})

type AskTransactionSeed = { id: string, day: number, amount: number, description: string }

export const askTransactions = (month: number, seeds: AskTransactionSeed[]): AskFormTransaction[] =>
  seeds.map(({ id, day, amount, description }) => ({
    id: fixtureId(id),
    date: new Date(Date.UTC(FIXTURE_YEAR, month - 1, day)),
    amount,
    description,
  }))

const baseUnifiedAskFormTask: UnifiedAskFormTask = {
  id: fixtureId('c01'),
  status: BusinessTaskStatus.Todo,
  taskType: UNIFIED_ASK_FORM_TASK_TYPE,
  title: 'Tell us about this transaction',
  question: 'Can you tell us a bit more about what this transaction was for?',
  transactions: [],
  form: singlePageForm(page('respond', [textStep(ASK_FORM_STEP_IDS.response, 'Can you tell us a bit more about what this transaction was for?')])),
  answers: null,
  answerSummary: null,
  resolution: null,
}

export const { make: makeUnifiedAskFormTask } = createFixtureFactory(baseUnifiedAskFormTask)

export type TaskSeeds = (year: number, month: number) => UnifiedAskFormTask[]

type TasksByMonth = Partial<Record<number, UnifiedAskFormTask | ReadonlyArray<UnifiedAskFormTask>>>

export const seedsInFixtureYear = (tasksByMonth: TasksByMonth): TaskSeeds =>
  (year, month) => (year === FIXTURE_YEAR ? [tasksByMonth[month] ?? []].flat() : [])
