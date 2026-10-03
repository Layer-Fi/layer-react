import { type ChangeEvent, type ReactNode, useMemo, useState } from 'react'
import { type Meta, type StoryObj } from '@storybook/react-vite'
import classNames from 'classnames'

import { BusinessTaskStatus, TaskUserResponseType } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import { LedgerAccountType } from '@schemas/features/generalLedger/ledgerAccountType'
import { type UserVisibleTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { DateFormat } from '@utils/shared/i18n/date/patterns'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { SlidingPanes, type SlidingPanesDirection } from '@components/utility/SlidingPanes/SlidingPanes'
import { Button } from '@ui/Button/Button'
import { Chip, ChipGroup } from '@ui/Chip/Chip'
import { CreatableComboBox } from '@ui/ComboBox/CreatableComboBox'
import { SearchComboBox } from '@ui/ComboBox/SearchComboBox'
import { type ComboBoxOption } from '@ui/ComboBox/types'
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
import '@features/bookkeeping/TasksListItem/counterpartyAskTaskBody.scss'

/*
 * Prototype only. Renders any form written against the Unified Ask Form contract v0.0.3
 * (https://claude.ai/artifact/2NcpUjQVRoNqPzPz11ofHy). The spec is the story's `task` arg, so it can be edited live in
 * the Controls panel. The state and search endpoints are mocked in this file. Client copy is plain strings while the
 * contract is still moving; server copy comes from the spec.
 */

const SPEC_VERSION = '0.0.3'
const SPEC_URL = 'https://claude.ai/artifact/2NcpUjQVRoNqPzPz11ofHy'

/* ---------------------------------------------------------------- contract v0.0.3 */

type PageId = string

type Next =
  | { kind: 'PAGE', page_id: PageId }
  | { kind: 'SUBMIT', review?: boolean }
  | { kind: 'SERVER' }

type SearchEntity = 'CATEGORY' | 'CUSTOMER' | 'VENDOR'

type Option = {
  value: string
  label: string
  next?: Next | null
  follow_up?: StepFields
}

type ChoiceFields = { type: 'CHOICE', prompt: string, options: Option[], auto_advance?: boolean }
type SearchFields = {
  type: 'SEARCH' | 'SEARCH_WITH_FREEFORM'
  prompt?: string
  entity: SearchEntity
  options?: Option[]
  placeholder?: string
}
type CategoryFields = { type: 'CATEGORY', prompt?: string, options?: Option[] }
type TextFields = { type: 'TEXT', prompt?: string, placeholder?: string, multiline?: boolean, required?: boolean }
type ActionFields = { type: 'ACTION', prompt: string, action: 'CONNECT_ACCOUNT' }
type UploadFields = { type: 'UPLOAD', prompt: string, accept: string[], multiple?: boolean }
type UnknownFields = { type: string, prompt?: string }

/** A follow-up is these fields without an `id`. */
type StepFields = ChoiceFields | SearchFields | CategoryFields | TextFields | ActionFields | UploadFields | UnknownFields
type Step = StepFields & { id: string }

type Page = { id: PageId, steps: Step[], next: Next }

type AskTransaction = {
  id: string
  date: string
  /** Signed cents: negative is money out. */
  amount: number
  description: string
}

type UnifiedAskFormTask = {
  task_type: 'UNIFIED_ASK_FORM'
  form_subtype: string
  title: string
  transactions: AskTransaction[]
  form: { entry_page_id: PageId, pages: Page[] }
}

type TextAnswer = { text: string }
type DocumentsAnswer = { document_ids: string[] }
type FollowUpAnswer = { choice: string } | TextAnswer | DocumentsAnswer
type ChoiceAnswer = { choice: string, follow_up?: FollowUpAnswer }
type RowAnswer = ChoiceAnswer | TextAnswer
type TransactionAnswers = { transaction_answers: { transaction_id: string, answer: RowAnswer }[] }
type Answer = ChoiceAnswer | TextAnswer | { completed: true } | DocumentsAnswer | TransactionAnswers
type Answers = Record<string, Answer>

type StateRequest = { page_id: PageId, page_history: PageId[], answers: Answers }
/** A page id from this form, or `SUBMIT`. */
type StateResponse = { next_page_id: string }

type SearchResult = { id: string, entity: SearchEntity, label: string, sublabel: string }

const isChoice = (step: StepFields): step is ChoiceFields => step.type === 'CHOICE'
const isSearch = (step: StepFields): step is SearchFields => step.type === 'SEARCH' || step.type === 'SEARCH_WITH_FREEFORM'
const isCategory = (step: StepFields): step is CategoryFields => step.type === 'CATEGORY'
const isText = (step: StepFields): step is TextFields => step.type === 'TEXT'
const isAction = (step: StepFields): step is ActionFields => step.type === 'ACTION'
const isUpload = (step: StepFields): step is UploadFields => step.type === 'UPLOAD'

const getOptions = (step: StepFields): readonly Option[] => {
  if (isChoice(step)) return step.options
  if (isSearch(step) || isCategory(step)) return step.options ?? []
  return []
}

const toFollowUpAnswer = (answer: Answer): FollowUpAnswer | undefined => {
  if ('choice' in answer) return { choice: answer.choice }
  if ('text' in answer || 'document_ids' in answer) return answer
  return undefined
}

/* ---------------------------------------------------------------- mock search endpoint */

const categoryId = (name: string) => `acct_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`
const category = (name: string): Option => ({ value: categoryId(name), label: name })

const GROUPING_ACCOUNTS = new Set(['Expenses', 'Operating Expenses', 'Uncategorized Expenses', 'Revenue'])

const SEARCH_INDEX: Record<SearchEntity, readonly SearchResult[]> = {
  CATEGORY: chartOfAccounts
    .filter(({ accountType, name }) =>
      (accountType.value === LedgerAccountType.Expense || accountType.value === LedgerAccountType.Revenue) && !GROUPING_ACCOUNTS.has(name))
    .map(({ name, accountType }) => ({ id: categoryId(name), entity: 'CATEGORY', label: name, sublabel: accountType.displayName })),
  VENDOR: [
    ['Costco Wholesale', 14],
    ['Bob’s Plumbing Supply', 3],
    ['Home Depot', 22],
    ['Gusto', 12],
    ['Amazon Business', 31],
  ].map(([label, count]) => ({ id: `vend_${String(label).toLowerCase().replace(/[^a-z0-9]+/g, '_')}`, entity: 'VENDOR', label: String(label), sublabel: `${count} transactions` })),
  CUSTOMER: [
    ['Maple Street Dental', 8],
    ['Alex Rivera', 2],
    ['Northside Property Group', 5],
  ].map(([label, count]) => ({ id: `cust_${String(label).toLowerCase().replace(/[^a-z0-9]+/g, '_')}`, entity: 'CUSTOMER', label: String(label), sublabel: `${count} payments` })),
}

const normalize = (value: string) => value.trim().toLowerCase().replace(/[’‘]/g, '\'')

const searchEndpoint = (entity: SearchEntity, query: string): readonly SearchResult[] => {
  const needle = normalize(query)

  return SEARCH_INDEX[entity].filter(({ label }) => normalize(label).includes(needle)).slice(0, 20)
}

/* ---------------------------------------------------------------- mock state endpoint */

type StateEndpointBehaviour = 'responds' | 'fails'

const STATE_ENDPOINT_DELAY_MS = 700

/**
 * Stands in for the backend: after the customer lookup, ask about a customer it hasn't seen before. A typed name
 * stands in for "not seen"; the real backend would check the business's history.
 */
const resolveState = (task: UnifiedAskFormTask, { page_id, answers }: StateRequest): StateResponse => {
  const has = (pageId: PageId) => task.form.pages.some(({ id }) => id === pageId)
  const customer = answers.customer

  if (page_id === 'who_paid' && customer && 'text' in customer && has('new_customer')) return { next_page_id: 'new_customer' }
  if (page_id === 'who_paid' && has('upload')) return { next_page_id: 'upload' }

  return { next_page_id: 'SUBMIT' }
}

const callStateEndpoint = (task: UnifiedAskFormTask, request: StateRequest, behaviour: StateEndpointBehaviour) =>
  new Promise<StateResponse>((resolve, reject) => {
    setTimeout(() => {
      if (behaviour === 'fails') reject(new Error('The state endpoint timed out'))
      else resolve(resolveState(task, request))
    }, STATE_ENDPOINT_DELAY_MS)
  })

/* ---------------------------------------------------------------- spec rules the backend checks */

const validateForm = ({ entry_page_id, pages }: UnifiedAskFormTask['form']): string[] => {
  const issues: string[] = []
  const pageIds = new Set(pages.map(({ id }) => id))

  const checkTarget = (next: Next | null | undefined, where: string) => {
    if (next?.kind === 'PAGE' && !pageIds.has(next.page_id)) issues.push(`${where} routes to page "${next.page_id}", which isn’t in the form.`)
  }

  if (!pageIds.has(entry_page_id)) issues.push(`entry_page_id "${entry_page_id}" isn’t in the form.`)

  for (const page of pages) {
    checkTarget(page.next, `Page "${page.id}"`)

    const routingSteps = page.steps.filter(step => getOptions(step).some(({ next }) => next))
    if (routingSteps.length > 1) {
      issues.push(`Page "${page.id}" has ${routingSteps.length} steps whose options route. At most one step per page may.`)
    }

    for (const step of page.steps) {
      for (const option of getOptions(step)) {
        const where = `Option "${option.value}" on step "${step.id}"`

        if (option.next?.kind === 'SERVER') issues.push(`${where} uses SERVER. SERVER is only allowed on a page’s next.`)
        if (page.next.kind === 'SERVER' && option.next) issues.push(`${where} has a next, but page "${page.id}" routes through SERVER. It must be null.`)
        checkTarget(option.next, where)

        if (option.follow_up) {
          const followUpOptions = getOptions(option.follow_up)
          if (followUpOptions.some(({ follow_up }) => follow_up)) issues.push(`${where} has a follow-up with its own follow-up. Follow-ups are one level only.`)
          if (followUpOptions.some(({ next }) => next)) issues.push(`${where} has a follow-up whose options route. Follow-ups don’t route.`)
        }
      }
    }
  }

  return issues
}

/* ---------------------------------------------------------------- answers, labels and templates */

type Labels = Record<string, string>

const isAnswered = (step: StepFields, answer: Answer | undefined, transactionCount: number, depth = 0): boolean => {
  if (isAction(step)) return true
  if (isText(step) && step.required === false) return true
  if (!answer) return false

  if (isCategory(step)) {
    return 'transaction_answers' in answer
      && answer.transaction_answers.length === transactionCount
      && answer.transaction_answers.every(row => isAnswered({ type: 'SEARCH', entity: 'CATEGORY', options: step.options }, row.answer, 0))
  }

  if (isUpload(step)) return 'document_ids' in answer && answer.document_ids.length > 0

  if ('choice' in answer) {
    const followUp = getOptions(step).find(({ value }) => value === answer.choice)?.follow_up

    return !followUp || depth > 0 || isAnswered(followUp, answer.follow_up, transactionCount, depth + 1)
  }

  return 'text' in answer && answer.text.trim().length > 0
}

const getLabel = (step: StepFields, answer: Answer | undefined, labels: Labels): string | null => {
  if (!answer) return null

  if ('choice' in answer) {
    const option = getOptions(step).find(({ value }) => value === answer.choice)
    const followUpLabel = option?.follow_up ? getLabel(option.follow_up, answer.follow_up, labels) : null

    return followUpLabel ?? option?.label ?? labels[answer.choice] ?? answer.choice
  }
  if ('text' in answer) return answer.text.trim() || null
  if ('document_ids' in answer) return `${answer.document_ids.length} ${answer.document_ids.length === 1 ? 'file' : 'files'}`
  if ('completed' in answer) return 'Done'

  const rowLabels = new Set(answer.transaction_answers.map(row => getLabel(step, row.answer, labels)))
  const [only] = rowLabels

  return rowLabels.size === 1 && only ? only : 'Varies by transaction'
}

const TEMPLATE = /\{\{\s*answer\.([\w-]+)(\.follow_up)?\.label\s*\}\}/g

const fillTemplate = (text: string | undefined, stepsById: ReadonlyMap<string, Step>, answers: Answers, labels: Labels) =>
  text?.replace(TEMPLATE, (_match, stepId: string, followUp: string | undefined) => {
    const step = stepsById.get(stepId)
    const answer = answers[stepId]

    if (!step || !answer) return '…'
    if (!followUp) return getLabel(step, answer, labels) ?? '…'

    const option = 'choice' in answer ? getOptions(step).find(({ value }) => value === answer.choice) : undefined

    return option?.follow_up && 'choice' in answer ? getLabel(option.follow_up, answer.follow_up, labels) ?? '…' : '…'
  })

const getChosenOptionNext = (page: Page, answers: Answers): Next | null => {
  for (const step of page.steps) {
    const answer = answers[step.id]
    const next = answer && 'choice' in answer ? getOptions(step).find(({ value }) => value === answer.choice)?.next : null

    if (next) return next
  }

  return null
}

const getAnswersForPages = (pages: readonly Page[], answers: Answers): Answers => {
  const stepIds = new Set(pages.flatMap(({ steps }) => steps.map(({ id }) => id)))

  return Object.fromEntries(Object.entries(answers).filter(([stepId]) => stepIds.has(stepId)))
}

const FALLBACK_PAGE: Page = {
  id: '__fallback',
  steps: [{ id: '__fallback', type: 'TEXT', multiline: true, prompt: 'Is there anything else we should know about these transactions?' }],
  next: { kind: 'SUBMIT' },
}

const ACTION_LABELS: Record<ActionFields['action'], string> = { CONNECT_ACCOUNT: 'Connect account' }

/* ---------------------------------------------------------------- step views */

type StepViewProps = {
  step: StepFields
  answer: Answer | undefined
  onChange: (answer: Answer) => void
  onPickOption?: (option: Option) => void
  onSearch: (entity: SearchEntity, query: string) => void
  labels: Labels
  onLabel: (id: string, label: string) => void
  prompt: string | undefined
  depth: number
}

const SEARCH_PLACEHOLDERS: Record<SearchEntity, string> = {
  CATEGORY: 'Search categories…',
  CUSTOMER: 'Search customers…',
  VENDOR: 'Search vendors…',
}

const toComboOption = ({ id, label }: SearchResult): ComboBoxOption => ({ value: id, label })

const OptionChips = ({ label, options, value, onPick }: {
  label: string
  options: readonly Option[]
  value: string | null
  onPick: (option: Option) => void
}) => (
  <ChipGroup<string> ariaLabel={label} value={value}>
    {options.map(option => (
      <Chip<string> key={option.value} value={option.value} onPress={() => onPick(option)}>{option.label}</Chip>
    ))}
  </ChipGroup>
)

const SearchBox = ({ step, answer, onChange, onSearch, labels, onLabel }: Pick<StepViewProps, 'answer' | 'onChange' | 'onSearch' | 'labels' | 'onLabel'> & {
  step: SearchFields
}) => {
  const [query, setQuery] = useState('')
  const isPickedResult = answer && 'choice' in answer && !getOptions(step).some(({ value }) => value === answer.choice)
  const selected = isPickedResult && 'choice' in answer ? { value: answer.choice, label: labels[answer.choice] ?? answer.choice } : null
  const typed = answer && 'text' in answer ? { value: `text:${answer.text}`, label: answer.text } : null
  const placeholder = step.placeholder ?? SEARCH_PLACEHOLDERS[step.entity]

  const pick = (option: ComboBoxOption | null) => {
    if (!option) return
    onLabel(option.value, option.label)
    onChange({ choice: option.value })
  }

  const onQuery = (value: string) => {
    setQuery(value)
    if (value) onSearch(step.entity, value)
  }

  if (step.type === 'SEARCH_WITH_FREEFORM') {
    return (
      <CreatableComboBox
        aria-label={step.prompt ?? placeholder}
        placeholder={placeholder}
        options={searchEndpoint(step.entity, query).map(toComboOption)}
        selectedValue={selected ?? typed}
        onSelectedValueChange={pick}
        onInputValueChange={onQuery}
        onCreateOption={text => onChange({ text })}
        formatCreateLabel={text => `Use “${text}”`}
        createOptionPosition='last'
      />
    )
  }

  return (
    <SearchComboBox
      aria-label={step.prompt ?? placeholder}
      placeholder={placeholder}
      options={searchEndpoint(step.entity, query).map(toComboOption)}
      selectedValue={selected}
      onSelectedValueChange={pick}
      onSearchQueryChange={onQuery}
    />
  )
}

const FollowUpView = (props: StepViewProps & { option: Option | undefined }) => {
  const { option, answer, onChange } = props

  if (!option?.follow_up || !answer || !('choice' in answer)) return null

  return (
    <VStack>
      <StepView
        {...props}
        step={option.follow_up}
        prompt={option.follow_up.prompt}
        answer={answer.follow_up}
        onChange={next => onChange({ choice: answer.choice, follow_up: toFollowUpAnswer(next) })}
        onPickOption={undefined}
        depth={1}
      />
    </VStack>
  )
}

const formatList = (items: readonly string[]) =>
  (items.length > 1 ? `${items.slice(0, -1).join(', ')} or ${items.at(-1) ?? ''}` : items.join(''))

const UploadView = ({ step, answer, onChange }: { step: UploadFields, answer: Answer | undefined, onChange: (answer: Answer) => void }) => {
  const [error, setError] = useState<string | null>(null)
  const documentIds = answer && 'document_ids' in answer ? answer.document_ids : []
  const accepted = step.accept.map(extension => extension.toLowerCase())

  const onUpload = (files: File[]) => {
    const rejected = files.filter(({ name }) => !accepted.includes(name.split('.').pop()?.toLowerCase() ?? ''))
    const added = files.filter(file => !rejected.includes(file)).map(({ name }) => `doc_${name}`)

    setError(rejected.length > 0
      ? `Couldn’t add ${rejected.map(({ name }) => name).join(', ')}. Upload a ${formatList(accepted.map(extension => extension.toUpperCase()))} file instead.`
      : null)
    onChange({ document_ids: [...(step.multiple ? documentIds : []), ...added] })
  }

  return (
    <VStack gap='xs'>
      {documentIds.map(id => (
        <HStack key={id} gap='sm' align='center' justify='space-between' className='UnifiedAskFormStory__File'>
          <Span size='sm' ellipsis noWrap>{id.replace(/^doc_/, '')}</Span>
          <Button variant='text' onPress={() => onChange({ document_ids: documentIds.filter(other => other !== id) })}>Remove</Button>
        </HStack>
      ))}
      {error ? <Span size='xs' status='error'>{error}</Span> : null}
      <HStack>
        <FileInput
          text={documentIds.length > 0 ? 'Add more files' : 'Upload files'}
          accept={accepted.map(extension => `.${extension}`).join(',')}
          allowMultipleUploads={step.multiple}
          onUpload={onUpload}
        />
      </HStack>
    </VStack>
  )
}

function StepView(props: StepViewProps) {
  const { step, answer, onChange, onPickOption, prompt, depth } = props
  const choice = answer && 'choice' in answer ? answer.choice : null
  const options = getOptions(step)
  const chosenOption = options.find(({ value }) => value === choice)

  const pickOption = (option: Option) => {
    if (option.value !== choice) onChange({ choice: option.value })
    onPickOption?.(option)
  }

  const renderInput = (): ReactNode => {
    if (isChoice(step) || isSearch(step)) {
      return (
        <>
          {options.length > 0 ? <OptionChips label={prompt ?? 'Options'} options={options} value={chosenOption ? choice : null} onPick={pickOption} /> : null}
          {isSearch(step) ? <SearchBox {...props} step={step} /> : null}
          {depth === 0 ? <FollowUpView {...props} option={chosenOption} /> : null}
        </>
      )
    }

    if (isUpload(step)) return <UploadView step={step} answer={answer} onChange={onChange} />
    if (isAction(step)) return null

    const text = answer && 'text' in answer ? answer.text : ''
    const onText = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ text: event.target.value })
    const placeholder = isText(step) ? step.placeholder : 'Answer in your own words'

    if (isText(step) && !step.multiline) {
      return <Input aria-label={prompt ?? placeholder ?? 'Answer'} placeholder={placeholder} value={text} onChange={onText} />
    }

    return <TextArea aria-label={prompt ?? placeholder ?? 'Answer'} placeholder={placeholder} value={text} onChange={onText} rows={3} />
  }

  return (
    <VStack gap='xs'>
      {prompt ? <P size='sm'>{prompt}</P> : null}
      {renderInput()}
    </VStack>
  )
}

