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

type TransactionPattern = 'fixedMonthlyTransfers' | 'variableBills' | 'customerDeposits' | 'customerChecks' | 'loanRepayments' | 'highVolume'

type TaskTitleKey = 'identify' | 'whoIs' | 'unrecognized' | 'tellUs' | 'current'

type MockTransaction = {
  id: string
  date: Date
  amount: number
  direction: BankTransactionDirection
  description: string
}

type QuestionId = 'counterparty' | 'platform' | 'connect' | 'details'

const QUESTION_IDS: readonly QuestionId[] = ['counterparty', 'platform', 'connect', 'details']

type StepId = 'questions' | 'uploads' | 'review'
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
  platformName: string
  /** The CoA clearing account for payments that don't come through the platform. */
  directClearingAccount: string
  answers: Record<QuestionId, Answer>
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
  /** Adds the upload step after the questions, with this as its prompt. */
  uploadPrompt?: string
}

type BaseQuestion = {
  id: QuestionId
  prompt: string
  why: string
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

const GROUPING_ACCOUNTS = new Set(['Expenses', 'Operating Expenses', 'Uncategorized Expenses'])

const VENDOR_CATEGORIES = ['Software', 'Contractors', 'Office Expenses', 'Rent', 'Legal and Professional Services']

const OTHER_VENDOR_CATEGORIES = chartOfAccounts
  .filter(account => account.accountType.value === LedgerAccountType.Expense)
  .map(({ name }) => name)
  .filter(name => !GROUPING_ACCOUNTS.has(name) && !VENDOR_CATEGORIES.includes(name))

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
    case 'customerChecks':
      return [
        makeTransaction(0, 5, 14, 125000, IN, `MOBILE CHECK DEPOSIT #3301 XXXXXX${mask}`),
        makeTransaction(1, 6, 18, 98000, IN, `MOBILE CHECK DEPOSIT #3317 XXXXXX${mask}`),
        makeTransaction(2, 8, 2, 152500, IN, `MOBILE CHECK DEPOSIT #3342 XXXXXX${mask}`),
      ]
    case 'highVolume':
      // Every 6 days from Jan 3, with amounts that vary so the table reads like real vendor activity.
      return Array.from({ length: 60 }, (_, index) => makeTransaction(
        index,
        1,
        3 + index * 6,
        12500 + ((index * 7919) % 48000),
        OUT,
        `ACH DEBIT XXXXXX${mask} INV ${2001 + index}`,
      ))
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
  customerDeposits: '4 variable ACH deposits in',
  customerChecks: '3 check deposits in',
  loanRepayments: '$5,000 in, then 6 × $500 out',
  highVolume: '60 variable payments out, about every 6 days',
}

// Mirrors the Incoming Payment Method Clearing Accounts on the business's chart of accounts.
const getDirectClearingAccount = (transactions: readonly MockTransaction[]) => {
  const deposits = transactions.filter(({ direction }) => direction === IN).map(({ description }) => description.toUpperCase())

  if (deposits.length > 0 && deposits.every(description => description.includes('ACH'))) return 'Incoming ACH Payments Clearing'
  if (deposits.length > 0 && deposits.every(description => /\b(CHECK|CHK)\b/.test(description))) return 'Incoming Check Payments Clearing'

  return 'Incoming Other Payments Clearing'
}

/** The category a counterparty answer settles on; `varies` when it's a mix. */
const resolveCategory = ({ choice, detail }: Answer) => (choice === OTHER_CATEGORY ? detail : choice)

const notSureOption = (subject: string): ChoiceOption => ({
  value: 'not_sure',
  label: 'Not sure',
  outcome: 'review',
  hint: `Low-confidence answer: a bookkeeper reviews ${subject} before anything is automated.`,
  effects: [review(`Unsure about ${subject}`)],
})

const buildVendorQuestions = (): Question[] => [
  {
    kind: 'counterparty',
    id: 'counterparty',
    prompt: 'What’s the vendor’s name, and what do you buy from them?',
    why: 'Sets the counterparty and the expense category.',
    namePlaceholder: 'Vendor name',
    categoryLabel: 'What you buy from them',
    suggestedCategories: VENDOR_CATEGORIES,
    otherCategories: OTHER_VENDOR_CATEGORIES,
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
        hint: 'No rule: each new payment opens a task, and the answer categorizes that payment only.',
        matches: answer => answer?.choice === VARIES_CATEGORY,
      },
    ],
    effects: (answer) => {
      const category = resolveCategory(answer)

      return [
        metadata('counterparty.name', answer.text.trim()),
        metadata('counterparty.role', 'Vendor'),
        ...(category === VARIES_CATEGORY
          ? [
            metadata('counterparty.category', 'Mixed / varies per transaction'),
            blockRules('It’s a mix or varies per transaction, so no single category fits'),
            ask('freeform', 'Each new payment to this vendor opens a freeform task; the answer categorizes that payment only'),
          ]
          : category ? [metadata('counterparty.category', category), rule(MAIN_RULE, { target: category })] : []),
      ]
    },
  },
]

