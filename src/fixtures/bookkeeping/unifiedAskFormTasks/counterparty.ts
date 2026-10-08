import { type AskForm } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import { AskFormCategoryScope, type AskFormOption } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { type AskFormTransaction, type UnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'

import { bankTransactionCategories, type BankTransactionCategory } from '@fixtures/bankTransactions/constants'
import {
  ASK_FORM_STEP_IDS,
  askTransactions,
  categoryOption,
  categoryStep,
  choiceStep,
  COUNTERPARTY_ASK_FORM_VALUES,
  fixtureId,
  makeUnifiedAskFormTask,
  page,
  seedsInFixtureYear,
  textFollowUp,
  toPage,
} from '@fixtures/bookkeeping/unifiedAskFormTasks/utils'
import { formatDollars } from '@fixtures/bookkeeping/utils'

type CounterpartyAskFormCopy = {
  pickPrompt: string
  rememberPrompt: string
  noun: 'purchase' | 'payment'
}

export const mixOption = (pageId: string): AskFormOption => ({
  value: COUNTERPARTY_ASK_FORM_VALUES.mix,
  label: 'It\'s a mix or it varies',
  next: toPage(pageId),
})

export const makeCounterpartyAskForm = (
  suggestions: ReadonlyArray<AskFormOption>,
  { pickPrompt, rememberPrompt, noun }: CounterpartyAskFormCopy,
): AskForm => {
  const notSure: AskFormOption = {
    value: COUNTERPARTY_ASK_FORM_VALUES.notSure,
    label: 'Something else',
    followUp: textFollowUp(null, `Tell us anything you remember about these ${noun}s`),
  }

  return {
    entryPageId: 'pick',
    pages: [
      page('pick', [categoryStep(ASK_FORM_STEP_IDS.category, pickPrompt, [...suggestions, mixOption('itemise'), notSure])], toPage('remember')),
      page('itemise', [categoryStep(
        ASK_FORM_STEP_IDS.rows,
        'Can you share more about what each transaction was for below?',
        [...suggestions, notSure],
        { scope: AskFormCategoryScope.EachTransaction },
      )]),
      page('remember', [choiceStep(ASK_FORM_STEP_IDS.alwaysThis, rememberPrompt, [
        { value: COUNTERPARTY_ASK_FORM_VALUES.always, label: 'Yes, automatically categorize them' },
        { value: COUNTERPARTY_ASK_FORM_VALUES.ask, label: 'No, keep asking me about them' },
      ])]),
    ],
  }
}

type CounterpartyTaskSeed = Pick<UnifiedAskFormTask, 'id' | 'transactions'> & {
  counterparty: string
  suggestions: ReadonlyArray<BankTransactionCategory>
  title?: string
  question?: string
  noun?: CounterpartyAskFormCopy['noun']
}

const spentQuestion = (counterparty: string, transactions: ReadonlyArray<AskFormTransaction>) => {
  const total = transactions.reduce((sum, { amount }) => sum + Math.abs(amount), 0)
  const count = `${transactions.length} ${transactions.length === 1 ? 'transaction' : 'transactions'}`

  return `You spent ${formatDollars(total)} at ${counterparty} across ${count}. Can you tell us a bit more about what these were for?`
}

export const makeCounterpartyTask = ({
  id,
  counterparty,
  transactions,
  suggestions,
  title = `${counterparty} purchases`,
  question = spentQuestion(counterparty, transactions),
  noun = 'purchase',
}: CounterpartyTaskSeed) =>
  makeUnifiedAskFormTask({
    id,
    title,
    question,
    transactions,
    form: makeCounterpartyAskForm(suggestions.map(categoryOption), {
      pickPrompt: question,
      rememberPrompt: `Should we assume your future ${title} are {{answer.${ASK_FORM_STEP_IDS.category}.label}} going forward?`,
      noun,
    }),
  })

const RETAIL_SUGGESTIONS = [
  bankTransactionCategories.officeExpenses,
  bankTransactionCategories.otherBusinessExpenses,
  bankTransactionCategories.meals,
]

export const counterpartyTaskSeeds = seedsInFixtureYear({
  7: makeCounterpartyTask({
    id: fixtureId('917'),
    counterparty: 'SQ *NAIL BAR',
    suggestions: [],
    transactions: askTransactions(7, [{ id: 'a08', day: 9, amount: -8400, description: 'SQ *NAIL BAR' }]),
  }),
  8: makeCounterpartyTask({
    id: fixtureId('916'),
    counterparty: 'Brick and Mortar Real Estate Services',
    suggestions: [bankTransactionCategories.rent],
    transactions: askTransactions(8, [{ id: 'a07', day: 1, amount: -73674, description: 'BRICK+MORTAR RE SVCS' }]),
  }),
  9: makeCounterpartyTask({
    id: fixtureId('911'),
    counterparty: 'Costco',
    suggestions: RETAIL_SUGGESTIONS,
    transactions: askTransactions(9, [{ id: 'a01', day: 14, amount: -30774, description: 'COSTCO WHSE #1042' }]),
  }),
  10: makeCounterpartyTask({
    id: fixtureId('912'),
    counterparty: 'Costco',
    suggestions: RETAIL_SUGGESTIONS,
    transactions: askTransactions(10, [
      { id: 'a02', day: 3, amount: -61250, description: 'COSTCO WHSE #1042' },
      { id: 'a03', day: 19, amount: -22395, description: 'COSTCO GAS #1042' },
    ]),
  }),
  11: makeCounterpartyTask({
    id: fixtureId('913'),
    counterparty: 'Costco',
    question: '3 more Costco transactions came in, totaling $297.48. Can you tell us a bit more about what these were for?',
    suggestions: RETAIL_SUGGESTIONS,
    transactions: askTransactions(11, [
      { id: 'a04', day: 2, amount: -14899, description: 'COSTCO WHSE #1042' },
      { id: 'a05', day: 11, amount: -9932, description: 'COSTCO WHSE #1042' },
      { id: 'a06', day: 27, amount: -4917, description: 'COSTCO GAS #1042' },
    ]),
  }),
})