/* ---------------------------------------------------------------- transactions */

const TransactionCells = ({ transaction: { date, amount, description } }: { transaction: AskTransaction }) => {
  const { formatDate } = useIntlFormatter()

  return (
    <>
      <Span className='Layer__CounterpartyAskTask__RowSummaryDate' size='xs' variant='subtle' noWrap>
        {formatDate(new Date(`${date}T00:00:00`), DateFormat.MonthDayShort)}
      </Span>
      <Span className='Layer__CounterpartyAskTask__RowSummaryDescription' size='sm' variant='subtle' noWrap withTooltip>
        {description}
      </Span>
      <MoneySpan
        className='Layer__CounterpartyAskTask__RowSummaryAmount'
        size='sm'
        weight='bold'
        numeric='tabular-nums'
        align='right'
        amount={amount}
        displayPlusSign={amount > 0}
      />
    </>
  )
}

const TransactionTable = ({ transactions }: { transactions: readonly AskTransaction[] }) => (
  <VStack className='Layer__CounterpartyAskTask__Rows UnifiedAskFormStory__Rows'>
    {transactions.map(transaction => (
      <VStack key={transaction.id} className='Layer__CounterpartyAskTask__Row' pi='md'>
        <HStack className='Layer__CounterpartyAskTask__RowSummary' align='center' gap='xs' overflow='hidden' fluid>
          <TransactionCells transaction={transaction} />
        </HStack>
      </VStack>
    ))}
  </VStack>
)

