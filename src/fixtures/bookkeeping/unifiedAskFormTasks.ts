import { type AccountIdentifier } from '@schemas/common/accountIdentifier'
import { BankTransactionDirection, type MinimalBankTransaction } from '@schemas/features/bankTransactions/base'
import { BusinessTaskStatus } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import { type CounterpartyAskTask } from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'
import { type AskForm } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import { AskFormNextKind } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNext'
import {
  AskFormAction,
  AskFormCategoryScope,
  type AskFormOption,
  AskFormSearchEntity,
  AskFormStepType,
} from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import {
  AskFormSubtype,
  type AskFormTransaction,
  UNIFIED_ASK_FORM_TASK_TYPE,
  UNIFIED_ASK_FORM_VERSION,
  type UnifiedAskFormTask,
} from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'

import { bankTransactionCategories, type BankTransactionCategory } from '@fixtures/bankTransactions/constants'
import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
import { chartOfAccounts } from '@fixtures/generated/chartOfAccounts.gen'
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

const ASK_FORM_FIXTURE_BUSINESS_ID = '00000000-0000-4000-8000-000000000201'

export const askFormNextPageUrl = (taskId: string) =>
  `/v1/businesses/${ASK_FORM_FIXTURE_BUSINESS_ID}/unified-tasks/${taskId}/next-page?form_version=${UNIFIED_ASK_FORM_VERSION}`

const resolveAccountId = (accountIdentifier: AccountIdentifier) =>
  (accountIdentifier.type === 'AccountId'
    ? accountIdentifier.id
    : chartOfAccounts.find(({ stableName }) => stableName === accountIdentifier.stableName)?.accountId)

export const findCategoryOptionValue = (accountIdentifier: AccountIdentifier) => {
  const accountId = resolveAccountId(accountIdentifier)

  return accountId ? `acct_${accountId}` : null
}

/** The API's `acct_<uuid>` option value; it rejects any `acct_` value whose id isn't a UUID. */
export const categoryOptionValue = (accountIdentifier: AccountIdentifier) => {
  const value = findCategoryOptionValue(accountIdentifier)

  if (!value) throw new Error(`Unified ask form fixtures reference an unknown account: ${JSON.stringify(accountIdentifier)}`)

  return value
}

const categoryOption = ({ id, displayName }: BankTransactionCategory): AskFormOption => ({
  value: `acct_${id}`,
  label: displayName,
})

const notSureOption = (placeholder: string, submits: boolean): AskFormOption => ({
  value: COUNTERPARTY_ASK_FORM_VALUES.notSure,
  label: 'Something else',
  next: submits ? { kind: AskFormNextKind.Submit, review: false } : null,
  followUp: { type: AskFormStepType.Text, prompt: null, placeholder, multiline: true, required: true },
})

const mixOption = (pageId: string): AskFormOption => ({
  value: COUNTERPARTY_ASK_FORM_VALUES.mix,
  label: 'It\'s a mix or it varies',
  next: { kind: AskFormNextKind.Page, pageId },
})

type CounterpartyAskFormCopy = {
  pickPrompt: string
  rememberPrompt: string
  noun: 'purchase' | 'payment'
}

/** The counterparty and P2P form, as documented in the API's `counterpartyFormSerializesToDocumentedShape`. */
export const makeCounterpartyAskForm = (
  suggestions: ReadonlyArray<AskFormOption>,
  { pickPrompt, rememberPrompt, noun }: CounterpartyAskFormCopy,
): AskForm => {
  const notSurePlaceholder = `Tell us anything you remember about these ${noun}s`

  return {
    entryPageId: 'pick',
    pages: [
      {
        id: 'pick',
        next: { kind: AskFormNextKind.Page, pageId: 'remember' },
        steps: [{
          id: ASK_FORM_STEP_IDS.category,
          type: AskFormStepType.Category,
          prompt: pickPrompt,
          search: false,
          scope: AskFormCategoryScope.Task,
          options: [...suggestions, mixOption('itemise'), notSureOption(notSurePlaceholder, true)],
        }],
      },
      {
        id: 'itemise',
        next: { kind: AskFormNextKind.Submit, review: false },
        steps: [{
          id: ASK_FORM_STEP_IDS.rows,
          type: AskFormStepType.Category,
          prompt: 'Can you share more about what each transaction was for below?',
          search: false,
          scope: AskFormCategoryScope.EachTransaction,
          options: [...suggestions, notSureOption(notSurePlaceholder, false)],
        }],
      },
      {
        id: 'remember',
        next: { kind: AskFormNextKind.Submit, review: false },
        steps: [{
          id: ASK_FORM_STEP_IDS.alwaysThis,
          type: AskFormStepType.Choice,
          prompt: rememberPrompt,
          autoAdvance: false,
          options: [
            { value: COUNTERPARTY_ASK_FORM_VALUES.always, label: 'Yes, automatically categorize them' },
            { value: COUNTERPARTY_ASK_FORM_VALUES.ask, label: 'No, keep asking me about them' },
          ],
        }],
      },
    ],
  }
}

