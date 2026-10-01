import { type ReactNode, useMemo, useState } from 'react'
import { type Meta, type StoryObj } from '@storybook/react-vite'
import { Paperclip } from 'lucide-react'

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
import { Chip, ChipGroup } from '@ui/Chip/Chip'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { FileInput } from '@ui/Input/FileInput'
import { Input } from '@ui/Input/Input'
import { TextArea } from '@ui/Input/TextArea'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { P, Span } from '@ui/Typography/Text'
import { Container } from '@blocks/Layout/Container/Container'
import { TasksListItemShell } from '@features/bookkeeping/TasksListItem/TasksListItemShell'

import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
import { chartOfAccounts } from '@fixtures/generated/chartOfAccounts.gen'

import '@features/bookkeeping/TasksList/tasksList.scss'

/*
 * Prototype only. Copy is plain strings because it is still being iterated on, and the answer
 * state is local rather than a tanstack form; the real task would follow the counterparty ask.
 */

type AccountType = 'vendor' | 'customer' | 'owned' | 'personal' | 'unsure'

type TransactionPattern = 'fixedMonthlyTransfers' | 'variableBills' | 'customerDeposits' | 'loanRepayments'

type PrototypeConfig = {
  billUploadStyle: 'prompt' | 'statement'
  suggestRuleAfter: number
}