const TransactionSheet = (props: Omit<StepViewProps, 'step'> & { step: CategoryFields, transactions: readonly AskTransaction[] }) => {
  const { step, answer, onChange, labels, transactions, prompt } = props
  const rows = answer && 'transaction_answers' in answer ? answer.transaction_answers : []
  const rowStep: ChoiceFields | SearchFields = step.options?.length
    ? { type: 'CHOICE', prompt: '', options: step.options }
    : { type: 'SEARCH', entity: 'CATEGORY', placeholder: 'Search categories…' }

  const getRow = (transactionId: string) => rows.find(row => row.transaction_id === transactionId)?.answer
  const isRowAnswered = (transactionId: string) => isAnswered(rowStep, getRow(transactionId), 0)
  const firstOpen = () => transactions.find(({ id }) => !isRowAnswered(id))?.id ?? null

  const [openId, setOpenId] = useState(firstOpen)
  const answeredCount = transactions.filter(({ id }) => isRowAnswered(id)).length

  const setRow = (transactionId: string, rowAnswer: Answer) => {
    const nextRow: RowAnswer | undefined = 'choice' in rowAnswer ? rowAnswer : 'text' in rowAnswer ? rowAnswer : undefined
    if (!nextRow) return

    const others = rows.filter(row => row.transaction_id !== transactionId)
    const nextRows = transactions.flatMap(({ id }) => {
      if (id === transactionId) return [{ transaction_id: id, answer: nextRow }]
      const existing = others.find(row => row.transaction_id === id)
      return existing ? [existing] : []
    })

    onChange({ transaction_answers: nextRows })

    const pickedFollowUp = 'choice' in nextRow && getOptions(rowStep).find(({ value }) => value === nextRow.choice)?.follow_up

    if (!pickedFollowUp && isAnswered(rowStep, nextRow, 0)) {
      const nextOpen = transactions.find(({ id }) =>
        id !== transactionId && !isAnswered(rowStep, nextRows.find(row => row.transaction_id === id)?.answer, 0))
      setOpenId(nextOpen?.id ?? null)
    }
  }

  return (
    <VStack gap='sm'>
      {prompt ? <P size='sm' pi='md'>{prompt}</P> : null}
      <VStack className='Layer__CounterpartyAskTask__Rows UnifiedAskFormStory__SheetRows'>
        {transactions.map((transaction) => {
          const rowAnswer = getRow(transaction.id)
          const isOpen = openId === transaction.id
          const label = isRowAnswered(transaction.id) ? getLabel(rowStep, rowAnswer, labels) : null

          return (
            <VStack
              key={transaction.id}
              className={classNames('Layer__CounterpartyAskTask__Row', isOpen && 'Layer__CounterpartyAskTask__Row--open')}
              pi='md'
            >
              <Button className='Layer__CounterpartyAskTask__RowSummary' variant='text' underline={false} fullWidth onPress={() => setOpenId(transaction.id)}>
                <HStack align='center' gap='xs' overflow='hidden' fluid>
                  <TransactionCells transaction={transaction} />
                  {label ? <Span className='Layer__CounterpartyAskTask__RowSummaryAnswer' size='sm' align='right' ellipsis noWrap>{label}</Span> : null}
                </HStack>
              </Button>
              {isOpen
                ? (
                  <VStack pbe='sm' pbs='3xs'>
                    <StepView {...props} step={rowStep} prompt={undefined} answer={rowAnswer} onChange={next => setRow(transaction.id, next)} depth={0} />
                  </VStack>
                )
                : null}
            </VStack>
          )
        })}
      </VStack>
      <HStack justify='end' pi='md'>
        <Span size='xs' variant='subtle'>{`${answeredCount} of ${transactions.length} categorized`}</Span>
      </HStack>
    </VStack>
  )
}

