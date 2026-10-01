import { type ReactNode, useCallback, useMemo, useRef, useState } from 'react'
import { type Meta, type StoryObj } from '@storybook/react-vite'
import { formOptions, revalidateLogic, useStore } from '@tanstack/react-form'

import { BankTransactionDirection } from '@schemas/features/bankTransactions/base'
import { BusinessTaskStatus, TaskUserResponseType } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import { LedgerAccountType } from '@schemas/features/generalLedger/ledgerAccountType'
import { type UserVisibleTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { DateFormat } from '@utils/shared/i18n/date/patterns'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { SlidingPanes, type SlidingPanesDirection } from '@components/utility/SlidingPanes/SlidingPanes'
import { Badge, BadgeSize, BadgeVariant } from '@ui/Badge/Badge'
import { Button } from '@ui/Button/Button'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { FileInput } from '@ui/Input/FileInput'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { P, Span } from '@ui/Typography/Text'
import { FileThumb } from '@blocks/FileThumb/FileThumb'
import { useRawAppForm, withForm } from '@blocks/Form/useForm'
import { Container } from '@blocks/Layout/Container/Container'
import { TasksListItemShell } from '@features/bookkeeping/TasksListItem/TasksListItemShell'

import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
import { chartOfAccounts } from '@fixtures/generated/chartOfAccounts.gen'

import '@features/bookkeeping/TasksList/tasksList.scss'
import '@features/bookkeeping/TasksListItem/counterpartyAskTaskBody.scss'

/*
 * Prototype only. Copy is plain strings because it is still being iterated on; the real task
 * would translate it and post the form values instead of resolving them locally.
 */

type AccountType = 'vendor' | 'customer' | 'owned' | 'personal' | 'unsure'

type TransactionPattern = 'fixedMonthlyTransfers' | 'variableBills' | 'customerDeposits' | 'loanRepayments'

type TaskTitleKey = 'identify' | 'whoIs' | 'unrecognized' | 'tellUs' | 'current'

type PrototypeConfig = {
  billUploadStyle: 'prompt' | 'statement'
  suggestRuleAfter: number
}

type MockTransaction = {
  id: string
  date: Date
  amount: number
  direction: BankTransactionDirection
  description: string
}

type PatternSummary = {
  count: number
  inflowCount: number
  outflowCount: number
  dominantCount: number
  fixedAmount: number | null
  minAmount: number
  maxAmount: number
  isMonthly: boolean
  loan: { principal: number, payment: number, paymentCount: number } | null
}

type QuestionId =
  | 'counterparty'
  | 'contractor'
  | 'amount'
  | 'recurring'
  | 'refunds'
  | 'bills'
  | 'handling'
  | 'connect'
  | 'purpose'
  | 'whose'
  | 'loan'
  | 'details'

const QUESTION_IDS: readonly QuestionId[] = [
  'counterparty',
  'contractor',
  'amount',
  'recurring',
  'refunds',
  'bills',
  'handling',
  'connect',
  'purpose',
  'whose',
  'loan',
  'details',
]

type ThemeId = 'who' | 'nature' | 'handling'

const THEMES: ReadonlyArray<{ id: ThemeId, title: string }> = [
  { id: 'who', title: 'Who this is and what it’s for' },
  { id: 'nature', title: 'The transactions' },
  { id: 'handling', title: 'Handling going forward' },
]

type StepId = ThemeId | 'uploads' | 'review'
type View = 'picker' | StepId | 'done'

/** `choice` is the chip; `text` is a typed name or free-form answer; `detail` is the category searched under Other. */
type Answer = {
  choice: string | null
  text: string
  detail: string | null
}

type UploadedFile = { id: string, name: string }

type AccountMaskAskFormValues = {
  accountType: AccountType | null
  answers: Record<QuestionId, Answer>
  uploads: { files: UploadedFile[] }
}

type AskContext = {
  mask: string
  pattern: PatternSummary
  answers: Record<QuestionId, Answer>
  config: PrototypeConfig
  formatMoney: (cents: number) => string
}

type OutcomeTag = 'metadata' | 'rule' | 'askUpload' | 'askFreeform' | 'extra' | 'review'

type Effect =
  | { kind: 'metadata', field: string, value: string }
  | { kind: 'rule', ruleId: string, conditions: readonly string[], target: string | null }
  | { kind: 'blockRules', reason: string }
  | { kind: 'ask', mode: 'upload' | 'freeform', detail: string }
  | { kind: 'extra', detail: string }
  | { kind: 'review', reason: string }

type ChoiceOption = {
  value: string
  label: string
  outcome: OutcomeTag
  hint: string
  effects: readonly Effect[]
  /** Adds the upload step at the end of the task, with this as its prompt. */
  uploadPrompt?: string
  /** Shows a free-form field under the chips, whose text drives the effects. */
  collectsText?: { placeholder: string, effects: (text: string) => readonly Effect[] }
}

type BaseQuestion = {
  id: QuestionId
  theme: ThemeId
  prompt: string
  why: string
  observation: string | null
}

type InputOutcomeCase = {
  label: string | null
  outcome: OutcomeTag
  hint: string
  matches: (answer: Answer | undefined) => boolean
}

type InputOutcome = {
  outcomes: readonly InputOutcomeCase[]
  effects: (answer: Answer) => readonly Effect[]
}

type Question =
  | BaseQuestion & { kind: 'choice', options: readonly ChoiceOption[] }
  | BaseQuestion & InputOutcome & {
    kind: 'counterparty'
    namePlaceholder: string
    categoryLabel: string
    suggestedCategories: readonly string[]
    otherCategories: readonly string[]
  }
  | BaseQuestion & InputOutcome & { kind: 'text', placeholder: string }
  | BaseQuestion & InputOutcome & { kind: 'statement' }

type PlanRule = { conditions: readonly string[], target: string }

type Plan = {
  metadata: ReadonlyArray<{ field: string, value: string }>
  rules: readonly PlanRule[]
  blockedRuleReason: string | null
  asks: ReadonlyArray<{ mode: 'upload' | 'freeform', detail: string }>
  extras: readonly string[]
  reviews: readonly string[]
}

const MAIN_RULE = 'main'
const INBOUND_RULE = 'inbound'
const REFUND_RULE = 'refund'

const OUT = BankTransactionDirection.Debit
const IN = BankTransactionDirection.Credit

const OTHER_CATEGORY = 'other'
const VARIES_CATEGORY = 'varies'

const EMPTY_ANSWER: Answer = { choice: null, text: '', detail: null }

// Every id gets a slot up front so each field has a static, typed path in the form.
const EMPTY_ANSWERS = Object.fromEntries(QUESTION_IDS.map(id => [id, EMPTY_ANSWER])) as Record<QuestionId, Answer>

const EMPTY_VALUES: AccountMaskAskFormValues = {
  accountType: null,
  answers: EMPTY_ANSWERS,
  uploads: { files: [] },
}

const accountMaskAskFormOptions = formOptions({ defaultValues: EMPTY_VALUES })

const ACCOUNT_TYPE_OPTIONS: ReadonlyArray<{ value: AccountType, label: string, short: string }> = [
  { value: 'vendor', label: 'A vendor I pay', short: 'Vendor' },
  { value: 'customer', label: 'A customer who pays me', short: 'Customer' },
  { value: 'owned', label: 'Another account my business owns', short: 'Owned business account' },
  { value: 'personal', label: 'A personal account', short: 'Personal' },
  { value: 'unsure', label: 'Not sure', short: 'Unknown' },
]

const TASK_TITLES: Record<TaskTitleKey, { describe: string, title: (mask: string) => string }> = {
  identify: { describe: 'Help us identify account ••2691', title: mask => `Help us identify account ••${mask}` },
  whoIs: { describe: 'Who is account ••2691?', title: mask => `Who is account ••${mask}?` },
  unrecognized: { describe: 'Unrecognized account ending in 2691', title: mask => `Unrecognized account ending in ${mask}` },
  tellUs: { describe: 'Tell us about account ••2691', title: mask => `Tell us about account ••${mask}` },
  current: { describe: 'New account transfer (today)', title: () => 'New account transfer' },
}

const GROUPING_ACCOUNTS = new Set(['Expenses', 'Operating Expenses', 'Uncategorized Expenses', 'Revenue', 'Uncategorized Revenue'])

const VENDOR_CATEGORIES = ['Software', 'Contractors', 'Office Expenses', 'Rent', 'Legal and Professional Services']
const REVENUE_CATEGORIES = ['Service revenue', 'Product sales', 'Retainers', 'Subscription revenue']
const ACCOUNT_PURPOSES = ['Payroll', 'Tax reserve', 'Savings', 'Payouts']
const CADENCES = ['Monthly', 'Quarterly', 'Yearly']

const otherCategoriesOfType = (accountType: LedgerAccountType.Expense | LedgerAccountType.Revenue, suggested: readonly string[]) =>
  chartOfAccounts
    .filter(account => account.accountType.value === accountType)
    .map(({ name }) => name)
    .filter(name => !GROUPING_ACCOUNTS.has(name) && !suggested.includes(name))

const UPLOAD_EXTENSIONS = ['.pdf', '.xlsx', '.docx', '.png', '.jpg', '.jpeg', '.txt', '.csv']
const UPLOAD_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'text/plain',
  'text/csv',
]
const UPLOAD_ACCEPT = [...UPLOAD_EXTENSIONS, ...UPLOAD_MIME_TYPES].join(',')
const UPLOAD_TYPES_LABEL = 'PDF, XLSX, DOCX, PNG, JPG, TXT or CSV'

