import { Either, ParseResult, Schema } from 'effect'
import { HttpResponse } from 'msw'

import { apiError } from '@msw/utils/apiResponse'

export const readRequestJson = async (request: Request): Promise<unknown> => {
  return JSON.parse(await request.text()) as unknown
}

export const readRequestFiles = async (request: Request, field = 'file'): Promise<File[]> => {
  const formData = await request.formData()

  return formData.getAll(field).filter((entry): entry is File => typeof entry !== 'string')
}

const badRequest = (description: string) =>
  HttpResponse.json(apiError(description, { type: 'Bad Request' }), { status: 400 })

export const decodeRequestBody = <A, I>(schema: Schema.Schema<A, I>, body: unknown): A => {
  const decoded = Schema.decodeUnknownEither(schema, { onExcessProperty: 'error' })(body)

  if (Either.isRight(decoded)) return decoded.right

  const description = ParseResult.ArrayFormatter.formatErrorSync(decoded.left)
    .map(({ path, message }) => (path.length > 0 ? `${path.map(String).join('.')}: ${message}` : message))
    .join('; ')

  // MSW sends a thrown Response as the mocked response.
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  throw badRequest(description)
}

export const assertRequest = (condition: boolean, description: string) => {
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  if (!condition) throw badRequest(description)
}