/* ---------------------------------------------------------------- the form */

type View = { kind: 'PAGE', page: Page } | { kind: 'REVIEW' } | { kind: 'DONE' }
type Nav = { view: View, history: readonly Page[], direction: SlidingPanesDirection }

type LogEntry = { call: string, body?: unknown, response?: unknown }

type UnifiedAskFormStoryProps = {
  task: UnifiedAskFormTask
  stateEndpoint: StateEndpointBehaviour
}

const makeShellTask = (title: string, isDone: boolean): UserVisibleTask => ({
  id: '00000000-0000-4000-8000-000000000c01',
  status: isDone ? BusinessTaskStatus.UserMarkedCompleted : BusinessTaskStatus.Todo,
  title,
  question: '',
  taskType: null,
  userResponse: null,
  userResponseType: TaskUserResponseType.FreeResponse,
  documents: null,
})

const UnifiedAskFormStory = ({ task, stateEndpoint }: UnifiedAskFormStoryProps) => {
  const { pages, entry_page_id } = task.form
  const entryPage = pages.find(({ id }) => id === entry_page_id) ?? FALLBACK_PAGE
  const stepsById = useMemo(() => new Map(pages.flatMap(({ steps }) => steps.map(step => [step.id, step] as const))), [pages])
  const issues = useMemo(() => validateForm(task.form), [task.form])

  const [isOpen, setIsOpen] = useState(true)
  const [answers, setAnswers] = useState<Answers>({})
  const [labels, setLabels] = useState<Labels>({})
  const [nav, setNav] = useState<Nav>({ view: { kind: 'PAGE', page: entryPage }, history: [], direction: 'forward' })
  const [routing, setRouting] = useState<'idle' | 'loading' | 'error'>('idle')
  const [lastStateCall, setLastStateCall] = useState<LogEntry | null>(null)
  const [lastSearch, setLastSearch] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState<LogEntry | null>(null)

  const { view, history } = nav
  const isDone = view.kind === 'DONE'
  const visitedPages = view.kind === 'PAGE' ? [...history, view.page] : history

  const goForward = (next: View) => setNav(current => ({
    view: next,
    history: current.view.kind === 'PAGE' ? [...current.history, current.view.page] : current.history,
    direction: 'forward',
  }))

  const goBack = () => {
    setRouting('idle')
    setNav((current) => {
      const previous = current.history.at(-1)
      return previous ? { view: { kind: 'PAGE', page: previous }, history: current.history.slice(0, -1), direction: 'back' } : current
    })
  }

  const submit = (finalAnswers: Answers, pagesOnPath: readonly Page[]) => {
    const body = { answers: getAnswersForPages(pagesOnPath, finalAnswers) }
    setSubmitted({ call: 'POST /v1/businesses/:business_id/tasks/:task_id/unified-ask-form-response', body })
    goForward({ kind: 'DONE' })
  }

  const follow = (next: Next, page: Page, currentAnswers: Answers) => {
    if (next.kind === 'PAGE') {
      goForward({ kind: 'PAGE', page: pages.find(({ id }) => id === next.page_id) ?? FALLBACK_PAGE })
    }
    else if (next.kind === 'SUBMIT' && next.review) {
      goForward({ kind: 'REVIEW' })
    }
    else {
      submit(currentAnswers, [...history, page])
    }
  }

  const continueFrom = (page: Page, currentAnswers: Answers) => {
    if (!page.steps.every(step => isAnswered(step, currentAnswers[step.id], task.transactions.length))) return

    if (page.next.kind !== 'SERVER') {
      follow(getChosenOptionNext(page, currentAnswers) ?? page.next, page, currentAnswers)
      return
    }

    const pageHistory = [...history, page]
    const request: StateRequest = {
      page_id: page.id,
      page_history: pageHistory.map(({ id }) => id),
      answers: getAnswersForPages(pageHistory, currentAnswers),
    }

    setRouting('loading')
    setLastStateCall({ call: 'POST /v1/businesses/:business_id/tasks/:task_id/state', body: request })

    callStateEndpoint(task, request, stateEndpoint).then(
      (response) => {
        setRouting('idle')
        setLastStateCall({ call: 'POST /v1/businesses/:business_id/tasks/:task_id/state', body: request, response })
        follow(response.next_page_id === 'SUBMIT' ? { kind: 'SUBMIT' } : { kind: 'PAGE', page_id: response.next_page_id }, page, currentAnswers)
      },
      (error: unknown) => {
        setRouting('error')
        setLastStateCall({ call: 'POST /v1/businesses/:business_id/tasks/:task_id/state', body: request, response: String(error) })
      },
    )
  }

  const setAnswer = (stepId: string, answer: Answer) => setAnswers(current => ({ ...current, [stepId]: answer }))
  const onLabel = (id: string, label: string) => setLabels(current => ({ ...current, [id]: label }))
  const onSearch = (entity: SearchEntity, query: string) =>
    setLastSearch(`GET /v1/businesses/:business_id/search?entity=${entity}&q=${encodeURIComponent(query)}&task_id=:task_id&limit=20`)

  const getPrimaryLabel = (page: Page) => {
    const action = page.steps.find(step => isAction(step))
    if (action && isAction(action)) return ACTION_LABELS[action.action]
    if (page.next.kind === 'SERVER') return 'Next'

    const next = getChosenOptionNext(page, answers) ?? page.next
    if (next.kind === 'SUBMIT') return next.review ? 'Review' : 'Submit'
    return 'Next'
  }

  const renderPage = (page: Page) => {
    const isComplete = page.steps.every(step => isAnswered(step, answers[step.id], task.transactions.length))
    const action = page.steps.find(step => isAction(step))
    const [onlyStep] = page.steps
    const canAutoAdvance = page.steps.length === 1 && onlyStep && isChoice(onlyStep) && onlyStep.auto_advance === true && page.next.kind !== 'SERVER'

    const onPrimary = () => {
      const nextAnswers: Answers = action ? { ...answers, [action.id]: { completed: true } } : answers
      if (action) setAnswers(nextAnswers)
      continueFrom(page, nextAnswers)
    }

    return (
      <VStack gap='lg' pb='md'>
        {page.steps.map((step) => {
          const common = {
            answer: answers[step.id],
            onChange: (answer: Answer) => setAnswer(step.id, answer),
            onSearch,
            labels,
            onLabel,
            prompt: fillTemplate(step.prompt, stepsById, answers, labels),
            depth: 0,
          }

          if (isCategory(step)) return <TransactionSheet key={step.id} {...common} step={step} transactions={task.transactions} />

          return (
            <VStack key={step.id} pi='md'>
              <StepView
                {...common}
                step={step}
                onPickOption={canAutoAdvance
                  ? (option) => {
                    if (!option.follow_up) continueFrom(page, { ...answers, [step.id]: { choice: option.value } })
                  }
                  : undefined}
              />
            </VStack>
          )
        })}
        {routing === 'error'
          ? <HStack pi='md'><Span size='sm' status='error'>We couldn’t load the next question. Try again.</Span></HStack>
          : null}
        <HStack justify='space-between' align='center' pi='md'>
          <Span size='xs' variant='subtle'>{history.length > 0 ? `Page ${history.length + 1}` : ''}</Span>
          <Button isDisabled={!isComplete} isPending={routing === 'loading'} onPress={onPrimary}>
            {routing === 'error' ? 'Try again' : getPrimaryLabel(page)}
          </Button>
        </HStack>
      </VStack>
    )
  }

  const renderReview = () => (
    <VStack gap='md' pb='md' pi='md'>
      <P size='sm'>Here’s what you told us:</P>
      {history.flatMap(({ steps }) => steps).filter(step => !isAction(step) && answers[step.id]).map(step => (
        <VStack key={step.id} gap='3xs'>
          <Span size='xs' variant='subtle'>{fillTemplate(step.prompt, stepsById, answers, labels) ?? step.id}</Span>
          <Span size='sm'>{getLabel(step, answers[step.id], labels) ?? '—'}</Span>
        </VStack>
      ))}
      <HStack justify='end'>
        <Button onPress={() => submit(answers, history)}>Submit</Button>
      </HStack>
    </VStack>
  )

  const renderDone = () => (
    <VStack gap='md' pb='md' pi='md'>
      <P size='sm' weight='bold'>Thanks, we’ll take it from here.</P>
      <HStack justify='end'>
        <Button
          variant='outlined'
          onPress={() => setNav({ view: { kind: 'PAGE', page: entryPage }, history: [], direction: 'back' })}
        >
          Edit answer
        </Button>
      </HStack>
    </VStack>
  )

  const showsTable = view.kind !== 'DONE' && !(view.kind === 'PAGE' && view.page.steps.some(step => isCategory(step)))
  const [firstStep] = entryPage.steps
  const summary = firstStep ? getLabel(firstStep, answers[firstStep.id], labels) : null
  const paneKey = view.kind === 'PAGE' ? `page:${view.page.id}` : view.kind

  return (
    <HStack gap='lg' className='UnifiedAskFormStory'>
      <VStack className='UnifiedAskFormStory__Task'>
        <Container name='tasks'>
          <div className='Layer__tasks-list'>
            <TasksListItemShell
              task={makeShellTask(task.title, isDone)}
              isOpen={isOpen}
              onToggle={() => setIsOpen(open => !open)}
              isFlush
              slotProps={{
                Header: {
                  backAction: history.length > 0 && !isDone ? { isDisabled: routing === 'loading', onBack: goBack } : null,
                  answer: isDone && summary ? { kind: 'account', name: summary } : null,
                },
              }}
            >
              <VStack gap='md'>
                {showsTable ? <TransactionTable transactions={task.transactions} /> : null}
                <SlidingPanes paneKey={paneKey} direction={nav.direction} keepInView={isOpen}>
                  {view.kind === 'PAGE' ? renderPage(view.page) : view.kind === 'REVIEW' ? renderReview() : renderDone()}
                </SlidingPanes>
              </VStack>
            </TasksListItemShell>
          </div>
        </Container>
      </VStack>
      <Inspector
        issues={issues}
        location={view.kind === 'PAGE' ? view.page.id : view.kind}
        history={visitedPages.map(({ id }) => id)}
        lastStateCall={lastStateCall}
        lastSearch={lastSearch}
        answers={getAnswersForPages(visitedPages, answers)}
        submitted={submitted}
        task={task}
      />
    </HStack>
  )
}

