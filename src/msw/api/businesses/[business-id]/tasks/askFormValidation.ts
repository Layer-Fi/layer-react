import { Schema } from 'effect'
import { HttpResponse } from 'msw'

import {
  type AskFormAnswer,
  type AskFormAnswers,
  type AskFormFollowUpAnswer,
} from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormAnswer'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ACCOUNT_PREFIX = 'acct_'

const badRequest = (description: string) =>
  HttpResponse.json({ errors: [{ type: 'Bad Request', description }] }, { status: 400 })

const findAnswerProblem = (answer: AskFormAnswer | AskFormFollowUpAnswer): string | null => {
  if ('choice' in answer) {
    if (answer.choice.startsWith(ACCOUNT_PREFIX) && !UUID_PATTERN.test(answer.choice.slice(ACCOUNT_PREFIX.length))) {
      return `Invalid acct id: ${answer.choice}`
    }

    if (!('followUp' in answer) || !answer.followUp) return null
    if ('documentIds' in answer.followUp) return 'A follow_up answer must be a choice or text'

    return findAnswerProblem(answer.followUp)
  }

  if ('text' in answer) return answer.text.trim() ? null : 'text must not be blank'

  if ('documentIds' in answer) return answer.documentIds.length > 0 ? null : 'document_ids must not be empty'

  if ('transactionAnswers' in answer) {
    const ids = answer.transactionAnswers.map(({ transactionId }) => transactionId)

    if (ids.length === 0) return 'transaction_answers must not be empty'
    if (new Set(ids).size !== ids.length) return 'Duplicate transaction answers'

    return answer.transactionAnswers.map(row => findAnswerProblem(row.answer)).find(problem => problem !== null) ?? null
  }

  return null
}

export const decodeAskFormRequest = <A extends { answers: AskFormAnswers }, I>(
  schema: Schema.Schema<A, I>,
  body: unknown,
  { allowEmptyAnswers = false }: { allowEmptyAnswers?: boolean } = {},
): A => {
  let decoded: A

  try {
    decoded = Schema.decodeUnknownSync(schema, { onExcessProperty: 'error' })(body)
  }
  catch (error) {
    // MSW sends a thrown Response as the mocked response.
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw badRequest(error instanceof Error ? error.message : 'Malformed ask form request')
  }

  const answers = Object.values(decoded.answers)
  const problem = !allowEmptyAnswers && answers.length === 0
    ? 'answers must not be empty'
    : answers.map(findAnswerProblem).find(found => found !== null)

  // eslint-disable-next-line @typescript-eslint/only-throw-error
  if (problem) throw badRequest(problem)

  return decoded
}

export const assertAskFormRequest = (condition: boolean, description: string) => {
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  if (!condition) throw badRequest(description)
}