type MockTransaction = {
  id: string
  date: Date
  amount: number
  direction: BankTransactionDirection
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

type Answer = {
  choice: string | null
  text: string
  fileNames: readonly string[]
}

type Answers = Partial<Record<string, Answer>>

type AskContext = {
  mask: string
  pattern: PatternSummary
  answers: Answers
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
  /** Stays on the pane so files can be attached before continuing. */
  collectsFiles?: boolean
  /** Stays on the pane for a free-form answer, whose text drives the effects. */
  collectsText?: { placeholder: string, effects: (text: string) => readonly Effect[] }
}

type BaseQuestion = {
  id: string
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

const EMPTY_ANSWER: Answer = { choice: null, text: '', fileNames: [] }

const ACCOUNT_TYPE_OPTIONS: ReadonlyArray<{ value: AccountType, label: string, short: string }> = [
  { value: 'vendor', label: 'A vendor I pay', short: 'Vendor' },
  { value: 'customer', label: 'A customer who pays me', short: 'Customer' },
  { value: 'owned', label: 'Another account my business owns', short: 'Owned business account' },
  { value: 'personal', label: 'A personal account', short: 'Personal' },
  { value: 'unsure', label: 'Not sure', short: 'Unknown' },
]

const VARIES_CATEGORY = 'varies'
const GROUPING_ACCOUNTS = new Set(['Expenses', 'Operating Expenses', 'Uncategorized Expenses', 'Revenue', 'Uncategorized Revenue'])

const VENDOR_CATEGORIES = ['Software', 'Contractors', 'Office Expenses', 'Rent', 'Legal and Professional Services']
const REVENUE_CATEGORIES = ['Service revenue', 'Product sales', 'Retainers', 'Subscription revenue']

const otherCategoriesOfType = (accountType: LedgerAccountType.Expense | LedgerAccountType.Revenue, suggested: readonly string[]) => chartOfAccounts
  .filter(account => account.accountType.value === accountType)
  .map(({ name }) => name)
  .filter(name => !GROUPING_ACCOUNTS.has(name) && !suggested.includes(name))
const ACCOUNT_PURPOSES = ['Payroll', 'Tax reserve', 'Savings', 'Payouts']
const CADENCES = ['Monthly', 'Quarterly', 'Yearly']

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

const makeTransaction = (index: number, month: number, day: number, amount: number, direction: BankTransactionDirection) => ({
  id: `txn-${index}`,
  date: new Date(FIXTURE_YEAR, month - 1, day),
  amount,
  direction,
})

const TRANSACTIONS_BY_PATTERN: Record<TransactionPattern, readonly MockTransaction[]> = {
  fixedMonthlyTransfers: [5, 6, 7, 8, 9].map((month, index) => makeTransaction(index, month, 16, 100000, OUT)),
  variableBills: [
    makeTransaction(0, 5, 3, 42150, OUT),
    makeTransaction(1, 6, 2, 18700, OUT),
    makeTransaction(2, 6, 28, 96025, OUT),
    makeTransaction(3, 8, 4, 31000, OUT),
    makeTransaction(4, 8, 19, 4500, IN),
  ],
  customerDeposits: [
    makeTransaction(0, 5, 9, 240000, IN),
    makeTransaction(1, 6, 11, 185000, IN),
    makeTransaction(2, 7, 8, 312500, IN),
    makeTransaction(3, 8, 12, 240000, IN),
  ],
  loanRepayments: [
    makeTransaction(0, 3, 2, 500000, IN),
    ...[4, 5, 6, 7, 8, 9].map((month, index) => makeTransaction(index + 1, month, 1, 50000, OUT)),
  ],
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

const notSureOption = (subject: string): ChoiceOption => ({
  value: 'not_sure',
  label: 'Not sure',
  outcome: 'review',
  hint: `Low-confidence answer: a bookkeeper reviews ${subject} before anything is automated.`,
  effects: [review(`Unsure about ${subject}`)],
})

const amountQuestion = ({ pattern, formatMoney }: AskContext, noun: 'payments' | 'deposits'): Question => {
  const { fixedAmount } = pattern

  return {
    kind: 'choice',
    id: 'amount',
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

  if (config.billUploadStyle === 'statement') {
    return {
      kind: 'statement',
      id: 'bills',
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
    prompt: `For more accurate books, you can upload the bills ${vendorName} sends you.`,
    why,
    observation: null,
    options: [
      {
        value: 'upload_now',
        label: 'Upload a bill now',
        outcome: 'askUpload',
        hint: 'The bill runs through receipt parsing and is matched to its payment.',
        collectsFiles: true,
        effects: [extra('Parse the uploaded bills with receipt parsing and match each one to its payment')],
      },
      {
        value: 'ask_each',
        label: 'Ask me for the bill with each payment',
        outcome: 'askUpload',
        hint: 'Each new payment opens a task asking for its bill → receipt parsing → bill-to-payment match.',
        effects: [ask('upload', `Each new payment to ${vendorName} opens a task asking for its bill; receipt parsing matches it to the payment`)],
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

const getCategory = (answers: Answers) => {
  const choice = answers.counterparty?.choice

  return choice && choice !== VARIES_CATEGORY ? choice : null
}

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
  prompt,
  why,
  observation: null,
  namePlaceholder: `${role} name`,
  categoryLabel,
  suggestedCategories,
  otherCategories,
  outcomes: [
    {
      label: 'A suggested or searched category',
      outcome: 'rule',
      hint: 'Names the counterparty and gives the rule its category.',
      matches: answer => !!answer?.choice && answer.choice !== VARIES_CATEGORY,
    },
    {
      label: 'It’s a mix or it varies',
      outcome: 'askFreeform',
      hint: 'No main rule: each new transaction opens a task, and the answer categorizes that transaction only.',
      matches: answer => answer?.choice === VARIES_CATEGORY,
    },
  ],
  effects: ({ text, choice }) => [
    metadata('counterparty.name', text.trim()),
    metadata('counterparty.role', role),
    ...(choice === VARIES_CATEGORY
      ? [
        metadata('counterparty.category', 'Mixed / varies per transaction'),
        blockRules('It’s a mix or varies per transaction, so no single category fits'),
        ask('freeform', variesDetail),
      ]
      : choice ? [metadata('counterparty.category', choice), rule(MAIN_RULE, { target: choice })] : []),
  ],
})

const buildVendorQuestions = (ctx: AskContext): Question[] => {
  const { answers, pattern, mask } = ctx
  const category = getCategory(answers) ?? 'vendor purchases'
  const vendorName = answers.counterparty?.text.trim() || 'this vendor'

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
    amountQuestion(ctx, 'payments'),
    {
      kind: 'choice',
      id: 'recurring',
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
    billsQuestion(ctx, vendorName),
    {
      kind: 'choice',
      id: 'contractor',
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
    {
      kind: 'choice',
      id: 'refunds',
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
  ]
}

const buildCustomerQuestions = (ctx: AskContext): Question[] => {
  const { answers, mask, config } = ctx
  const category = getCategory(answers)
  const isVaried = answers.counterparty?.choice === VARIES_CATEGORY
  const customerName = answers.counterparty?.text.trim() || 'this customer'
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
      id: 'handling',
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
    {
      kind: 'choice',
      id: 'refunds',
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
  ]
}

const buildOwnedQuestions = ({ mask }: AskContext): Question[] => [
  {
    kind: 'choice',
    id: 'connect',
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
        hint: 'A monthly task requests the statement; parsing it reconciles the transfers.',
        collectsFiles: true,
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
  {
    kind: 'choice',
    id: 'purpose',
    prompt: 'What’s this account used for?',
    why: 'Names the account and sets the transfer rule.',
    observation: null,
    options: ACCOUNT_PURPOSES.map((purpose): ChoiceOption => ({
      value: purpose.toLowerCase(),
      label: purpose,
      outcome: 'rule',
      hint: `Names it “${purpose} ••${mask}” and books every transfer as a transfer, not P&L.`,
      effects: [
        metadata('account.purpose', purpose),
        metadata('account.name', `${purpose} ••${mask}`),
        rule(MAIN_RULE, { target: `Transfer to ${purpose} ••${mask} (excluded from P&L)` }),
      ],
    })).concat({
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
    }),
  },
]

const buildPersonalQuestions = ({ pattern, formatMoney }: AskContext): Question[] => [
  {
    kind: 'choice',
    id: 'whose',
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

const isAnswered = (question: Question, answer: Answer | undefined): answer is Answer => {
  if (!answer) return false

  switch (question.kind) {
    case 'choice': {
      const option = question.options.find(({ value }) => value === answer.choice)

      return option !== undefined && (!option.collectsText || answer.text.trim() !== '')
    }
    case 'counterparty': return answer.text.trim() !== '' && answer.choice !== null
    case 'text': return answer.text.trim() !== ''
    case 'statement': return answer.choice !== null
  }
}

const getAnswerEffects = (question: Question, answer: Answer | undefined): readonly Effect[] => {
  if (!isAnswered(question, answer)) return []

  if (question.kind !== 'choice') return question.effects(answer)

  const option = question.options.find(({ value }) => value === answer.choice)

  if (!option) return []

  const uploads = option.collectsFiles && answer.fileNames.length > 0
    ? [metadata('documents.uploaded', answer.fileNames.join(', '))]
    : []

  const freeform = option.collectsText ? option.collectsText.effects(answer.text.trim()) : []

  return [...option.effects, ...uploads, ...freeform]
}

const getAnswerLabel = (question: Question, answer: Answer | undefined) => {
  if (!isAnswered(question, answer)) return null

  switch (question.kind) {
    case 'choice': {
      const option = question.options.find(({ value }) => value === answer.choice)

      if (option?.collectsText) return answer.text.trim()

      const label = option?.label ?? answer.choice
      return answer.fileNames.length > 0 ? `${label} (${answer.fileNames.join(', ')})` : label
    }
    case 'counterparty':
      return `${answer.text.trim()} · ${answer.choice === VARIES_CATEGORY ? 'It’s a mix or it varies' : answer.choice}`
    case 'text': return answer.text.trim()
    case 'statement': return 'Seen'
  }
}

const buildPlan = (type: AccountType, questions: readonly Question[], ctx: AskContext): Plan => {
  const effects = [
    ...baseEffects(type, ctx.mask),
    ...questions.flatMap(question => getAnswerEffects(question, ctx.answers[question.id])),
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

const makeTask = (status: BusinessTaskStatus.Todo | BusinessTaskStatus.UserMarkedCompleted): UserVisibleTask => ({
  id: '00000000-0000-4000-8000-000000000b01',
  status,
  title: 'New account transfer',
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

type QuestionInputProps = {
  question: Question
  answer: Answer
  onChange: (answer: Answer) => void
  onContinue: (answer: Answer) => void
}

const QuestionInput = ({ question, answer, onChange, onContinue }: QuestionInputProps) => {
  switch (question.kind) {
    case 'choice': {
      const selected = question.options.find(({ value }) => value === answer.choice)

      return (
        <VStack gap='sm'>
          <ChipGroup ariaLabel={question.prompt} value={answer.choice}>
            {question.options.map(option => (
              <Chip
                key={option.value}
                size='lg'
                value={option.value}
                onPress={() => {
                  const next = { ...answer, choice: option.value }

                  if (option.collectsFiles || option.collectsText) onChange(next)
                  else onContinue({ ...next, fileNames: [], text: '' })
                }}
              >
                {option.label}
              </Chip>
            ))}
          </ChipGroup>
          {selected?.collectsFiles
            ? (
              <VStack gap='xs'>
                {answer.fileNames.map(name => (
                  <HStack key={name} gap='2xs' align='center'>
                    <Paperclip size={12} />
                    <Span size='xs'>{name}</Span>
                  </HStack>
                ))}
                <HStack gap='xs' justify='end'>
                  <FileInput
                    secondary
                    allowMultipleUploads
                    text='Select files'
                    onUpload={files => onChange({ ...answer, fileNames: [...answer.fileNames, ...files.map(({ name }) => name)] })}
                  />
                  <Button isDisabled={answer.fileNames.length === 0} onPress={() => onContinue(answer)}>Continue</Button>
                </HStack>
              </VStack>
            )
            : null}
          {selected?.collectsText
            ? (
              <VStack gap='sm'>
                <TextArea
                  aria-label={question.prompt}
                  placeholder={selected.collectsText.placeholder}
                  rows={3}
                  value={answer.text}
                  onChange={event => onChange({ ...answer, text: event.target.value })}
                />
                <HStack justify='end'>
                  <Button isDisabled={!isAnswered(question, answer)} onPress={() => onContinue(answer)}>Continue</Button>
                </HStack>
              </VStack>
            )
            : null}
        </VStack>
      )
    }
    case 'counterparty':
      return (
        <VStack gap='sm'>
          <Input
            aria-label={question.namePlaceholder}
            placeholder={question.namePlaceholder}
            value={answer.text}
            onChange={event => onChange({ ...answer, text: event.target.value })}
          />
          <Span size='xs' variant='subtle'>{question.categoryLabel}</Span>
          <ChipGroup ariaLabel={question.categoryLabel} value={answer.choice}>
            {[...question.suggestedCategories, VARIES_CATEGORY].map(category => (
              <Chip key={category} value={category} onPress={() => onChange({ ...answer, choice: category })}>
                {category === VARIES_CATEGORY ? 'It’s a mix or it varies' : category}
              </Chip>
            ))}
          </ChipGroup>
          <ComboBox
            aria-label={`Other ${question.categoryLabel.toLowerCase()} categories`}
            placeholder='Or search other categories…'
            options={question.otherCategories.map(category => ({ label: category, value: category }))}
            selectedValue={answer.choice && question.otherCategories.includes(answer.choice)
              ? { label: answer.choice, value: answer.choice }
              : null}
            onSelectedValueChange={option => onChange({ ...answer, choice: option?.value ?? null })}
            isClearable
          />
          <HStack justify='end'>
            <Button isDisabled={!isAnswered(question, answer)} onPress={() => onContinue(answer)}>Continue</Button>
          </HStack>
        </VStack>
      )
    case 'text':
      return (
        <VStack gap='sm'>
          <TextArea
            aria-label={question.prompt}
            placeholder={question.placeholder}
            rows={4}
            value={answer.text}
            onChange={event => onChange({ ...answer, text: event.target.value })}
          />
          <HStack justify='end'>
            <Button isDisabled={!isAnswered(question, answer)} onPress={() => onContinue(answer)}>Continue</Button>
          </HStack>
        </VStack>
      )
    case 'statement':
      return (
        <HStack justify='end'>
          <Button variant='outlined' onPress={() => onContinue({ ...answer, choice: 'seen' })}>Got it</Button>
        </HStack>
      )
  }
}

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

type TransactionListProps = { transactions: readonly MockTransaction[] }

const TransactionList = ({ transactions }: TransactionListProps) => {
  const { formatDate } = useIntlFormatter()

  return (
    <VStack className='AccountMaskAskStory__Transactions'>
      {transactions.map(({ id, date, amount, direction }) => (
        <HStack key={id} gap='sm' justify='space-between' className='AccountMaskAskStory__Transaction'>
          <Span size='xs' variant='subtle'>{formatDate(date, DateFormat.DateShort)}</Span>
          <Span size='xs' variant='subtle'>{direction === OUT ? 'Money out' : 'Money in'}</Span>
          <MoneySpan size='xs' amount={amount} />
        </HStack>
      ))}
    </VStack>
  )
}

const describeTransfers = (
  transactions: readonly MockTransaction[],
  mask: string,
  pattern: PatternSummary,
  formatMoney: (cents: number) => string,
  formatShortDate: (date: Date) => string,
) => {
  const shown = transactions.slice(0, 2).map(({ amount, date }) => `${formatMoney(amount)} on ${formatShortDate(date)}`)
  const remaining = transactions.length - shown.length
  const list = remaining > 0 ? `${shown.join(', ')}, and ${remaining} others` : shown.join(' and ')
  const flow = pattern.inflowCount === 0
    ? 'transfers to'
    : pattern.outflowCount === 0 ? 'deposits from' : 'transfers to and from'

  return `We noticed ${flow} an account ending in ${mask} that we don’t recognize (${list}). What kind of account is this?`
}

type NavState = {
  view: string
  history: readonly string[]
  direction: SlidingPanesDirection
}

type AccountMaskAskStoryProps = {
  accountMask: string
  transactionPattern: TransactionPattern
  startAs: AccountType | 'picker'
} & PrototypeConfig

const AccountMaskAskStory = ({ accountMask, transactionPattern, startAs, billUploadStyle, suggestRuleAfter }: AccountMaskAskStoryProps) => {
  const { formatCurrencyFromCents, formatDate } = useIntlFormatter()
  const transactions = TRANSACTIONS_BY_PATTERN[transactionPattern]
  const pattern = useMemo(() => summarizePattern(transactions), [transactions])
  const config = useMemo(() => ({ billUploadStyle, suggestRuleAfter }), [billUploadStyle, suggestRuleAfter])

  const makeContext = (answers: Answers): AskContext => ({
    mask: accountMask,
    pattern,
    answers,
    config,
    formatMoney: cents => formatCurrencyFromCents(cents),
  })

  const initialType = startAs === 'picker' ? null : startAs
  const [accountType, setAccountType] = useState<AccountType | null>(initialType)
  const [answers, setAnswers] = useState<Answers>({})
  const [isOpen, setIsOpen] = useState(true)
  const [nav, setNav] = useState<NavState>(() => (initialType
    ? { view: buildQuestions(initialType, makeContext({}))[0]?.id ?? 'review', history: ['picker'], direction: 'forward' }
    : { view: 'picker', history: [], direction: 'forward' }))

  const ctx = makeContext(answers)
  const questions = accountType ? buildQuestions(accountType, ctx) : []
  const plan = accountType ? buildPlan(accountType, questions, ctx) : null
  const isDone = nav.view === 'done'
  const currentQuestion = questions.find(({ id }) => id === nav.view) ?? null

  const goForward = (view: string) => setNav(current => ({ view, history: [...current.history, current.view], direction: 'forward' }))
  const goBack = () => setNav(current => ({
    view: current.history.at(-1) ?? 'picker',
    history: current.history.slice(0, -1),
    direction: 'back',
  }))

  const onPickType = (type: AccountType) => {
    const nextAnswers = type === accountType ? answers : {}

    setAccountType(type)
    setAnswers(nextAnswers)
    goForward(buildQuestions(type, makeContext(nextAnswers))[0]?.id ?? 'review')
  }

  const setAnswer = (question: Question, answer: Answer) => setAnswers(current => ({ ...current, [question.id]: answer }))

  const continueFrom = (question: Question, answer: Answer) => {
    if (!accountType) return

    const nextAnswers = { ...answers, [question.id]: answer }
    const nextQuestions = buildQuestions(accountType, makeContext(nextAnswers))
    const index = nextQuestions.findIndex(({ id }) => id === question.id)

    setAnswers(nextAnswers)
    goForward(nextQuestions[index + 1]?.id ?? 'review')
  }

  const renderPane = () => {
    if (nav.view === 'picker' || !accountType) {
      return (
        <VStack gap='md' pb='md' pi='md'>
          <P size='sm'>
            {describeTransfers(transactions, accountMask, pattern, ctx.formatMoney, date => formatDate(date, DateFormat.DateShort))}
          </P>
          <TransactionList transactions={transactions} />
          <ChipGroup ariaLabel='What kind of account this is' value={accountType}>
            {ACCOUNT_TYPE_OPTIONS.map(({ value, label }) => (
              <Chip key={value} size='lg' value={value} onPress={() => onPickType(value)}>{label}</Chip>
            ))}
          </ChipGroup>
        </VStack>
      )
    }

    if (currentQuestion) {
      const index = questions.indexOf(currentQuestion)

      return (
        <VStack gap='md' pb='md' pi='md'>
          <VStack gap='3xs'>
            <Span size='xs' variant='subtle'>{`${getTypeLabel(accountType)} · Question ${index + 1} of ${questions.length}`}</Span>
            <P size='sm'>{currentQuestion.prompt}</P>
            {currentQuestion.observation ? <Span size='xs' variant='subtle'>{currentQuestion.observation}</Span> : null}
          </VStack>
          <QuestionInput
            question={currentQuestion}
            answer={answers[currentQuestion.id] ?? EMPTY_ANSWER}
            onChange={answer => setAnswer(currentQuestion, answer)}
            onContinue={answer => continueFrom(currentQuestion, answer)}
          />
        </VStack>
      )
    }

    if (isDone && plan) {
      return (
        <VStack gap='md' pb='md' pi='md'>
          <P size='sm' weight='bold'>Thanks, we’ll take it from here.</P>
          <PlanSummary plan={plan} />
          <HStack justify='end'>
            <Button variant='outlined' onPress={() => setNav({ view: 'picker', history: [], direction: 'back' })}>Edit answers</Button>
          </HStack>
        </VStack>
      )
    }

    return (
      <VStack gap='md' pb='md' pi='md'>
        <P size='sm'>{`Here’s what you told us about the account ending in ${accountMask}:`}</P>
        <VStack gap='xs'>
          <VStack gap='3xs'>
            <Span size='xs' variant='subtle'>Account type</Span>
            <Span size='sm'>{getTypeLabel(accountType)}</Span>
          </VStack>
          {questions.map(question => (
            <VStack key={question.id} gap='3xs'>
              <Span size='xs' variant='subtle'>{question.prompt}</Span>
              <Span size='sm'>{getAnswerLabel(question, answers[question.id]) ?? '—'}</Span>
            </VStack>
          ))}
        </VStack>
        <HStack justify='end'>
          <Button onPress={() => goForward('done')}>Submit</Button>
        </HStack>
      </VStack>
    )
  }

  return (
    <HStack gap='lg' className='AccountMaskAskStory'>
      <VStack className='AccountMaskAskStory__Task'>
        <Container name='tasks'>
          <div className='Layer__tasks-list'>
            <TasksListItemShell
              task={makeTask(isDone ? BusinessTaskStatus.UserMarkedCompleted : BusinessTaskStatus.Todo)}
              isOpen={isOpen}
              onToggle={() => setIsOpen(open => !open)}
              isFlush
              slotProps={{
                Header: {
                  backAction: nav.history.length > 0 && !isDone ? { isDisabled: false, onBack: goBack } : null,
                  answer: isDone && accountType ? { kind: 'account', name: getTypeLabel(accountType) } : null,
                },
              }}
            >
              <SlidingPanes paneKey={nav.view} direction={nav.direction} keepInView={isOpen}>
                {renderPane()}
              </SlidingPanes>
            </TasksListItemShell>
          </div>
        </Container>
      </VStack>
      <OutcomeInspector
        plan={plan}
        question={currentQuestion}
        answer={currentQuestion ? answers[currentQuestion.id] : undefined}
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
  question: Question | null
  answer: Answer | undefined
}

const OutcomeInspector = ({ plan, question, answer }: OutcomeInspectorProps) => {
  const uploadAsks = plan?.asks.filter(({ mode }) => mode === 'upload') ?? []
  const freeformAsks = plan?.asks.filter(({ mode }) => mode === 'freeform') ?? []

  return (
    <VStack gap='md' className='AccountMaskAskStory__Inspector'>
      <VStack gap='3xs'>
        <Heading size='xs' level={3}>Outcome preview</Heading>
        <Span size='xs' variant='subtle'>Prototype only: what the backend would do with the answers so far.</Span>
      </VStack>

      {question
        ? (
          <InspectorSection title='This question'>
            <Span size='xs' variant='subtle'>{question.why}</Span>
            <QuestionOutcomes question={question} answer={answer} />
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

const OutcomeMatrix = ({ accountMask, billUploadStyle, suggestRuleAfter }: Omit<AccountMaskAskStoryProps, 'transactionPattern' | 'startAs'>) => {
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
          pattern: summarizePattern(TRANSACTIONS_BY_PATTERN[MATRIX_PATTERNS[type]]),
          answers: {},
          config: { billUploadStyle, suggestRuleAfter },
          formatMoney: cents => formatCurrencyFromCents(cents),
        }

        return (
          <VStack key={type} gap='sm' className='AccountMaskAskStory__Section'>
            <Heading size='xs' level={3}>{short}</Heading>
            {buildQuestions(type, ctx).map(question => (
              <VStack key={question.id} gap='xs'>
                <VStack gap='3xs'>
                  <Span size='sm' weight='bold'>{question.prompt}</Span>
                  <Span size='xs' variant='subtle'>{question.why}</Span>
                </VStack>
                <QuestionOutcomes question={question} answer={undefined} />
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

  .AccountMaskAskStory__Transactions {
    border-block: 1px solid var(--border-color);
  }

  .AccountMaskAskStory__Transaction {
    padding-block: var(--spacing-3xs);
  }

  .AccountMaskAskStory__Matrix {
    max-inline-size: 48rem;
    padding: var(--spacing-lg);
  }
`

const DOCS = `
Prototype of a task that asks what kind of account a mask belongs to (vendor, customer, owned business account,
personal), then walks a type-specific set of follow-up questions.

The **Outcome preview** panel shows what each answer would do:

- **Always**: metadata captured from the task response
- **Outcome 1**: categorization rule (auto-categorization). A fixed amount gives a counterparty + amount + direction rule;
  per-invoice gives counterparty + direction only
- **Outcome 2**: create a task on every new transaction
  - **a**: upload receipts / invoices / bills → receipt parsing
  - **b**: freeform response → per-transaction categorization

“Not sure” answers route to a bookkeeper for review. Use the controls to change the mock transactions (a loan-shaped pattern
unlocks the personal loan question), how the vendor bill ask looks (open question 2), and when we suggest a rule after
repeated “ask me each time” answers (open question 1).
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
    billUploadStyle: 'prompt',
    suggestRuleAfter: 3,
  },
  argTypes: {
    accountMask: { control: 'text', description: 'Last four digits of the unrecognized account.' },
    transactionPattern: {
      control: 'select',
      options: Object.keys(TRANSACTIONS_BY_PATTERN),
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
      description: 'Open question 2: the vendor bill ask as a prompt with an upload button, or as a statement.',
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