const buildCustomerQuestions = ({ platformName, directClearingAccount }: AskContext): Question[] => [
  {
    kind: 'choice',
    id: 'platform',
    prompt: `Did these payments come through ${platformName}?`,
    why: 'Decides which clearing account the deposits land in.',
    options: [
      {
        value: 'platform',
        label: `Yes, through ${platformName}`,
        outcome: 'rule',
        hint: `Deposits go to ${platformName} Clearing (under Payment Processor Clearing Accounts) and reconcile against ${platformName}’s payouts.`,
        effects: [
          metadata('payment.channel', platformName),
          metadata('clearing.account', `${platformName} Clearing`),
          rule(MAIN_RULE, { target: `${platformName} Clearing` }),
        ],
      },
      {
        value: 'direct',
        label: 'No, they paid me directly',
        outcome: 'rule',
        hint: `Deposits go to ${directClearingAccount}, the clearing account this business’s chart of accounts designates for how they were paid. Not shown to the user.`,
        effects: [
          metadata('payment.channel', 'Direct'),
          metadata('clearing.account', directClearingAccount),
          rule(MAIN_RULE, { target: directClearingAccount }),
        ],
      },
      notSureOption('how these payments were made'),
    ],
  },
]

const buildOwnedQuestions = ({ mask }: AskContext): Question[] => [
  {
    kind: 'choice',
    id: 'connect',
    prompt: 'Can you connect this account so we can pull your transactions for you automatically, or do you want to upload its statements manually?',
    why: 'Shows both sides of each transfer, so internal transfers stay off the P&L.',
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
        hint: 'Statements are uploaded on the next step, then a monthly task requests the next one.',
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

const buildUnsureQuestions = (): Question[] => [
  {
    kind: 'text',
    id: 'details',
    prompt: 'Tell us anything you know about this account.',
    why: 'Free text goes to a bookkeeper, who classifies the account.',
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

/** Personal has no follow-ups: picking it is the whole answer. */
const buildQuestions = (type: AccountType, ctx: AskContext): Question[] => {
  switch (type) {
    case 'vendor': return buildVendorQuestions()
    case 'customer': return buildCustomerQuestions(ctx)
    case 'owned': return buildOwnedQuestions(ctx)
    case 'personal': return []
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
    case 'owned': return [...common, rule(MAIN_RULE, { conditions: [account], target: `Transfer between your accounts ••${mask} (excluded from P&L)` })]
    case 'personal': return [...common, rule(MAIN_RULE, { conditions: [account], target: 'Personal (excluded from business books)' })]
    case 'unsure': return common
  }
}

const getSelectedOption = (question: Question, answer: Answer) =>
  (question.kind === 'choice' ? question.options.find(({ value }) => value === answer.choice) : undefined)

const isAnswered = (question: Question, answer: Answer) => {
  switch (question.kind) {
    case 'choice': return getSelectedOption(question, answer) !== undefined
    case 'counterparty': return answer.text.trim() !== '' && resolveCategory(answer) !== null
    case 'text': return answer.text.trim() !== ''
  }
}

const getAnswerEffects = (question: Question, answer: Answer): readonly Effect[] => {
  if (!isAnswered(question, answer)) return []

  if (question.kind !== 'choice') return question.effects(answer)

  return getSelectedOption(question, answer)?.effects ?? []
}

const getAnswerLabel = (question: Question, answer: Answer) => {
  if (!isAnswered(question, answer)) return null

  switch (question.kind) {
    case 'choice': return getSelectedOption(question, answer)?.label ?? null
    case 'counterparty': {
      const category = resolveCategory(answer)
      return `${answer.text.trim()} · ${category === VARIES_CATEGORY ? 'It’s a mix or it varies' : category}`
    }
    case 'text': return answer.text.trim()
  }
}

const getUploadPrompts = (questions: readonly Question[], answers: Record<QuestionId, Answer>) =>
  questions.flatMap(question => getSelectedOption(question, answers[question.id])?.uploadPrompt ?? [])

/** Empty when the account type needs no follow-ups, so picking it submits straight away. */
const getSteps = (questions: readonly Question[], answers: Record<QuestionId, Answer>): StepId[] => (questions.length > 0
  ? ['questions', ...(getUploadPrompts(questions, answers).length > 0 ? ['uploads' as const] : []), 'review']
  : [])

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
    )
  },
})