// The picker's accept filter can be switched to "All files", so the extension is checked again here.
const isAllowedUpload = ({ name }: File) => UPLOAD_EXTENSIONS.some(extension => name.toLowerCase().endsWith(extension))

const OUTCOME_TAGS: Record<OutcomeTag, { label: string, variant: BadgeVariant }> = {
  metadata: { label: 'Metadata only', variant: BadgeVariant.NEUTRAL },
  rule: { label: 'Outcome 1 · Rule', variant: BadgeVariant.SUCCESS },
  askUpload: { label: 'Outcome 2a · Upload', variant: BadgeVariant.INFO },
  askFreeform: { label: 'Outcome 2b · Freeform', variant: BadgeVariant.INFO },
  extra: { label: 'Side effect', variant: BadgeVariant.DEFAULT },
  review: { label: 'Bookkeeper review', variant: BadgeVariant.WARNING },
}

const metadata = (field: string, value: string): Effect => ({ kind: 'metadata', field, value })
const rule = (ruleId: string, { conditions = [], target = null }: { conditions?: readonly string[], target?: string | null }): Effect =>
  ({ kind: 'rule', ruleId, conditions, target })
const blockRules = (reason: string): Effect => ({ kind: 'blockRules', reason })
const ask = (mode: 'upload' | 'freeform', detail: string): Effect => ({ kind: 'ask', mode, detail })
const extra = (detail: string): Effect => ({ kind: 'extra', detail })
const review = (reason: string): Effect => ({ kind: 'review', reason })

const accountCondition = (mask: string) => `Account ends in ${mask}`

const makeTransaction = (
  index: number,
  month: number,
  day: number,
  amount: number,
  direction: BankTransactionDirection,
  description: string,
): MockTransaction => ({
  id: `txn-${index}`,
  date: new Date(FIXTURE_YEAR, month - 1, day),
  amount,
  direction,
  description,
})

const makeTransactions = (pattern: TransactionPattern, mask: string): readonly MockTransaction[] => {
  switch (pattern) {
    case 'fixedMonthlyTransfers':
      return [5, 6, 7, 8, 9].map((month, index) =>
        makeTransaction(index, month, 16, 100000, OUT, `ONLINE TRANSFER TO XXXXXX${mask} REF #${4810 + index}`))
    case 'variableBills':
      return [
        makeTransaction(0, 5, 3, 42150, OUT, `ACH DEBIT XXXXXX${mask} INV 1042`),
        makeTransaction(1, 6, 2, 18700, OUT, `ACH DEBIT XXXXXX${mask} INV 1057`),
        makeTransaction(2, 6, 28, 96025, OUT, `ACH DEBIT XXXXXX${mask} INV 1063`),
        makeTransaction(3, 8, 4, 31000, OUT, `ACH DEBIT XXXXXX${mask} INV 1080`),
        makeTransaction(4, 8, 19, 4500, IN, `ACH CREDIT XXXXXX${mask} CREDIT MEMO`),
      ]
    case 'customerDeposits':
      return [
        makeTransaction(0, 5, 9, 240000, IN, `ACH CREDIT XXXXXX${mask} PAYMENT`),
        makeTransaction(1, 6, 11, 185000, IN, `ACH CREDIT XXXXXX${mask} PAYMENT`),
        makeTransaction(2, 7, 8, 312500, IN, `ACH CREDIT XXXXXX${mask} PAYMENT`),
        makeTransaction(3, 8, 12, 240000, IN, `ACH CREDIT XXXXXX${mask} PAYMENT`),
      ]
    case 'loanRepayments':
      return [
        makeTransaction(0, 3, 2, 500000, IN, `TRANSFER FROM XXXXXX${mask}`),
        ...[4, 5, 6, 7, 8, 9].map((month, index) =>
          makeTransaction(index + 1, month, 1, 50000, OUT, `TRANSFER TO XXXXXX${mask}`)),
      ]
  }
}

const PATTERN_DESCRIPTIONS: Record<TransactionPattern, string> = {
  fixedMonthlyTransfers: '5 × $1,000 out, monthly (matches the current task)',
  variableBills: '4 variable payments out + 1 small deposit back',
  customerDeposits: '4 variable deposits in',
  loanRepayments: '$5,000 in, then 6 × $500 out (looks like a loan)',
}

const DAY_MS = 24 * 60 * 60 * 1000

const summarizePattern = (transactions: readonly MockTransaction[]): PatternSummary => {
  const inflows = transactions.filter(({ direction }) => direction === IN)
  const outflows = transactions.filter(({ direction }) => direction === OUT)
  const dominant = outflows.length >= inflows.length ? outflows : inflows
  const amounts = dominant.map(({ amount }) => amount)
  const dates = transactions.map(({ date }) => date.getTime()).sort((a, b) => a - b)
  const gaps = dates.slice(1).map((time, index) => (time - (dates[index] ?? time)) / DAY_MS)
  const [firstInflow] = inflows
  const firstOutflow = outflows[0]
  const looksLikeLoan = inflows.length === 1
    && outflows.length >= 2
    && new Set(outflows.map(({ amount }) => amount)).size === 1
    && firstInflow !== undefined
    && firstOutflow !== undefined
    && firstInflow.date < firstOutflow.date

  return {
    count: transactions.length,
    inflowCount: inflows.length,
    outflowCount: outflows.length,
    dominantCount: dominant.length,
    fixedAmount: new Set(amounts).size === 1 ? (amounts[0] ?? null) : null,
    minAmount: Math.min(...amounts),
    maxAmount: Math.max(...amounts),
    isMonthly: gaps.length > 0 && gaps.every(gap => gap >= 26 && gap <= 36),
    loan: looksLikeLoan
      ? { principal: firstInflow.amount, payment: firstOutflow.amount, paymentCount: outflows.length }
      : null,
  }
}

/** The category a counterparty answer settles on; `varies` when it's a mix. */
const resolveCategory = ({ choice, detail }: Answer) => (choice === OTHER_CATEGORY ? detail : choice)

const getCategory = (answers: Record<QuestionId, Answer>) => {
  const category = resolveCategory(answers.counterparty)

  return category && category !== VARIES_CATEGORY ? category : null
}

const notSureOption = (subject: string): ChoiceOption => ({
  value: 'not_sure',
  label: 'Not sure',
  outcome: 'review',
  hint: `Low-confidence answer: a bookkeeper reviews ${subject} before anything is automated.`,
  effects: [review(`Unsure about ${subject}`)],
})

type CounterpartyQuestionSpec = {
  role: 'Vendor' | 'Customer'
  prompt: string
  why: string
  categoryLabel: string
  suggestedCategories: readonly string[]
  otherCategories: readonly string[]
  variesDetail: string
}

const counterpartyQuestion = ({
  role,
  prompt,
  why,
  categoryLabel,
  suggestedCategories,
  otherCategories,
  variesDetail,
}: CounterpartyQuestionSpec): Question => ({
  kind: 'counterparty',
  id: 'counterparty',
  theme: 'who',
  prompt,
  why,
  observation: null,
  namePlaceholder: `${role} name`,
  categoryLabel,
  suggestedCategories,
  otherCategories,
  outcomes: [
    {
      label: 'A suggested category, or one picked under Other',
      outcome: 'rule',
      hint: 'Names the counterparty and gives the rule its category.',
      matches: (answer) => {
        const category = answer ? resolveCategory(answer) : null
        return category !== null && category !== VARIES_CATEGORY
      },
    },
    {
      label: 'It’s a mix or it varies',
      outcome: 'askFreeform',
      hint: 'No main rule: each new transaction opens a task, and the answer categorizes that transaction only.',
      matches: answer => answer?.choice === VARIES_CATEGORY,
    },
  ],
  effects: (answer) => {
    const category = resolveCategory(answer)

    return [
      metadata('counterparty.name', answer.text.trim()),
      metadata('counterparty.role', role),
      ...(category === VARIES_CATEGORY
        ? [
          metadata('counterparty.category', 'Mixed / varies per transaction'),
          blockRules('It’s a mix or varies per transaction, so no single category fits'),
          ask('freeform', variesDetail),
        ]
        : category ? [metadata('counterparty.category', category), rule(MAIN_RULE, { target: category })] : []),
    ]
  },
})