export const makeFreeResponseAskForm = (prompt: string): AskForm => ({
  entryPageId: 'respond',
  pages: [{
    id: 'respond',
    next: { kind: AskFormNextKind.Submit, review: false },
    steps: [{
      id: ASK_FORM_STEP_IDS.response,
      type: AskFormStepType.Text,
      prompt,
      placeholder: null,
      multiline: true,
      required: true,
    }],
  }],
})

export const makeUploadDocumentAskForm = (prompt: string): AskForm => ({
  entryPageId: 'upload',
  pages: [{
    id: 'upload',
    next: { kind: AskFormNextKind.Submit, review: false },
    steps: [{
      id: ASK_FORM_STEP_IDS.response,
      type: AskFormStepType.Upload,
      prompt,
      accept: ['pdf', 'png', 'jpg', 'csv', 'xlsx'],
      multiple: true,
    }],
  }],
})

const VENDOR_CATEGORIES = [
  bankTransactionCategories.software,
  bankTransactionCategories.payrollContractors,
  bankTransactionCategories.officeExpenses,
  bankTransactionCategories.rent,
].map(categoryOption)

export const makeAccountMaskAskForm = (taskId: string, mask: string): AskForm => ({
  entryPageId: 'account_type',
  pages: [
    {
      id: 'account_type',
      next: { kind: AskFormNextKind.Server, url: askFormNextPageUrl(taskId) },
      steps: [{
        id: ASK_FORM_STEP_IDS.accountType,
        type: AskFormStepType.Choice,
        prompt: `What kind of account is ••${mask}?`,
        autoAdvance: false,
        options: [
          { value: 'personal', label: 'A personal account' },
          { value: 'owned', label: 'Another account my business owns' },
          { value: 'vendor', label: 'A vendor I pay' },
          { value: 'customer', label: 'A customer who pays me' },
          {
            value: 'unsure',
            label: 'Not sure',
            followUp: {
              type: AskFormStepType.Text,
              prompt: 'Tell us anything you know about this account.',
              placeholder: null,
              multiline: true,
              required: true,
            },
          },
        ],
      }],
    },
    {
      id: 'connect',
      next: { kind: AskFormNextKind.Submit, review: false },
      steps: [{
        id: 'connect',
        type: AskFormStepType.Action,
        action: AskFormAction.ConnectAccount,
        prompt: 'Connect this account so we can pull its transactions for you automatically.',
      }],
    },
    {
      id: 'vendor',
      next: { kind: AskFormNextKind.Submit, review: false },
      steps: [
        {
          id: 'vendor',
          type: AskFormStepType.SearchWithFreeform,
          entity: AskFormSearchEntity.Vendor,
          prompt: 'Who is the vendor?',
          placeholder: 'Search your vendors or type a name',
          options: [],
        },
        {
          id: ASK_FORM_STEP_IDS.vendorCategory,
          type: AskFormStepType.Category,
          prompt: 'What do you buy from them?',
          search: true,
          scope: AskFormCategoryScope.Task,
          options: [...VENDOR_CATEGORIES, mixOption('itemise')],
        },
      ],
    },
    {
      id: 'itemise',
      next: { kind: AskFormNextKind.Submit, review: false },
      steps: [{
        id: ASK_FORM_STEP_IDS.rows,
        type: AskFormStepType.Category,
        prompt: 'What was each of these payments for?',
        search: true,
        scope: AskFormCategoryScope.EachTransaction,
        options: VENDOR_CATEGORIES,
      }],
    },
    {
      id: 'customer',
      next: { kind: AskFormNextKind.Submit, review: false },
      steps: [{
        id: 'paid_through',
        type: AskFormStepType.Choice,
        prompt: 'Did these payments come through your payments platform?',
        autoAdvance: false,
        options: [
          { value: 'platform', label: 'Yes, through the platform' },
          { value: 'direct', label: 'No, they paid me directly' },
          { value: 'not_sure', label: 'Not sure' },
        ],
      }],
    },
  ],
})