/* ---------------------------------------------------------------- inspector */

const Json = ({ value }: { value: unknown }) => <Span size='xs' className='UnifiedAskFormStory__Code'>{JSON.stringify(value, null, 2)}</Span>

const InspectorSection = ({ title, children }: { title: string, children: ReactNode }) => (
  <VStack gap='xs' className='UnifiedAskFormStory__Section'>
    <Span size='xs' weight='bold'>{title}</Span>
    {children}
  </VStack>
)

type InspectorProps = {
  issues: readonly string[]
  location: string
  history: readonly string[]
  lastStateCall: LogEntry | null
  lastSearch: string | null
  answers: Answers
  submitted: LogEntry | null
  task: UnifiedAskFormTask
}

const Inspector = ({ issues, location, history, lastStateCall, lastSearch, answers, submitted, task }: InspectorProps) => (
  <VStack gap='md' className='UnifiedAskFormStory__Inspector'>
    <VStack gap='3xs'>
      <Heading size='xs' level={3}>{`Contract v${SPEC_VERSION} · ${task.form_subtype}`}</Heading>
      <Span size='xs' variant='subtle'>{`Prototype only. Edit the task spec in Controls. Spec: ${SPEC_URL}`}</Span>
    </VStack>

    <InspectorSection title='Spec checks'>
      {issues.length > 0
        ? issues.map(issue => <Span key={issue} size='xs' status='warning'>{`• ${issue}`}</Span>)
        : <Span size='xs' variant='subtle'>No issues. The form follows the v0.0.3 rules.</Span>}
    </InspectorSection>

    <InspectorSection title='Where the customer is'>
      <Span size='xs'>{`Showing: ${location}`}</Span>
      <Span size='xs' variant='subtle'>{`Pages visited: ${history.join(' → ') || '—'}`}</Span>
    </InspectorSection>

    <InspectorSection title='Last state endpoint call'>
      {lastStateCall
        ? (
          <>
            <Span size='xs'>{lastStateCall.call}</Span>
            <Json value={lastStateCall.body} />
            {lastStateCall.response === undefined ? <Span size='xs' variant='subtle'>Waiting…</Span> : <Json value={lastStateCall.response} />}
          </>
        )
        : <Span size='xs' variant='subtle'>None yet. Only pages whose next is SERVER call it.</Span>}
    </InspectorSection>

    <InspectorSection title='Last search'>
      <Span size='xs' variant={lastSearch ? undefined : 'subtle'}>{lastSearch ?? 'None yet.'}</Span>
    </InspectorSection>

    <InspectorSection title={submitted ? 'Submitted' : 'Answers so far (pages visited)'}>
      {submitted ? <Span size='xs'>{submitted.call}</Span> : null}
      <Json value={submitted?.body ?? { answers }} />
    </InspectorSection>

    <InspectorSection title='Form definition (the task the backend sent)'>
      <Span size='xs' variant='subtle'>Edit it in Controls → task. The form resets on every change.</Span>
      <Json value={task} />
    </InspectorSection>
  </VStack>
)