const amountQuestion = ({ pattern, formatMoney }: AskContext, noun: 'payments' | 'deposits'): Question => {
  const { fixedAmount } = pattern

  return {
    kind: 'choice',
    id: 'amount',
    theme: 'nature',
    prompt: 'Is it the same amount every time, or does it vary per invoice?',
    why: 'Decides whether the rule can match on amount, or only on the account and direction.',
    observation: fixedAmount !== null
      ? `All ${pattern.dominantCount} ${noun} were ${formatMoney(fixedAmount)}.`
      : `These ${noun} ranged from ${formatMoney(pattern.minAmount)} to ${formatMoney(pattern.maxAmount)}.`,
    options: [
      {
        value: 'fixed',
        label: 'Same amount every time',
        outcome: 'rule',
        hint: fixedAmount !== null
          ? `Rule matches account + ${formatMoney(fixedAmount)} + direction.`
          : 'Rule matches account + the usual amount + direction.',
        effects: [
          metadata('amount.pattern', 'Fixed'),
          rule(MAIN_RULE, { conditions: [fixedAmount !== null ? `Amount is ${formatMoney(fixedAmount)}` : 'Amount matches the usual amount'] }),
        ],
      },
      {
        value: 'per_invoice',
        label: 'It varies per invoice',
        outcome: 'rule',
        hint: 'Rule matches account + direction only (counterparty-only rule).',
        effects: [metadata('amount.pattern', 'Per invoice')],
      },
      notSureOption('the amount pattern'),
    ],
  }
}

const billsQuestion = ({ config }: AskContext, vendorName: string): Question => {
  const why = 'Enables bill-to-payment matching and user-submitted vendor bills.'
  const uploadPrompt = `Upload the bills ${vendorName} sent for these payments.`
  const parseNow = extra('Parse the uploaded bills with receipt parsing and match each one to its payment')
  const askEachPayment = ask('upload', `Each new payment to ${vendorName} opens a task asking for its bill; receipt parsing matches it to the payment`)

  if (config.billUploadStyle === 'statement') {
    return {
      kind: 'statement',
      id: 'bills',
      theme: 'handling',
      prompt: `For more accurate books, you can upload the bills ${vendorName} sends you from any of these transactions.`,
      why,
      observation: null,
      outcomes: [{
        label: null,
        outcome: 'metadata',
        hint: 'Informational only: no task is created, and uploads stay optional on each transaction.',
        matches: () => false,
      }],
      effects: () => [metadata('bills.prompt', 'Shown as a statement')],
    }
  }

  return {
    kind: 'choice',
    id: 'bills',
    theme: 'handling',
    prompt: `For more accurate books, you can upload the bills ${vendorName} sends you.`,
    why,
    observation: null,
    options: [
      {
        value: 'upload_now_and_ask',
        label: 'Upload a bill now, and ask me with each payment',
        outcome: 'askUpload',
        hint: 'Today’s bills are parsed and matched at the end of this task, and each new payment opens a task asking for its bill.',
        uploadPrompt,
        effects: [parseNow, askEachPayment],
      },
      {
        value: 'upload_now',
        label: 'Upload a bill now, just this time',
        outcome: 'askUpload',
        hint: 'Bills uploaded at the end of this task are parsed and matched; no future bills are requested.',
        uploadPrompt,
        effects: [parseNow],
      },
      {
        value: 'ask_each',
        label: 'Ask me for the bill with each payment',
        outcome: 'askUpload',
        hint: 'Each new payment opens a task asking for its bill → receipt parsing → bill-to-payment match.',
        effects: [askEachPayment],
      },
      {
        value: 'skip',
        label: 'Not now',
        outcome: 'metadata',
        hint: 'Nothing is requested; the rule still categorizes the payments.',
        effects: [metadata('bills.prompt', 'Skipped')],
      },
    ],
  }
}

const buildVendorQuestions = (ctx: AskContext): Question[] => {
  const { answers, pattern, mask } = ctx
  const category = getCategory(answers) ?? 'vendor purchases'
  const vendorName = answers.counterparty.text.trim() || 'this vendor'

  return [
    counterpartyQuestion({
      role: 'Vendor',
      prompt: 'What’s the vendor’s name, and what do you buy from them?',
      why: 'Sets the counterparty and the expense category.',
      categoryLabel: 'What you buy from them',
      suggestedCategories: VENDOR_CATEGORIES,
      otherCategories: otherCategoriesOfType(LedgerAccountType.Expense, VENDOR_CATEGORIES),
      variesDetail: 'Each new payment to this vendor opens a freeform task; the answer categorizes that payment only',
    }),
    {
      kind: 'choice',
      id: 'contractor',
      theme: 'who',
      prompt: `Is ${vendorName} an individual or contractor rather than a company?`,
      why: 'Triggers W-9 collection and 1099 tracking.',
      observation: null,
      options: [
        {
          value: 'individual',
          label: 'An individual or contractor',
          outcome: 'extra',
          hint: 'Requests a W-9 and tracks payments toward a 1099-NEC.',
          effects: [
            metadata('counterparty.entity', 'Individual / contractor'),
            extra('Open a W-9 upload task and track payments toward a 1099-NEC'),
          ],
        },
        {
          value: 'company',
          label: 'A company',
          outcome: 'metadata',
          hint: 'Recorded only; no 1099 tracking.',
          effects: [metadata('counterparty.entity', 'Company')],
        },
        notSureOption('1099 eligibility'),
      ],
    },
    amountQuestion(ctx, 'payments'),
    {
      kind: 'choice',
      id: 'recurring',
      theme: 'nature',
      prompt: 'Is this a recurring payment? If so, how often?',
      why: 'Lets us auto-categorize and flag a missed or unusual payment.',
      observation: pattern.isMonthly ? 'These landed about a month apart.' : null,
      options: [
        ...CADENCES.map((cadence): ChoiceOption => ({
          value: cadence.toLowerCase(),
          label: cadence,
          outcome: 'extra',
          hint: `Expects a ${cadence.toLowerCase()} payment and flags a missed or unusually large one.`,
          effects: [
            metadata('schedule.cadence', cadence),
            extra(`Watch for a ${cadence.toLowerCase()} payment to ${vendorName}; flag a missed or unusual one`),
          ],
        })),
        {
          value: 'one_off',
          label: 'Not recurring',
          outcome: 'metadata',
          hint: 'Recorded only; there is no schedule to watch.',
          effects: [metadata('schedule.cadence', 'One-off')],
        },
      ],
    },
    {
      kind: 'choice',
      id: 'refunds',
      theme: 'nature',
      prompt: `Do you ever receive money back from ${vendorName}?`,
      why: 'Adds a direction-aware rule so refunds aren’t categorized as income.',
      observation: pattern.inflowCount > 0 ? `We’ve already seen ${pattern.inflowCount} deposit(s) from this account.` : null,
      options: [
        {
          value: 'yes',
          label: 'Yes, sometimes',
          outcome: 'rule',
          hint: 'Adds a second rule: money in from this account is a refund, not income.',
          effects: [rule(REFUND_RULE, { conditions: [accountCondition(mask), 'Money in'], target: `Refund of ${category}` })],
        },
        {
          value: 'no',
          label: 'No, I only pay them',
          outcome: 'metadata',
          hint: 'Deposits from this account stay uncategorized and get asked about.',
          effects: [metadata('counterparty.refunds', 'None expected')],
        },
      ],
    },
    billsQuestion(ctx, vendorName),
  ]
}

const buildCustomerQuestions = (ctx: AskContext): Question[] => {
  const { answers, mask, config } = ctx
  const category = getCategory(answers)
  const isVaried = answers.counterparty.choice === VARIES_CATEGORY
  const customerName = answers.counterparty.text.trim() || 'this customer'
  const ruleSuggestion = config.suggestRuleAfter > 0
    ? ` After ${config.suggestRuleAfter} consistent answers we suggest turning it into a rule.`
    : ''

  return [
    counterpartyQuestion({
      role: 'Customer',
      prompt: 'Who is the customer, and what are they paying for?',
      why: 'Sets the counterparty and the revenue category.',
      categoryLabel: 'What they pay for',
      suggestedCategories: REVENUE_CATEGORIES,
      otherCategories: otherCategoriesOfType(LedgerAccountType.Revenue, REVENUE_CATEGORIES),
      variesDetail: 'Each deposit from this customer opens a freeform task; the answer categorizes that deposit only',
    }),
    amountQuestion(ctx, 'deposits'),
    {
      kind: 'choice',
      id: 'refunds',
      theme: 'nature',
      prompt: `Do you ever send money back to ${customerName}?`,
      why: 'Adds a direction-aware rule for refunds.',
      observation: null,
      options: [
        {
          value: 'yes',
          label: 'Yes, refunds sometimes',
          outcome: 'rule',
          hint: 'Adds a second rule: money out to this account is a refund of revenue.',
          effects: [rule(REFUND_RULE, { conditions: [accountCondition(mask), 'Money out'], target: `Refund of ${category ?? 'revenue'}` })],
        },
        {
          value: 'no',
          label: 'No',
          outcome: 'metadata',
          hint: 'Payments to this account stay uncategorized and get asked about.',
          effects: [metadata('counterparty.refunds', 'None expected')],
        },
      ],
    },
    {
      kind: 'choice',
      id: 'handling',
      theme: 'handling',
      prompt: `How should we handle future deposits from ${customerName}?`,
      why: 'Chooses between a rule, document evidence for revenue matching, or a question per deposit.',
      observation: null,
      options: [
        ...(isVaried
          ? []
          : [{
            value: 'tell_once',
            label: category ? `Always categorize them as ${category}` : 'Always categorize them the same way',
            outcome: 'rule',
            hint: 'Creates the counterparty rule, so you won’t be asked again.',
            effects: [metadata('deposits.handling', 'Rule')],
          } satisfies ChoiceOption]),
        {
          value: 'upload',
          label: 'I’ll upload the invoice or receipt',
          outcome: 'askUpload',
          hint: 'Each deposit opens a task requesting the invoice; receipt parsing reads it and matches the revenue.',
          effects: [
            metadata('deposits.handling', 'Upload per deposit'),
            blockRules('Deposits are categorized from the uploaded invoices instead'),
            ask('upload', `Each deposit from ${customerName} opens a task requesting the invoice or receipt; receipt parsing matches it to revenue`),
          ],
        },
        {
          value: 'ask_each',
          label: 'Ask me about each deposit',
          outcome: 'askFreeform',
          hint: `Each deposit opens a task, and the answer categorizes that deposit only.${ruleSuggestion}`,
          effects: [
            metadata('deposits.handling', 'Ask per deposit'),
            blockRules('Deposits are categorized one at a time from your answers'),
            ask('freeform', `Each deposit from ${customerName} opens a freeform task that categorizes that deposit.${ruleSuggestion}`),
          ],
        },
      ],
    },
  ]
}