export const toAskFormTransaction = ({ id, date, direction, amount, description }: MinimalBankTransaction): AskFormTransaction => ({
  id,
  date,
  amount: direction === BankTransactionDirection.Debit ? -amount : amount,
  description: description ?? null,
})

export const makeCounterpartyAskFormFor = (task: CounterpartyAskTask): AskForm => {
  const counterpartyName = task.counterparty?.name ?? task.title

  return makeCounterpartyAskForm(
    task.suggestions.map(({ accountIdentifier, name }) => ({ value: categoryOptionValue(accountIdentifier), label: name })),
    {
      pickPrompt: task.question,
      rememberPrompt: `Should we assume your future ${counterpartyName} purchases are {{answer.${ASK_FORM_STEP_IDS.category}.label}} going forward?`,
      noun: 'purchase',
    },
  )
}

const askTransaction = (id: string, month: number, day: number, amount: number, description: string): AskFormTransaction => ({
  id,
  date: new Date(Date.UTC(FIXTURE_YEAR, month - 1, day)),
  amount,
  description,
})

const baseUnifiedAskFormTask: UnifiedAskFormTask = {
  id: '00000000-0000-4000-8000-000000000c01',
  status: BusinessTaskStatus.Todo,
  taskType: UNIFIED_ASK_FORM_TASK_TYPE,
  formSubtype: AskFormSubtype.FreeResponse,
  title: 'Tell us about this transaction',
  question: 'Can you tell us a bit more about what this transaction was for?',
  transactions: [],
  form: makeFreeResponseAskForm('Can you tell us a bit more about what this transaction was for?'),
  answers: null,
  answerSummary: null,
  resolution: null,
}

export const { make: makeUnifiedAskFormTask } = createFixtureFactory(baseUnifiedAskFormTask)

const P2P_SUGGESTIONS = [
  bankTransactionCategories.payrollContractors,
  bankTransactionCategories.rent,
].map(categoryOption)

const P2P_TASK_ID = '00000000-0000-4000-8000-000000000c11'
const ACCOUNT_MASK_TASK_ID = '00000000-0000-4000-8000-000000000c21'

const UNIFIED_ASK_FORM_SEEDS_BY_MONTH: Record<number, (month: number) => UnifiedAskFormTask> = {
  9: month => makeUnifiedAskFormTask({
    id: P2P_TASK_ID,
    formSubtype: AskFormSubtype.P2PCounterparty,
    title: 'Venmo payments to Alex Rivera',
    question: 'You paid Alex Rivera $525.00 on Venmo across 3 payments. What were these for?',
    transactions: [
      askTransaction('00000000-0000-4000-8000-000000000b11', month, 2, -15000, 'VENMO PAYMENT 1023456 ALEX RIVERA'),
      askTransaction('00000000-0000-4000-8000-000000000b12', month, 12, -15000, 'VENMO PAYMENT 1029981 ALEX RIVERA'),
      askTransaction('00000000-0000-4000-8000-000000000b13', month, 24, -22500, 'VENMO PAYMENT 1034410 ALEX RIVERA'),
    ],
    form: makeCounterpartyAskForm(P2P_SUGGESTIONS, {
      pickPrompt: 'You paid Alex Rivera $525.00 on Venmo across 3 payments. What were these for?',
      rememberPrompt: `Should we assume your future Venmo payments to Alex Rivera are {{answer.${ASK_FORM_STEP_IDS.category}.label}} going forward?`,
      noun: 'payment',
    }),
  }),

  10: month => makeUnifiedAskFormTask({
    id: ACCOUNT_MASK_TASK_ID,
    formSubtype: AskFormSubtype.AccountMask,
    title: 'Help us identify account ••2691',
    question: 'We found transfers to an account ending in 2691 that isn’t connected.',
    transactions: [6, 13, 20].map((day, index) =>
      askTransaction(`00000000-0000-4000-8000-000000000b2${index + 1}`, month, day, -100000, `ONLINE TRANSFER TO XXXXXX2691 REF #${4810 + index}`)),
    form: makeAccountMaskAskForm(ACCOUNT_MASK_TASK_ID, '2691'),
  }),
}

export const makeUnifiedAskFormTasks = (year: number, month: number): UnifiedAskFormTask[] => {
  const seed = UNIFIED_ASK_FORM_SEEDS_BY_MONTH[month]

  return seed && year === FIXTURE_YEAR ? [seed(month)] : []
}