/* ---------------------------------------------------------------- example specs */

const isoDate = (month: number, day: number) => {
  const date = new Date(FIXTURE_YEAR, month - 1, day)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const txn = (prefix: string, index: number, month: number, day: number, amount: number, description: string): AskTransaction => ({
  id: `${prefix}-${index}`,
  date: isoDate(month, day),
  amount,
  description,
})

const differentCategory: Option = {
  value: 'different_category',
  label: 'A different category',
  follow_up: { type: 'SEARCH', entity: 'CATEGORY', placeholder: 'Search all categories…' },
}

const notSure = (placeholder: string, next?: Next): Option => ({
  value: 'not_sure',
  label: 'Not sure',
  follow_up: { type: 'TEXT', multiline: true, placeholder },
  ...(next ? { next } : {}),
})

const mixOption = (pageId: PageId): Option => ({ value: 'mix', label: 'It’s a mix or it varies', next: { kind: 'PAGE', page_id: pageId } })

type CounterpartyCopy = {
  subtype: 'COUNTERPARTY' | 'P2P_COUNTERPARTY'
  title: string
  pickPrompt: string
  notSurePlaceholder: string
  rowNotSurePlaceholder: string
  sheetPrompt: string
  rememberPrompt: string
  suggestions: string[]
  transactions: AskTransaction[]
}

const makeCounterpartyTask = (copy: CounterpartyCopy): UnifiedAskFormTask => ({
  task_type: 'UNIFIED_ASK_FORM',
  form_subtype: copy.subtype,
  title: copy.title,
  transactions: copy.transactions,
  form: {
    entry_page_id: 'pick',
    pages: [
      {
        id: 'pick',
        next: { kind: 'PAGE', page_id: 'remember' },
        steps: [{
          id: 'category',
          type: 'CHOICE',
          prompt: copy.pickPrompt,
          options: [...copy.suggestions.map(category), differentCategory, mixOption('itemise'), notSure(copy.notSurePlaceholder, { kind: 'SUBMIT' })],
        }],
      },
      {
        id: 'itemise',
        next: { kind: 'SUBMIT' },
        steps: [{
          id: 'rows',
          type: 'CATEGORY',
          prompt: copy.sheetPrompt,
          options: [...copy.suggestions.map(category), differentCategory, notSure(copy.rowNotSurePlaceholder)],
        }],
      },
      {
        id: 'remember',
        next: { kind: 'SUBMIT' },
        steps: [{
          id: 'always_this',
          type: 'CHOICE',
          prompt: copy.rememberPrompt,
          options: [
            { value: 'always', label: 'Yes, automatically categorize them' },
            { value: 'ask', label: 'No, keep asking me about them' },
          ],
        }],
      },
    ],
  },
})

const COUNTERPARTY_TASK = makeCounterpartyTask({
  subtype: 'COUNTERPARTY',
  title: 'What were your Costco purchases for?',
  pickPrompt: 'You spent $307.74 at Costco across 3 transactions. What were these for?',
  notSurePlaceholder: 'Tell us anything you remember about these purchases',
  rowNotSurePlaceholder: 'Tell us anything you remember about this purchase',
  sheetPrompt: 'Can you share more about what each transaction was for below?',
  rememberPrompt: 'Should we assume your future Costco purchases are {{answer.category.label}} going forward?',
  suggestions: ['Office Expenses', 'Software', 'Business Meals'],
  transactions: [
    txn('costco', 0, 5, 3, -12874, 'COSTCO WHSE #0478 SAN JOSE CA'),
    txn('costco', 1, 5, 19, -9650, 'COSTCO WHSE #0478 SAN JOSE CA'),
    txn('costco', 2, 6, 7, -8250, 'COSTCO WHSE #0478 SAN JOSE CA'),
  ],
})

const P2P_TASK = makeCounterpartyTask({
  subtype: 'P2P_COUNTERPARTY',
  title: 'What were your Venmo payments to Alex Rivera for?',
  pickPrompt: 'You paid Alex Rivera $525.00 on Venmo across 3 payments. What were these for?',
  notSurePlaceholder: 'Tell us anything you remember about these payments',
  rowNotSurePlaceholder: 'Tell us anything you remember about this payment',
  sheetPrompt: 'Can you share more about what each payment was for below?',
  rememberPrompt: 'Should we assume your future Venmo payments to Alex Rivera are {{answer.category.label}} going forward?',
  suggestions: ['Contractors', 'Rent', 'Legal and Professional Services'],
  transactions: [
    txn('venmo', 0, 5, 2, -15000, 'VENMO PAYMENT 1023456 ALEX RIVERA'),
    txn('venmo', 1, 6, 2, -15000, 'VENMO PAYMENT 1029981 ALEX RIVERA'),
    txn('venmo', 2, 7, 1, -22500, 'VENMO PAYMENT 1034410 ALEX RIVERA'),
  ],
})

const VENDOR_CATEGORIES = ['Software', 'Contractors', 'Office Expenses', 'Rent']

const makeAccountMaskTask = (transactions: AskTransaction[]): UnifiedAskFormTask => ({
  task_type: 'UNIFIED_ASK_FORM',
  form_subtype: 'ACCOUNT_MASK',
  title: 'Help us identify account ••2691',
  transactions,
  form: {
    entry_page_id: 'account_type',
    pages: [
      {
        id: 'account_type',
        next: { kind: 'SUBMIT' },
        steps: [{
          id: 'account_type',
          type: 'CHOICE',
          auto_advance: true,
          prompt: 'What kind of account is ••2691?',
          options: [
            { value: 'personal', label: 'A personal account' },
            { value: 'owned', label: 'Another account my business owns', next: { kind: 'PAGE', page_id: 'connect' } },
            { value: 'vendor', label: 'A vendor I pay', next: { kind: 'PAGE', page_id: 'vendor' } },
            { value: 'customer', label: 'A customer who pays me', next: { kind: 'PAGE', page_id: 'customer' } },
            {
              value: 'unsure',
              label: 'Not sure',
              follow_up: { type: 'TEXT', multiline: true, prompt: 'Tell us anything you know about this account.' },
            },
          ],
        }],
      },
      {
        id: 'connect',
        next: { kind: 'SUBMIT' },
        steps: [{
          id: 'connect',
          type: 'ACTION',
          action: 'CONNECT_ACCOUNT',
          prompt: 'Connect this account so we can pull its transactions for you automatically.',
        }],
      },
      {
        id: 'vendor',
        next: { kind: 'SUBMIT' },
        steps: [
          {
            id: 'vendor',
            type: 'SEARCH_WITH_FREEFORM',
            entity: 'VENDOR',
            prompt: 'Who is the vendor?',
            placeholder: 'Search your vendors or type a name',
          },
          {
            id: 'vendor_category',
            type: 'SEARCH',
            entity: 'CATEGORY',
            prompt: 'What do you buy from them?',
            placeholder: 'Search all categories…',
            options: [...VENDOR_CATEGORIES.map(category), mixOption('itemise')],
          },
        ],
      },
      {
        id: 'itemise',
        next: { kind: 'SUBMIT' },
        steps: [{ id: 'rows', type: 'CATEGORY', prompt: 'What was each of these payments for?', options: [...VENDOR_CATEGORIES.map(category), differentCategory] }],
      },
      {
        id: 'customer',
        next: { kind: 'SUBMIT' },
        steps: [{
          id: 'paid_through',
          type: 'CHOICE',
          prompt: 'Did these payments come through Jobber?',
          options: [
            { value: 'platform', label: 'Yes, through Jobber' },
            { value: 'direct', label: 'No, they paid me directly' },
            { value: 'not_sure', label: 'Not sure' },
          ],
        }],
      },
    ],
  },
})

const MONTHLY_TRANSFERS = [5, 6, 7, 8, 9].map((month, index) =>
  txn('mask', index, month, 16, -100000, `ONLINE TRANSFER TO XXXXXX2691 REF #${4810 + index}`))

const SIXTY_PAYMENTS = Array.from({ length: 60 }, (_, index) =>
  txn('mask', index, 1, 3 + index * 6, -(12500 + ((index * 7919) % 48000)), `ACH DEBIT XXXXXX2691 INV ${2001 + index}`))

const ACCOUNT_MASK_TASK = makeAccountMaskTask(MONTHLY_TRANSFERS)

const STEP_GALLERY_TASK: UnifiedAskFormTask = {
  task_type: 'UNIFIED_ASK_FORM',
  form_subtype: 'STEP_GALLERY',
  title: 'Every step kind in v0.0.3',
  transactions: [
    txn('gallery', 0, 4, 9, 240000, 'ACH CREDIT XXXXXX5520 PAYMENT'),
    txn('gallery', 1, 5, 11, 185000, 'ACH CREDIT XXXXXX5520 PAYMENT'),
  ],
  form: {
    entry_page_id: 'how_paid',
    pages: [
      {
        id: 'how_paid',
        next: { kind: 'PAGE', page_id: 'who_paid' },
        steps: [{
          id: 'how_paid',
          type: 'CHOICE',
          prompt: 'CHOICE with a follow-up: how did this customer pay you?',
          options: [
            { value: 'ach', label: 'Bank transfer' },
            { value: 'check', label: 'Check' },
            { value: 'other', label: 'Something else', follow_up: { type: 'TEXT', placeholder: 'How did they pay?' } },
          ],
        }],
      },
      {
        id: 'who_paid',
        next: { kind: 'SERVER' },
        steps: [
          {
            id: 'customer',
            type: 'SEARCH_WITH_FREEFORM',
            entity: 'CUSTOMER',
            prompt: 'SEARCH_WITH_FREEFORM on a SERVER page: who paid you? Type a new name to get a follow-up page.',
            placeholder: 'Search your customers or type a name',
          },
          { id: 'invoice', type: 'TEXT', prompt: 'TEXT on the same page: what was the invoice number?', placeholder: 'e.g. INV-1042' },
        ],
      },
      {
        id: 'new_customer',
        next: { kind: 'PAGE', page_id: 'upload' },
        steps: [{
          id: 'customer_kind',
          type: 'CHOICE',
          prompt: 'Only shown when the backend hasn’t seen this customer: is {{answer.customer.label}} a regular customer?',
          options: [
            { value: 'regular', label: 'Yes, they pay me regularly' },
            { value: 'one_off', label: 'No, this was a one-off' },
          ],
        }],
      },
      {
        id: 'upload',
        next: { kind: 'PAGE', page_id: 'unknown' },
        steps: [{ id: 'statements', type: 'UPLOAD', prompt: 'UPLOAD: add the invoices for these payments.', accept: ['pdf', 'png', 'jpg', 'csv'], multiple: true }],
      },
      {
        id: 'unknown',
        next: { kind: 'SUBMIT', review: true },
        steps: [{ id: 'coverage', type: 'DATE_RANGE', prompt: 'Unknown kind (DATE_RANGE) falls back to free text: which months do these cover?' }],
      },
    ],
  },
}

const BROKEN_SPEC_TASK: UnifiedAskFormTask = {
  ...COUNTERPARTY_TASK,
  form_subtype: 'COUNTERPARTY',
  title: 'A spec that breaks the v0.0.3 rules',
  form: {
    entry_page_id: 'pick',
    pages: [
      {
        id: 'pick',
        next: { kind: 'SERVER' },
        steps: [{
          id: 'category',
          type: 'CHOICE',
          prompt: 'This page routes through SERVER, but an option also sets next.',
          options: [
            { value: 'acct_office_expenses', label: 'Office Expenses', next: { kind: 'PAGE', page_id: 'remember' } },
            {
              value: 'something_else',
              label: 'Something else',
              follow_up: {
                type: 'CHOICE',
                prompt: 'A follow-up with its own follow-up',
                options: [{ value: 'deeper', label: 'Deeper', follow_up: { type: 'TEXT' } }],
              },
            },
            { value: 'mix', label: 'It’s a mix or it varies', next: { kind: 'PAGE', page_id: 'itemize' } },
          ],
        }],
      },
    ],
  },
}

/* ---------------------------------------------------------------- stories */

const STORY_STYLES = `
  .UnifiedAskFormStory__Root {
    min-block-size: 100vh;
    background: var(--color-base-0);
  }

  .UnifiedAskFormStory {
    flex-wrap: wrap;
    align-items: flex-start;
    padding: var(--spacing-lg);
  }

  .UnifiedAskFormStory__Task {
    flex: 1 1 22rem;
    max-inline-size: 36rem;
  }

  .UnifiedAskFormStory__Inspector {
    flex: 1 1 18rem;
    max-inline-size: 30rem;
    padding: var(--spacing-md);
    border: 1px dashed var(--border-color);
    border-radius: var(--border-radius-sm, 8px);
    background: var(--color-base-0);
  }

  .UnifiedAskFormStory__Section {
    padding-block-start: var(--spacing-sm);
    border-block-start: 1px solid var(--border-color);
  }

  .UnifiedAskFormStory__Code {
    display: block;
    overflow: auto;
    max-block-size: 18rem;
    padding: var(--spacing-xs);
    border-radius: 6px;
    background: var(--color-base-50);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    white-space: pre;
  }

  .UnifiedAskFormStory__File {
    padding: var(--spacing-2xs) var(--spacing-xs);
    border: 1px solid var(--border-color);
    border-radius: 6px;
  }

  .UnifiedAskFormStory__Rows.Layer__CounterpartyAskTask__Rows {
    overflow-y: auto;
    max-block-size: 10rem;
  }

  .UnifiedAskFormStory__Rows .Layer__CounterpartyAskTask__Row:hover {
    background: none;
  }

  .UnifiedAskFormStory__SheetRows.Layer__CounterpartyAskTask__Rows {
    overflow-y: auto;
    max-block-size: 24rem;
  }
`

const DOCS = `
Renders any form written against the [Unified Ask Form contract v${SPEC_VERSION}](${SPEC_URL}) through one renderer.

- **Edit the spec live**: the \`task\` control holds the whole task the backend would send. Change copy, options, routes or
  add pages; the form resets on every edit.
- **Inspector**: spec checks (the backend's validation rules), the pages visited, the last state endpoint call, the last
  search request, and the answers the client would post.
- **Mocked endpoints**: in "Every step kind", the state endpoint sends a customer typed as a new name to an extra
  \`new_customer\` page, and a picked customer straight on to \`upload\`. "It's a mix" always submits after the sheet, so
  no other story routes through SERVER. Set \`stateEndpoint\` to \`fails\` to see the retry state. Search filters a local index of
  categories, vendors and customers.

Stories: counterparty and P2P (the same pages, different server copy), account mask, account mask with 60 transactions,
every step kind, and a spec that breaks the rules.
`

const meta: Meta<UnifiedAskFormStoryProps> = {
  title: 'Scratch/UnifiedAskForm',
  parameters: {
    docs: { description: { component: DOCS } },
    chromatic: { viewports: [1280] },
  },
  args: {
    task: COUNTERPARTY_TASK,
    stateEndpoint: 'responds',
  },
  argTypes: {
    task: { control: 'object', description: `The task as the backend sends it, per contract v${SPEC_VERSION}.` },
    stateEndpoint: {
      control: 'inline-radio',
      options: ['responds', 'fails'],
      description: 'How the mocked state endpoint behaves for pages whose next is SERVER.',
    },
  },
  decorators: [
    Story => (
      <div className='Layer__component UnifiedAskFormStory__Root'>
        <style>{STORY_STYLES}</style>
        <Story />
      </div>
    ),
  ],
  render: args => <UnifiedAskFormStory key={JSON.stringify(args)} {...args} />,
}

export default meta

type Story = StoryObj<UnifiedAskFormStoryProps>

export const Counterparty: Story = {
  tags: ['real-backend'],
  args: { task: COUNTERPARTY_TASK },
}

export const P2PCounterparty: Story = {
  name: 'P2P counterparty',
  tags: ['real-backend'],
  args: { task: P2P_TASK },
}

export const AccountMask: Story = {
  tags: ['real-backend'],
  args: { task: ACCOUNT_MASK_TASK },
}

export const AccountMaskSixtyTransactions: Story = {
  name: 'Account mask, 60 transactions',
  tags: ['real-backend'],
  args: { task: makeAccountMaskTask(SIXTY_PAYMENTS) },
}

export const StepGallery: Story = {
  name: 'Every step kind',
  tags: ['real-backend'],
  args: { task: STEP_GALLERY_TASK },
}

export const SpecChecks: Story = {
  name: 'Spec that breaks the rules',
  tags: ['real-backend'],
  args: { task: BROKEN_SPEC_TASK },
}