const buildOwnedQuestions = ({ mask }: AskContext): Question[] => [
  {
    kind: 'choice',
    id: 'purpose',
    theme: 'who',
    prompt: 'What’s this account used for?',
    why: 'Names the account and sets the transfer rule.',
    observation: null,
    options: [
      ...ACCOUNT_PURPOSES.map((purpose): ChoiceOption => ({
        value: purpose.toLowerCase(),
        label: purpose,
        outcome: 'rule',
        hint: `Names it “${purpose} ••${mask}” and books every transfer as a transfer, not P&L.`,
        effects: [
          metadata('account.purpose', purpose),
          metadata('account.name', `${purpose} ••${mask}`),
          rule(MAIN_RULE, { target: `Transfer to ${purpose} ••${mask} (excluded from P&L)` }),
        ],
      })),
      {
        value: 'other',
        label: 'Something else',
        outcome: 'rule',
        hint: 'Your description names the account and books every transfer as a transfer, not P&L.',
        effects: [],
        collectsText: {
          placeholder: 'e.g. Equipment fund for the new location',
          effects: text => [
            metadata('account.purpose', text),
            metadata('account.name', `${text} ••${mask}`),
            rule(MAIN_RULE, { target: `Transfer to ${text} ••${mask} (excluded from P&L)` }),
          ],
        },
      },
    ],
  },
  {
    kind: 'choice',
    id: 'connect',
    theme: 'handling',
    prompt: 'Can you connect this account so we can pull your transactions for you automatically, or do you want to upload its statements manually?',
    why: 'Shows both sides of each transfer, so internal transfers stay off the P&L.',
    observation: null,
    options: [
      {
        value: 'connect',
        label: 'Connect it',
        outcome: 'extra',
        hint: 'Opens the bank connection flow; transfers reconcile against the other side.',
        effects: [metadata('account.source', 'Connection'), extra('Launch the bank connection flow so both sides of each transfer reconcile')],
      },
      {
        value: 'statements',
        label: 'Upload statements',
        outcome: 'askUpload',
        hint: 'Statements are uploaded at the end of this task, then a monthly task requests the next one.',
        uploadPrompt: `Upload recent statements for the account ending in ${mask}.`,
        effects: [
          metadata('account.source', 'Statements'),
          ask('upload', `Each month opens a task requesting the ••${mask} statement; parsing it reconciles the transfers`),
        ],
      },
      {
        value: 'neither',
        label: 'Neither right now',
        outcome: 'review',
        hint: 'Transfers can’t be reconciled without the other side, so a bookkeeper reviews them.',
        effects: [review('Transfers to an unconnected owned account can’t be reconciled')],
      },
    ],
  },
]

const buildPersonalQuestions = ({ pattern, formatMoney }: AskContext): Question[] => [
  {
    kind: 'choice',
    id: 'whose',
    theme: 'who',
    prompt: 'Whose account is it?',
    why: 'Determines owner vs. related-party treatment.',
    observation: null,
    options: [
      {
        value: 'mine',
        label: 'Mine',
        outcome: 'rule',
        hint: 'Money out → owner draw; money in → owner contribution.',
        effects: [
          metadata('account.owner', 'Owner'),
          rule(MAIN_RULE, { target: 'Owner draw' }),
          rule(INBOUND_RULE, { target: 'Owner contribution' }),
        ],
      },
      {
        value: 'co_owner',
        label: 'A co-owner',
        outcome: 'rule',
        hint: 'Money out → partner draw; money in → partner contribution, tracked per owner.',
        effects: [
          metadata('account.owner', 'Co-owner'),
          rule(MAIN_RULE, { target: 'Partner draw' }),
          rule(INBOUND_RULE, { target: 'Partner contribution' }),
        ],
      },
      {
        value: 'family',
        label: 'A family member',
        outcome: 'rule',
        hint: 'Booked as related-party balances and flagged for disclosure.',
        effects: [
          metadata('account.owner', 'Family member'),
          rule(MAIN_RULE, { target: 'Due from related party' }),
          rule(INBOUND_RULE, { target: 'Due to related party' }),
          extra('Flag the counterparty for related-party disclosure'),
        ],
      },
    ],
  },
  ...(pattern.loan
    ? [{
      kind: 'choice',
      id: 'loan',
      theme: 'nature',
      prompt: 'Is this a loan, or regular draws and contributions?',
      why: 'Only asked because a lump sum followed by fixed repayments looks like a loan.',
      observation: `We noticed a ${formatMoney(pattern.loan.principal)} deposit followed by ${pattern.loan.paymentCount} payments of ${formatMoney(pattern.loan.payment)}.`,
      options: [
        {
          value: 'loan',
          label: 'It’s a loan',
          outcome: 'rule',
          hint: 'Deposit → loan payable; repayments → loan repayment. A bookkeeper splits out interest.',
          effects: [
            metadata('account.relationship', 'Loan'),
            rule(INBOUND_RULE, { target: 'Loan payable (proceeds)' }),
            rule(MAIN_RULE, { target: 'Loan repayment (principal + interest)' }),
            extra('Bookkeeper sets up the loan schedule and splits interest from principal'),
          ],
        },
        {
          value: 'regular',
          label: 'Regular draws and contributions',
          outcome: 'metadata',
          hint: 'Keeps the owner draw / contribution rules from the previous answer.',
          effects: [metadata('account.relationship', 'Draws and contributions')],
        },
        notSureOption('whether this is a loan'),
      ],
    } satisfies Question]
    : []),
]

const buildUnsureQuestions = (): Question[] => [
  {
    kind: 'text',
    id: 'details',
    theme: 'who',
    prompt: 'Tell us anything you know about this account.',
    why: 'Free text goes to a bookkeeper, who classifies the account.',
    observation: null,
    placeholder: 'e.g. I think it’s my spouse’s checking account',
    outcomes: [{
      label: null,
      outcome: 'askFreeform',
      hint: 'A bookkeeper classifies the account; until then, each new transfer opens a freeform task.',
      matches: () => false,
    }],
    effects: ({ text }) => [
      metadata('account.note', text.trim()),
      review('Account type unknown; a bookkeeper classifies it from your note'),
      ask('freeform', 'Each new transfer opens a freeform task until the account is classified'),
    ],
  },
]

const buildQuestions = (type: AccountType, ctx: AskContext): Question[] => {
  switch (type) {
    case 'vendor': return buildVendorQuestions(ctx)
    case 'customer': return buildCustomerQuestions(ctx)
    case 'owned': return buildOwnedQuestions(ctx)
    case 'personal': return buildPersonalQuestions(ctx)
    case 'unsure': return buildUnsureQuestions()
  }
}

const getTypeLabel = (type: AccountType) => ACCOUNT_TYPE_OPTIONS.find(({ value }) => value === type)?.short ?? type

const baseEffects = (type: AccountType, mask: string): Effect[] => {
  const account = accountCondition(mask)
  const common = [metadata('account.mask', `••${mask}`), metadata('account.type', getTypeLabel(type))]

  switch (type) {
    case 'vendor': return [...common, rule(MAIN_RULE, { conditions: [account, 'Money out'] })]
    case 'customer': return [...common, rule(MAIN_RULE, { conditions: [account, 'Money in'] })]
    case 'owned': return [...common, rule(MAIN_RULE, { conditions: [account] })]
    case 'personal': return [
      ...common,
      rule(MAIN_RULE, { conditions: [account, 'Money out'] }),
      rule(INBOUND_RULE, { conditions: [account, 'Money in'] }),
    ]
    case 'unsure': return common
  }
}