const QuestionField = withForm({
  ...accountMaskAskFormOptions,
  props: {
    question: null as Question | null,
  },
  render: function Render({ form, question }) {
    const answer = useStore(form.store, state => (question ? state.values.answers[question.id] : EMPTY_ANSWER))

    if (!question) return null

    switch (question.kind) {
      case 'choice':
        return (
          <VStack gap='xs'>
            <P size='sm'>{question.prompt}</P>
            <form.AppField name={`answers.${question.id}.choice`}>
              {field => (
                <field.FormChipGroupField
                  label={question.prompt}
                  showLabel={false}
                  options={question.options.map(({ value, label }) => ({ value, label }))}
                />
              )}
            </form.AppField>
          </VStack>
        )
      case 'counterparty':
        return (
          <VStack gap='xs'>
            <P size='sm'>{question.prompt}</P>
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
            <P size='sm'>{question.prompt}</P>
            <form.AppField name={`answers.${question.id}.text`}>
              {field => <field.FormTextAreaField label={question.prompt} showLabel={false} placeholder={question.placeholder} />}
            </form.AppField>
          </VStack>
        )
    }
  },
})

const QuestionsPane = withForm({
  ...accountMaskAskFormOptions,
  props: {
    questions: [] as readonly Question[],
    progress: null as string | null,
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
    progress: null as string | null,
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
    {questions.map(question => (
      <VStack key={question.id} gap='3xs'>
        <Span size='xs' variant='subtle'>{question.prompt}</Span>
        <Span size='sm'>{getAnswerLabel(question, answers[question.id]) ?? '—'}</Span>
      </VStack>
    ))}
    {files.length > 0
      ? (
        <VStack gap='3xs'>
          <Span size='xs' variant='subtle'>Uploaded files</Span>
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
  platformName: string
  transactionPattern: TransactionPattern
  startAs: AccountType | 'picker'
  taskTitle: TaskTitleKey
}

const AccountMaskAskStory = ({ accountMask, platformName, transactionPattern, startAs, taskTitle }: AccountMaskAskStoryProps) => {
  const transactions = useMemo(() => makeTransactions(transactionPattern, accountMask), [transactionPattern, accountMask])

  const makeContext = useCallback(
    (answers: Record<QuestionId, Answer>): AskContext => ({
      mask: accountMask,
      platformName,
      directClearingAccount: getDirectClearingAccount(transactions),
      answers,
    }),
    [accountMask, platformName, transactions],
  )

  // A type with no follow-ups has nothing to jump into, so it starts at the picker.
  const startingSteps = startAs === 'picker' ? [] : getSteps(buildQuestions(startAs, makeContext(EMPTY_ANSWERS)), EMPTY_ANSWERS)
  const initialType = startAs !== 'picker' && startingSteps.length > 0 ? startAs : null

  const answeredTypeRef = useRef<AccountType | null>(initialType)
  const [isOpen, setIsOpen] = useState(true)
  const [nav, setNav] = useState<NavState>(() => (initialType
    ? { view: startingSteps[0] ?? 'review', history: ['picker'], direction: 'forward' }
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

    if (buildQuestions(type, makeContext(EMPTY_ANSWERS)).length === 0) {
      void form.handleSubmit()
      return
    }

    goForward(nextStepAfter('picker'))
  }

  const answerSteps = steps.filter(step => step !== 'review')
  const progressFor = (step: (typeof answerSteps)[number]) => (answerSteps.length > 1 ? `Step ${answerSteps.indexOf(step) + 1} of ${answerSteps.length}` : null)

  const renderPane = () => {
    const { view } = nav

    if (view === 'done' && accountType) {
      return (
        <VStack gap='md' pb='md' pi='md'>
          {questions.length > 0
            ? (
              <>
                <P size='sm' weight='bold'>Thanks, we’ll take it from here.</P>
                {plan ? <PlanSummary plan={plan} /> : null}
              </>
            )
            : <P size='sm'>{`Got it. We’ll keep transactions with account ••${accountMask} out of your business books.`}</P>}
          <HStack justify='end'>
            <Button variant='outlined' onPress={() => setNav({ view: 'picker', history: [], direction: 'back' })}>Edit answer</Button>
          </HStack>
        </VStack>
      )
    }

    if (view === 'picker' || !accountType) {
      return (
        <AccountTypePane
          form={form}
          prompt={`What kind of account is ••${accountMask}?`}
          onPick={onPickType}
        />
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
      <QuestionsPane
        form={form}
        questions={questions}
        progress={progressFor('questions')}
        onContinue={() => goForward(nextStepAfter('questions'))}
      />
    )
  }

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
        questions={nav.view === 'questions' ? questions : []}
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
              {`Uploaded statements are parsed (Outcome 2a) to reconcile the transfers above. Only ${UPLOAD_TYPES_LABEL} files are accepted.`}
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
        {plan?.blockedRuleReason ? <NotTriggered>{`No rule: ${plan.blockedRuleReason}.`}</NotTriggered> : null}
        {!plan || (plan.rules.length === 0 && !plan.blockedRuleReason)
          ? <NotTriggered>No rule yet; it needs a category from the answers.</NotTriggered>
          : null}
      </InspectorSection>

      <InspectorSection title='Outcome 2 · Create a task on every new transaction'>
        <VStack gap='3xs'>
          <Span size='xs' weight='bold'>a. Upload receipt / invoice / statement → parsing</Span>
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

const OutcomeMatrix = ({ accountMask, platformName }: Pick<AccountMaskAskStoryProps, 'accountMask' | 'platformName'>) => (
  <VStack gap='lg' className='AccountMaskAskStory__Matrix'>
    <VStack gap='2xs'>
      <Heading size='sm' level={2}>Follow-up questions → outcomes</Heading>
      <Span size='sm' variant='subtle'>
        Every response is captured as metadata. On top of that, each answer leads to Outcome 1 (a categorization rule) or
        Outcome 2 (a task on every new transaction: 2a upload → parsing, 2b freeform → per-transaction categorization).
      </Span>
    </VStack>
    {ACCOUNT_TYPE_OPTIONS.map(({ value: type, short }) => {
      const questions = buildQuestions(type, {
        mask: accountMask,
        platformName,
        directClearingAccount: getDirectClearingAccount(makeTransactions('customerDeposits', accountMask)),
        answers: EMPTY_ANSWERS,
      })

      return (
        <VStack key={type} gap='sm' className='AccountMaskAskStory__Section'>
          <Heading size='xs' level={3}>{short}</Heading>
          {questions.length > 0
            ? questions.map(question => (
              <VStack key={question.id} gap='xs'>
                <VStack gap='3xs'>
                  <Span size='sm' weight='bold'>{question.prompt}</Span>
                  <Span size='xs' variant='subtle'>{question.why}</Span>
                </VStack>
                <QuestionOutcomes question={question} answer={undefined} />
              </VStack>
            ))
            : (
              <VStack gap='2xs' className='AccountMaskAskStory__Option'>
                <HStack gap='xs' align='center'>
                  <Span size='xs' weight='bold'>No follow-ups</Span>
                  <OutcomeBadge outcome='rule' />
                </HStack>
                <Span size='xs' variant='subtle'>Picking it is the whole answer: every transaction with the account is categorized as Personal.</Span>
              </VStack>
            )}
        </VStack>
      )
    })}
  </VStack>
)

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
Prototype of a task that asks what kind of account a mask belongs to, then one focused follow-up per type:

- **Vendor**: the vendor's name and what you buy from them (the category)
- **Customer**: whether the payments came through the platform (e.g. Jobber, Moxie), which picks the clearing account
- **Owned business account**: connect it, upload statements, or neither
- **Personal**: no follow-up; picking it categorizes the transactions as Personal
- **Not sure**: free text for a bookkeeper

The **Outcome preview** panel shows what each answer would do:

- **Always**: metadata captured from the task response
- **Outcome 1**: categorization rule (auto-categorization)
- **Outcome 2**: create a task on every new transaction
  - **a**: upload → parsing
  - **b**: freeform response → per-transaction categorization
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
    platformName: 'Jobber',
    transactionPattern: 'fixedMonthlyTransfers',
    startAs: 'picker',
    taskTitle: 'identify',
  },
  argTypes: {
    accountMask: { control: 'text', description: 'Last four digits of the unrecognized account.' },
    platformName: { control: 'text', description: 'The platform the business takes payments through, named in the customer question.' },
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
      description: 'Start at the type picker, or jump straight into a type’s follow-up. Personal has none, so it starts at the picker.',
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

export const SixtyTransactions: Story = {
  args: { startAs: 'vendor', transactionPattern: 'highVolume' },
}

export const OutcomeMatrixReference: Story = {
  name: 'Outcome matrix',
  render: ({ accountMask, platformName }) => <OutcomeMatrix accountMask={accountMask} platformName={platformName} />,
}