const getSelectedOption = (question: Question, answer: Answer) =>
  (question.kind === 'choice' ? question.options.find(({ value }) => value === answer.choice) : undefined)

const isAnswered = (question: Question, answer: Answer) => {
  switch (question.kind) {
    case 'choice': {
      const option = getSelectedOption(question, answer)

      return option !== undefined && (!option.collectsText || answer.text.trim() !== '')
    }
    case 'counterparty': return answer.text.trim() !== '' && resolveCategory(answer) !== null
    case 'text': return answer.text.trim() !== ''
    case 'statement': return true
  }
}

const getAnswerEffects = (question: Question, answer: Answer): readonly Effect[] => {
  if (!isAnswered(question, answer)) return []

  if (question.kind !== 'choice') return question.effects(answer)

  const option = getSelectedOption(question, answer)

  if (!option) return []

  return [...option.effects, ...(option.collectsText ? option.collectsText.effects(answer.text.trim()) : [])]
}

const getAnswerLabel = (question: Question, answer: Answer) => {
  if (!isAnswered(question, answer)) return null

  switch (question.kind) {
    case 'choice': {
      const option = getSelectedOption(question, answer)
      return option?.collectsText ? answer.text.trim() : (option?.label ?? null)
    }
    case 'counterparty': {
      const category = resolveCategory(answer)
      return `${answer.text.trim()} · ${category === VARIES_CATEGORY ? 'It’s a mix or it varies' : category}`
    }
    case 'text': return answer.text.trim()
    case 'statement': return 'Seen'
  }
}

const getUploadPrompts = (questions: readonly Question[], answers: Record<QuestionId, Answer>) =>
  questions.flatMap(question => getSelectedOption(question, answers[question.id])?.uploadPrompt ?? [])

const getSteps = (questions: readonly Question[], answers: Record<QuestionId, Answer>): StepId[] => [
  ...THEMES.filter(({ id }) => questions.some(({ theme }) => theme === id)).map(({ id }) => id),
  ...(getUploadPrompts(questions, answers).length > 0 ? ['uploads' as const] : []),
  'review',
]

const buildPlan = (type: AccountType, questions: readonly Question[], ctx: AskContext, files: readonly UploadedFile[]): Plan => {
  const effects = [
    ...baseEffects(type, ctx.mask),
    ...questions.flatMap(question => getAnswerEffects(question, ctx.answers[question.id])),
    ...(files.length > 0 ? [metadata('documents.uploaded', files.map(({ name }) => name).join(', '))] : []),
  ]

  const metadataByField = new Map<string, string>()
  const rules = new Map<string, { conditions: readonly string[], target: string | null }>()
  const asks: Array<{ mode: 'upload' | 'freeform', detail: string }> = []
  const extras: string[] = []
  const reviews: string[] = []
  let blockedRuleReason: string | null = null

  for (const effect of effects) {
    switch (effect.kind) {
      case 'metadata':
        metadataByField.set(effect.field, effect.value)
        break
      case 'rule': {
        const current = rules.get(effect.ruleId) ?? { conditions: [], target: null }
        rules.set(effect.ruleId, {
          conditions: [...new Set([...current.conditions, ...effect.conditions])],
          target: effect.target ?? current.target,
        })
        break
      }
      case 'blockRules':
        blockedRuleReason = effect.reason
        break
      case 'ask':
        asks.push({ mode: effect.mode, detail: effect.detail })
        break
      case 'extra':
        extras.push(effect.detail)
        break
      case 'review':
        reviews.push(effect.reason)
        break
    }
  }

  const completeRules = [...rules].flatMap(([ruleId, { conditions, target }]) =>
    (target && !(blockedRuleReason && ruleId === MAIN_RULE) ? [{ conditions, target }] : []))

  return {
    metadata: [...metadataByField].map(([field, value]) => ({ field, value })),
    rules: completeRules,
    blockedRuleReason,
    asks,
    extras,
    reviews,
  }
}

const makeTask = (title: string, status: BusinessTaskStatus.Todo | BusinessTaskStatus.UserMarkedCompleted): UserVisibleTask => ({
  id: '00000000-0000-4000-8000-000000000b01',
  status,
  title,
  question: '',
  taskType: null,
  userResponse: null,
  userResponseType: TaskUserResponseType.FreeResponse,
  documents: null,
})

const OutcomeBadge = ({ outcome }: { outcome: OutcomeTag }) => {
  const { label, variant } = OUTCOME_TAGS[outcome]

  return <Badge size={BadgeSize.EXTRA_SMALL} variant={variant}>{label}</Badge>
}

const TransactionTable = ({ transactions }: { transactions: readonly MockTransaction[] }) => {
  const { formatDate } = useIntlFormatter()

  return (
    <VStack className='Layer__CounterpartyAskTask__Rows AccountMaskAskStory__Rows'>
      {transactions.map(({ id, date, amount, direction, description }) => (
        <VStack key={id} className='Layer__CounterpartyAskTask__Row' pi='md'>
          <HStack className='Layer__CounterpartyAskTask__RowSummary' align='center' gap='xs' overflow='hidden' fluid>
            <Span className='Layer__CounterpartyAskTask__RowSummaryDate' size='xs' variant='subtle' noWrap>
              {formatDate(date, DateFormat.MonthDayShort)}
            </Span>
            <Span className='Layer__CounterpartyAskTask__RowSummaryDescription' size='sm' variant='subtle' ellipsis noWrap>
              {description}
            </Span>
            <MoneySpan
              className='Layer__CounterpartyAskTask__RowSummaryAmount'
              size='sm'
              weight='bold'
              numeric='tabular-nums'
              align='right'
              amount={direction === OUT ? -amount : amount}
              displayPlusSign={direction === IN}
            />
          </HStack>
        </VStack>
      ))}
    </VStack>
  )
}

const AccountTypePane = withForm({
  ...accountMaskAskFormOptions,
  props: {
    prompt: '',
    onPick: (_type: AccountType) => {},
  },
  render: function Render({ form, prompt, onPick }) {
    return (
      <VStack gap='sm' pb='md' pi='md'>
        <P size='sm'>{prompt}</P>
        <VStack>
          <form.AppField name='accountType'>
            {field => (
              <field.FormChipGroupField
                label='What kind of account this is'
                showLabel={false}
                size='lg'
                options={ACCOUNT_TYPE_OPTIONS.map(({ value, label }) => ({ value, label }))}
                onSelect={onPick}
              />
            )}
          </form.AppField>
        </VStack>
      </VStack>
    )
  },
})

const QuestionHeading = ({ question }: { question: Question }) => <P size='sm'>{question.prompt}</P>

const QuestionField = withForm({
  ...accountMaskAskFormOptions,
  props: {
    question: null as Question | null,
  },
  render: function Render({ form, question }) {
    const answer = useStore(form.store, state => (question ? state.values.answers[question.id] : EMPTY_ANSWER))

    if (!question) return null

    switch (question.kind) {
      case 'choice': {
        const selected = getSelectedOption(question, answer)

        return (
          <VStack gap='xs'>
            <QuestionHeading question={question} />
            <form.AppField name={`answers.${question.id}.choice`}>
              {field => (
                <field.FormChipGroupField
                  label={question.prompt}
                  showLabel={false}
                  options={question.options.map(({ value, label }) => ({ value, label }))}
                />
              )}
            </form.AppField>
            {selected?.collectsText
              ? (
                <form.AppField name={`answers.${question.id}.text`}>
                  {field => (
                    <field.FormTextField label={question.prompt} showLabel={false} placeholder={selected.collectsText?.placeholder} />
                  )}
                </form.AppField>
              )
              : null}
          </VStack>
        )
      }
      case 'counterparty':
        return (
          <VStack gap='xs'>
            <QuestionHeading question={question} />
            <form.AppField name={`answers.${question.id}.text`}>
              {field => <field.FormTextField label={question.namePlaceholder} showLabel={false} placeholder={question.namePlaceholder} />}
            </form.AppField>
            <form.AppField name={`answers.${question.id}.choice`}>
              {field => (
                <field.FormChipGroupField
                  label={question.categoryLabel}
                  showLabel={false}
                  options={[
                    ...question.suggestedCategories.map(category => ({ value: category, label: category })),
                    { value: OTHER_CATEGORY, label: 'Other' },
                    { value: VARIES_CATEGORY, label: 'It’s a mix or it varies' },
                  ]}
                />
              )}
            </form.AppField>
            {answer.choice === OTHER_CATEGORY
              ? (
                <form.Field name={`answers.${question.id}.detail`}>
                  {field => (
                    <ComboBox
                      aria-label={`Other ${question.categoryLabel.toLowerCase()} categories`}
                      placeholder='Search categories…'
                      options={question.otherCategories.map(category => ({ label: category, value: category }))}
                      selectedValue={field.state.value ? { label: field.state.value, value: field.state.value } : null}
                      onSelectedValueChange={option => field.handleChange(option?.value ?? null)}
                      isClearable
                    />
                  )}
                </form.Field>
              )
              : null}
          </VStack>
        )
      case 'text':
        return (
          <VStack gap='xs'>
            <QuestionHeading question={question} />
            <form.AppField name={`answers.${question.id}.text`}>
              {field => <field.FormTextAreaField label={question.prompt} showLabel={false} placeholder={question.placeholder} />}
            </form.AppField>
          </VStack>
        )
      case 'statement':
        return <QuestionHeading question={question} />
    }
  },
})

const ThemePane = withForm({
  ...accountMaskAskFormOptions,
  props: {
    questions: [] as readonly Question[],
    progress: '',
    onContinue: () => {},
  },
  render: function Render({ form, questions, progress, onContinue }) {
    const isComplete = useStore(form.store, state => questions.every(question => isAnswered(question, state.values.answers[question.id])))

    return (
      <form.FormGroup
        name='answers'
        validators={{
          onDynamic: ({ value }) => (questions.every(question => isAnswered(question, value[question.id]))
            ? undefined
            : 'Answer every question to continue'),
        }}
        onGroupSubmit={onContinue}
      >
        {formGroup => (
          <VStack gap='lg' pb='md' pi='md'>
            {questions.map(question => <QuestionField key={question.id} form={form} question={question} />)}
            <HStack justify='space-between' align='center'>
              <Span size='xs' variant='subtle'>{progress}</Span>
              <Button isDisabled={!isComplete} onPress={() => void formGroup.handleSubmit()}>Continue</Button>
            </HStack>
          </VStack>
        )}
      </form.FormGroup>
    )
  },
})

const UploadPane = withForm({
  ...accountMaskAskFormOptions,
  props: {
    prompts: [] as readonly string[],
    progress: '',
    onContinue: () => {},
  },
  render: function Render({ form, prompts, progress, onContinue }) {
    const [rejectedNames, setRejectedNames] = useState<readonly string[]>([])
    const fileCount = useStore(form.store, state => state.values.uploads.files.length)

    return (
      <form.FormGroup
        name='uploads'
        validators={{ onDynamic: ({ value }) => (value.files.length > 0 ? undefined : 'Add at least one file to continue') }}
        onGroupSubmit={onContinue}
      >
        {formGroup => (
          <VStack gap='md' pb='md' pi='md'>
            {prompts.map(prompt => <P key={prompt} size='sm'>{prompt}</P>)}
            <form.Field name='uploads.files'>
              {field => (
                <VStack gap='xs'>
                  {field.state.value.map(file => (
                    <FileThumb
                      key={file.id}
                      name={file.name}
                      onDelete={() => {
                        setRejectedNames([])
                        field.handleChange(field.state.value.filter(({ id }) => id !== file.id))
                      }}
                    />
                  ))}
                  {rejectedNames.length > 0
                    ? (
                      <Span size='xs' status='error'>
                        {`Couldn’t add ${rejectedNames.join(', ')}. Upload a ${UPLOAD_TYPES_LABEL} file instead.`}
                      </Span>
                    )
                    : null}
                  <HStack gap='xs' justify='space-between' align='center'>
                    <Span size='xs' variant='subtle'>{progress}</Span>
                    <HStack gap='xs' align='center'>
                      <FileInput
                        allowMultipleUploads
                        accept={UPLOAD_ACCEPT}
                        text={fileCount > 0 ? 'Add more files' : 'Select files'}
                        onUpload={(files) => {
                          const existingIds = new Set(field.state.value.map(({ id }) => id))
                          const added = files
                            .filter(isAllowedUpload)
                            .map(file => ({ id: `${file.name}-${file.size}-${file.lastModified}`, name: file.name }))
                            .filter(({ id }) => !existingIds.has(id))

                          setRejectedNames(files.filter(file => !isAllowedUpload(file)).map(({ name }) => name))
                          field.handleChange([...field.state.value, ...added])
                        }}
                      />
                      <Button isDisabled={fileCount === 0} onPress={() => void formGroup.handleSubmit()}>Continue</Button>
                    </HStack>
                  </HStack>
                </VStack>
              )}
            </form.Field>
          </VStack>
        )}
      </form.FormGroup>
    )
  },
})

const PlanSummary = ({ plan }: { plan: Plan }) => {
  const lines = [
    ...plan.rules.map(({ conditions, target }) => `We’ll automatically categorize matching transactions (${conditions.join(', ')}) as ${target}.`),
    ...plan.asks.map(({ detail }) => `${detail}.`),
    ...plan.extras.map(detail => `${detail}.`),
    ...(plan.reviews.length > 0 ? ['A bookkeeper will review the answers you weren’t sure about.'] : []),
  ]

  return (
    <VStack gap='2xs'>
      {lines.map(line => <P key={line} size='sm'>{`• ${line}`}</P>)}
    </VStack>
  )
}

type ReviewPaneProps = {
  mask: string
  accountType: AccountType
  questions: readonly Question[]
  answers: Record<QuestionId, Answer>
  files: readonly UploadedFile[]
  isSubmitting: boolean
  onSubmit: () => void
}

const ReviewPane = ({ mask, accountType, questions, answers, files, isSubmitting, onSubmit }: ReviewPaneProps) => (
  <VStack gap='md' pb='md' pi='md'>
    <P size='sm'>{`Here’s what you told us about the account ending in ${mask}:`}</P>
    <VStack gap='3xs'>
      <Span size='xs' variant='subtle'>Account type</Span>
      <Span size='sm'>{getTypeLabel(accountType)}</Span>
    </VStack>
    {THEMES.filter(({ id }) => questions.some(({ theme }) => theme === id)).map(({ id, title }) => (
      <VStack key={id} gap='xs'>
        <Span size='xs' weight='bold'>{title}</Span>
        {questions.filter(({ theme }) => theme === id).map(question => (
          <VStack key={question.id} gap='3xs'>
            <Span size='xs' variant='subtle'>{question.prompt}</Span>
            <Span size='sm'>{getAnswerLabel(question, answers[question.id]) ?? '—'}</Span>
          </VStack>
        ))}
      </VStack>
    ))}
    {files.length > 0
      ? (
        <VStack gap='3xs'>
          <Span size='xs' weight='bold'>Uploads</Span>
          <Span size='sm'>{files.map(({ name }) => name).join(', ')}</Span>
        </VStack>
      )
      : null}
    <HStack justify='end'>
      <Button isDisabled={isSubmitting} onPress={onSubmit}>Submit</Button>
    </HStack>
  </VStack>
)

type NavState = {
  view: View
  history: readonly View[]
  direction: SlidingPanesDirection
}

type AccountMaskAskStoryProps = {
  accountMask: string
  transactionPattern: TransactionPattern
  startAs: AccountType | 'picker'
  taskTitle: TaskTitleKey
} & PrototypeConfig

const AccountMaskAskStory = ({
  accountMask,
  transactionPattern,
  startAs,
  taskTitle,
  billUploadStyle,
  suggestRuleAfter,
}: AccountMaskAskStoryProps) => {
  const { formatCurrencyFromCents } = useIntlFormatter()
  const transactions = useMemo(() => makeTransactions(transactionPattern, accountMask), [transactionPattern, accountMask])
  const pattern = useMemo(() => summarizePattern(transactions), [transactions])

  const makeContext = useCallback((answers: Record<QuestionId, Answer>): AskContext => ({
    mask: accountMask,
    pattern,
    answers,
    config: { billUploadStyle, suggestRuleAfter },
    formatMoney: cents => formatCurrencyFromCents(cents),
  }), [accountMask, billUploadStyle, formatCurrencyFromCents, pattern, suggestRuleAfter])

  const initialType = startAs === 'picker' ? null : startAs
  const answeredTypeRef = useRef<AccountType | null>(initialType)
  const [isOpen, setIsOpen] = useState(true)
  const [nav, setNav] = useState<NavState>(() => (initialType
    ? { view: getSteps(buildQuestions(initialType, makeContext(EMPTY_ANSWERS)), EMPTY_ANSWERS)[0] ?? 'review', history: ['picker'], direction: 'forward' }
    : { view: 'picker', history: [], direction: 'forward' }))

  const goForward = useCallback((view: View) => setNav(current => ({
    view,
    history: [...current.history, current.view],
    direction: 'forward',
  })), [])

  const goBack = () => setNav(current => ({
    view: current.history.at(-1) ?? 'picker',
    history: current.history.slice(0, -1),
    direction: 'back',
  }))

  // The raw hook infers the same validator generics as the `withForm` panes; the wrapper pins them.
  const form = useRawAppForm({
    ...accountMaskAskFormOptions,
    defaultValues: { ...EMPTY_VALUES, accountType: initialType },
    validationLogic: revalidateLogic(),
    onSubmit: () => goForward('done'),
  })

  const values = useStore(form.store, state => state.values)
  const isSubmitting = useStore(form.store, state => state.isSubmitting)

  const { accountType, answers, uploads } = values
  const ctx = makeContext(answers)
  const questions = accountType ? buildQuestions(accountType, ctx) : []
  const steps = getSteps(questions, answers)
  const plan = accountType ? buildPlan(accountType, questions, ctx, uploads.files) : null
  const isDone = nav.view === 'done'

  // Read from the form rather than the render snapshot, so a step answered a moment ago counts.
  const nextStepAfter = (view: View): View => {
    const current = form.state.values
    const currentQuestions = current.accountType ? buildQuestions(current.accountType, makeContext(current.answers)) : []
    const currentSteps = getSteps(currentQuestions, current.answers)
    const index = view === 'picker' ? 0 : currentSteps.findIndex(step => step === view) + 1

    return currentSteps[index] ?? 'review'
  }

  const onPickType = (type: AccountType) => {
    if (type !== answeredTypeRef.current) {
      form.setFieldValue('answers', EMPTY_ANSWERS)
      form.setFieldValue('uploads', { files: [] })
      answeredTypeRef.current = type
    }

    goForward(nextStepAfter('picker'))
  }

  const progressFor = (step: StepId) => `Step ${steps.indexOf(step) + 1} of ${steps.length - 1}`

  const renderPane = () => {
    const { view } = nav

    if (view === 'picker' || !accountType) {
      return (
        <AccountTypePane
          form={form}
          prompt={`What kind of account is ••${accountMask}?`}
          onPick={onPickType}
        />
      )
    }

    if (view === 'done') {
      return (
        <VStack gap='md' pb='md' pi='md'>
          <P size='sm' weight='bold'>Thanks, we’ll take it from here.</P>
          {plan ? <PlanSummary plan={plan} /> : null}
          <HStack justify='end'>
            <Button variant='outlined' onPress={() => setNav({ view: 'picker', history: [], direction: 'back' })}>Edit answers</Button>
          </HStack>
        </VStack>
      )
    }

    if (view === 'uploads') {
      return (
        <UploadPane
          form={form}
          prompts={getUploadPrompts(questions, answers)}
          progress={progressFor('uploads')}
          onContinue={() => goForward(nextStepAfter('uploads'))}
        />
      )
    }

    if (view === 'review') {
      return (
        <ReviewPane
          mask={accountMask}
          accountType={accountType}
          questions={questions}
          answers={answers}
          files={uploads.files}
          isSubmitting={isSubmitting}
          onSubmit={() => void form.handleSubmit()}
        />
      )
    }

    return (
      <ThemePane
        form={form}
        questions={questions.filter(({ theme }) => theme === view)}
        progress={progressFor(view)}
        onContinue={() => goForward(nextStepAfter(view))}
      />
    )
  }

  const inspectedQuestions = nav.view === 'who' || nav.view === 'nature' || nav.view === 'handling'
    ? questions.filter(({ theme }) => theme === nav.view)
    : []

  return (
    <HStack gap='lg' className='AccountMaskAskStory'>
      <VStack className='AccountMaskAskStory__Task'>
        <Container name='tasks'>
          <div className='Layer__tasks-list'>
            <TasksListItemShell
              task={makeTask(TASK_TITLES[taskTitle].title(accountMask), isDone ? BusinessTaskStatus.UserMarkedCompleted : BusinessTaskStatus.Todo)}
              isOpen={isOpen}
              onToggle={() => setIsOpen(open => !open)}
              isFlush
              slotProps={{
                Header: {
                  backAction: nav.history.length > 0 && !isDone ? { isDisabled: isSubmitting, onBack: goBack } : null,
                  answer: isDone && accountType ? { kind: 'account', name: getTypeLabel(accountType) } : null,
                },
              }}
            >
              <VStack gap='md'>
                <TransactionTable transactions={transactions} />
                <SlidingPanes paneKey={nav.view} direction={nav.direction} keepInView={isOpen}>
                  {renderPane()}
                </SlidingPanes>
              </VStack>
            </TasksListItemShell>
          </div>
        </Container>
      </VStack>
      <OutcomeInspector
        plan={plan}
        questions={inspectedQuestions}
        answers={answers}
        isUploadStep={nav.view === 'uploads'}
      />
    </HStack>
  )
}

const InspectorSection = ({ title, children }: { title: string, children: ReactNode }) => (
  <VStack gap='xs' className='AccountMaskAskStory__Section'>
    <Span size='xs' weight='bold'>{title}</Span>
    {children}
  </VStack>
)

const NotTriggered = ({ children }: { children: string }) => <Span size='xs' variant='subtle'>{children}</Span>

const QuestionOutcomes = ({ question, answer }: { question: Question, answer: Answer | undefined }) => {
  if (question.kind !== 'choice') {
    return (
      <VStack gap='xs'>
        {question.outcomes.map(({ label, outcome, hint, matches }) => (
          <VStack key={hint} gap='2xs' className='AccountMaskAskStory__Option' {...toDataProperties({ selected: matches(answer) })}>
            <HStack gap='xs' align='center'>
              {label ? <Span size='xs' weight='bold'>{label}</Span> : null}
              <OutcomeBadge outcome={outcome} />
            </HStack>
            <Span size='xs' variant='subtle'>{hint}</Span>
          </VStack>
        ))}
      </VStack>
    )
  }

  return (
    <VStack gap='xs'>
      {question.options.map(option => (
        <VStack
          key={option.value}
          gap='2xs'
          className='AccountMaskAskStory__Option'
          {...toDataProperties({ selected: answer?.choice === option.value })}
        >
          <HStack gap='xs' align='center'>
            <Span size='xs' weight='bold'>{option.label}</Span>
            <OutcomeBadge outcome={option.outcome} />
          </HStack>
          <Span size='xs' variant='subtle'>{option.hint}</Span>
        </VStack>
      ))}
    </VStack>
  )
}

type OutcomeInspectorProps = {
  plan: Plan | null
  questions: readonly Question[]
  answers: Record<QuestionId, Answer>
  isUploadStep: boolean
}

const OutcomeInspector = ({ plan, questions, answers, isUploadStep }: OutcomeInspectorProps) => {
  const uploadAsks = plan?.asks.filter(({ mode }) => mode === 'upload') ?? []
  const freeformAsks = plan?.asks.filter(({ mode }) => mode === 'freeform') ?? []

  return (
    <VStack gap='md' className='AccountMaskAskStory__Inspector'>
      <VStack gap='3xs'>
        <Heading size='xs' level={3}>Outcome preview</Heading>
        <Span size='xs' variant='subtle'>Prototype only: what the backend would do with the answers so far.</Span>
      </VStack>

      {questions.length > 0
        ? (
          <InspectorSection title='This step'>
            {questions.map(question => (
              <VStack key={question.id} gap='xs'>
                <VStack gap='3xs'>
                  <Span size='xs'>{question.prompt}</Span>
                  <Span size='xs' variant='subtle'>{question.why}</Span>
                  {question.observation ? <Span size='xs' variant='subtle'>{`Pattern noticed: ${question.observation}`}</Span> : null}
                </VStack>
                <QuestionOutcomes question={question} answer={answers[question.id]} />
              </VStack>
            ))}
          </InspectorSection>
        )
        : null}

      {isUploadStep
        ? (
          <InspectorSection title='This step'>
            <Span size='xs' variant='subtle'>
              {`Uploads run through receipt parsing (Outcome 2a) and are matched to the transactions above. Only ${UPLOAD_TYPES_LABEL} files are accepted.`}
            </Span>
          </InspectorSection>
        )
        : null}

      <InspectorSection title='Always · Metadata captured from the response'>
        {plan && plan.metadata.length > 0
          ? plan.metadata.map(({ field, value }) => (
            <HStack key={field} gap='sm' justify='space-between'>
              <Span size='xs' variant='subtle'>{field}</Span>
              <Span size='xs'>{value}</Span>
            </HStack>
          ))
          : <NotTriggered>Pick an account type to start capturing metadata.</NotTriggered>}
      </InspectorSection>

      <InspectorSection title='Outcome 1 · Categorization rule (auto-categorize)'>
        {plan?.rules.map(({ conditions, target }) => (
          <VStack key={target} gap='3xs' className='AccountMaskAskStory__Rule'>
            <Span size='xs' variant='subtle'>{`When ${conditions.join(' · ')}`}</Span>
            <Span size='xs' weight='bold'>{`→ Categorize as ${target}`}</Span>
          </VStack>
        ))}
        {plan?.blockedRuleReason ? <NotTriggered>{`No main rule: ${plan.blockedRuleReason}.`}</NotTriggered> : null}
        {!plan || (plan.rules.length === 0 && !plan.blockedRuleReason)
          ? <NotTriggered>No rule yet; it needs a category from the answers.</NotTriggered>
          : null}
      </InspectorSection>

      <InspectorSection title='Outcome 2 · Create a task on every new transaction'>
        <VStack gap='3xs'>
          <Span size='xs' weight='bold'>a. Upload receipt / invoice / bill → receipt parsing</Span>
          {uploadAsks.length > 0
            ? uploadAsks.map(({ detail }) => <Span key={detail} size='xs'>{detail}</Span>)
            : <NotTriggered>Not triggered</NotTriggered>}
        </VStack>
        <VStack gap='3xs'>
          <Span size='xs' weight='bold'>b. Freeform response → per-transaction categorization</Span>
          {freeformAsks.length > 0
            ? freeformAsks.map(({ detail }) => <Span key={detail} size='xs'>{detail}</Span>)
            : <NotTriggered>Not triggered</NotTriggered>}
        </VStack>
      </InspectorSection>

      <InspectorSection title='Also triggers'>
        {plan?.extras.map(detail => <Span key={detail} size='xs'>{`• ${detail}`}</Span>)}
        {plan?.reviews.map(reason => <Span key={reason} size='xs' status='warning'>{`• Bookkeeper review: ${reason}`}</Span>)}
        {!plan || (plan.extras.length === 0 && plan.reviews.length === 0) ? <NotTriggered>Nothing else yet</NotTriggered> : null}
      </InspectorSection>
    </VStack>
  )
}

const MATRIX_PATTERNS: Record<AccountType, TransactionPattern> = {
  vendor: 'fixedMonthlyTransfers',
  customer: 'customerDeposits',
  owned: 'fixedMonthlyTransfers',
  personal: 'loanRepayments',
  unsure: 'fixedMonthlyTransfers',
}

const OutcomeMatrix = ({ accountMask, billUploadStyle, suggestRuleAfter }: Pick<AccountMaskAskStoryProps, 'accountMask' | keyof PrototypeConfig>) => {
  const { formatCurrencyFromCents } = useIntlFormatter()

  return (
    <VStack gap='lg' className='AccountMaskAskStory__Matrix'>
      <VStack gap='2xs'>
        <Heading size='sm' level={2}>Follow-up questions → outcomes</Heading>
        <Span size='sm' variant='subtle'>
          Every response is captured as metadata. On top of that, each answer leads to Outcome 1 (a categorization rule) or
          Outcome 2 (a task on every new transaction: 2a upload → receipt parsing, 2b freeform → per-transaction categorization).
        </Span>
      </VStack>
      {ACCOUNT_TYPE_OPTIONS.map(({ value: type, short }) => {
        const ctx: AskContext = {
          mask: accountMask,
          pattern: summarizePattern(makeTransactions(MATRIX_PATTERNS[type], accountMask)),
          answers: EMPTY_ANSWERS,
          config: { billUploadStyle, suggestRuleAfter },
          formatMoney: cents => formatCurrencyFromCents(cents),
        }
        const questions = buildQuestions(type, ctx)

        return (
          <VStack key={type} gap='md' className='AccountMaskAskStory__Section'>
            <Heading size='xs' level={3}>{short}</Heading>
            {THEMES.filter(({ id }) => questions.some(({ theme }) => theme === id)).map(({ id, title }) => (
              <VStack key={id} gap='sm'>
                <Span size='xs' weight='bold'>{title}</Span>
                {questions.filter(({ theme }) => theme === id).map(question => (
                  <VStack key={question.id} gap='xs'>
                    <VStack gap='3xs'>
                      <Span size='sm' weight='bold'>{question.prompt}</Span>
                      <Span size='xs' variant='subtle'>{question.why}</Span>
                    </VStack>
                    <QuestionOutcomes question={question} answer={undefined} />
                  </VStack>
                ))}
              </VStack>
            ))}
          </VStack>
        )
      })}
    </VStack>
  )
}

const STORY_STYLES = `
  .AccountMaskAskStory__Root {
    min-block-size: 100vh;
    background: var(--color-base-0);
  }

  .AccountMaskAskStory {
    flex-wrap: wrap;
    align-items: flex-start;
    padding: var(--spacing-lg);
  }

  .AccountMaskAskStory__Task {
    flex: 1 1 22rem;
    max-inline-size: 36rem;
  }

  .AccountMaskAskStory__Inspector {
    flex: 1 1 18rem;
    max-inline-size: 28rem;
    padding: var(--spacing-md);
    border: 1px dashed var(--border-color);
    border-radius: var(--border-radius-sm, 8px);
    background: var(--color-base-0);
  }

  .AccountMaskAskStory__Section {
    padding-block-start: var(--spacing-sm);
    border-block-start: 1px solid var(--border-color);
  }

  .AccountMaskAskStory__Option,
  .AccountMaskAskStory__Rule {
    padding: var(--spacing-xs);
    border-radius: 6px;
    background: var(--color-base-50);
  }

  .AccountMaskAskStory__Option[data-selected] {
    outline: 1px solid var(--color-base-500);
    background: var(--color-base-100);
  }

  .AccountMaskAskStory__Rows.Layer__CounterpartyAskTask__Rows {
    overflow-y: auto;
    max-block-size: 10rem;
  }

  .AccountMaskAskStory__Rows .Layer__CounterpartyAskTask__Row:hover {
    background: none;
  }

  .AccountMaskAskStory__Matrix {
    max-inline-size: 48rem;
    padding: var(--spacing-lg);
  }
`

const DOCS = `
Prototype of a task that asks what kind of account a mask belongs to (vendor, customer, owned business account,
personal), then walks type-specific follow-up questions grouped into themes: who this is and what it's for, the
transactions, and handling going forward. Any upload the answers call for comes last.

The **Outcome preview** panel shows what each answer would do:

- **Always**: metadata captured from the task response
- **Outcome 1**: categorization rule (auto-categorization). A fixed amount gives a counterparty + amount + direction rule;
  per-invoice gives counterparty + direction only
- **Outcome 2**: create a task on every new transaction
  - **a**: upload receipts / invoices / bills → receipt parsing
  - **b**: freeform response → per-transaction categorization

“Not sure” answers route to a bookkeeper for review. Use the controls to change the task title, the mock transactions
(a loan-shaped pattern unlocks the personal loan question), how the vendor bill ask looks (open question 2), and when we
suggest a rule after repeated “ask me each time” answers (open question 1).
`

type StoryArgs = AccountMaskAskStoryProps

const meta: Meta<StoryArgs> = {
  title: 'Scratch/AccountMaskAskTask',
  parameters: {
    docs: { description: { component: DOCS } },
    chromatic: { viewports: [1280] },
  },
  args: {
    accountMask: '2691',
    transactionPattern: 'fixedMonthlyTransfers',
    startAs: 'picker',
    taskTitle: 'identify',
    billUploadStyle: 'prompt',
    suggestRuleAfter: 3,
  },
  argTypes: {
    accountMask: { control: 'text', description: 'Last four digits of the unrecognized account.' },
    taskTitle: {
      control: 'select',
      options: Object.keys(TASK_TITLES),
      description: Object.entries(TASK_TITLES).map(([key, { describe }]) => `\`${key}\`: ${describe}`).join('<br/>'),
    },
    transactionPattern: {
      control: 'select',
      options: Object.keys(PATTERN_DESCRIPTIONS),
      description: Object.entries(PATTERN_DESCRIPTIONS).map(([key, value]) => `\`${key}\`: ${value}`).join('<br/>'),
    },
    startAs: {
      control: 'select',
      options: ['picker', ...ACCOUNT_TYPE_OPTIONS.map(({ value }) => value)],
      description: 'Start at the type picker, or jump straight into a type’s follow-ups.',
    },
    billUploadStyle: {
      control: 'inline-radio',
      options: ['prompt', 'statement'],
      description: 'Open question 2: the vendor bill ask as a prompt with an upload option, or as a statement.',
    },
    suggestRuleAfter: {
      control: { type: 'number', min: 0, max: 10 },
      description: 'Open question 1: after how many consistent “ask me each time” answers we suggest a rule (0 = never).',
    },
  },
  decorators: [
    Story => (
      <div className='Layer__component AccountMaskAskStory__Root'>
        <style>{STORY_STYLES}</style>
        <Story />
      </div>
    ),
  ],
  render: args => <AccountMaskAskStory key={JSON.stringify(args)} {...args} />,
}

export default meta

type Story = StoryObj<StoryArgs>

export const Playground: Story = {}

export const Vendor: Story = {
  args: { startAs: 'vendor', transactionPattern: 'fixedMonthlyTransfers' },
}

export const Customer: Story = {
  args: { startAs: 'customer', transactionPattern: 'customerDeposits' },
}

export const OwnedBusinessAccount: Story = {
  args: { startAs: 'owned', transactionPattern: 'fixedMonthlyTransfers' },
}

export const PersonalLoan: Story = {
  args: { startAs: 'personal', transactionPattern: 'loanRepayments' },
}

export const OutcomeMatrixReference: Story = {
  name: 'Outcome matrix',
  render: ({ accountMask, billUploadStyle, suggestRuleAfter }) => (
    <OutcomeMatrix accountMask={accountMask} billUploadStyle={billUploadStyle} suggestRuleAfter={suggestRuleAfter} />
  ),
}
