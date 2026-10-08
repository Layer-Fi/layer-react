import { pipe, Schema } from 'effect'

import { type AskFormNext, AskFormNextKind, AskFormNextSchema } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNext'
import { AskFormStepSchema } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'

export const AskFormPageSchema = Schema.Struct({
  id: Schema.String,
  steps: Schema.Array(AskFormStepSchema),
  next: AskFormNextSchema,
})

export type AskFormPage = typeof AskFormPageSchema.Type

const API_PATH_PREFIX = '/v1/'

const findBrokenRoute = ({ entryPageId, pages }: { entryPageId: string, pages: ReadonlyArray<AskFormPage> }): string | null => {
  const pageIds = new Set(pages.map(({ id }) => id))

  if (!pageIds.has(entryPageId)) return `entry_page_id ${entryPageId} is not a page`

  const routes = pages.flatMap(page => [
    page.next,
    ...page.steps.flatMap(step => ('options' in step ? step.options : []).flatMap(({ next }) => (next ? [next] : []))),
  ])

  const isBroken = (next: AskFormNext) =>
    (next.kind === AskFormNextKind.Page && !pageIds.has(next.pageId))
    || (next.kind === AskFormNextKind.Server && !next.url.startsWith(API_PATH_PREFIX))

  const broken = routes.find(isBroken)

  return broken ? `Ask form route ${JSON.stringify(broken)} does not resolve` : null
}

// A form that routes somewhere it can't go fails to decode, so its task is hidden rather than stranded.
export const AskFormSchema = Schema.Struct({
  entryPageId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entry_page_id'),
  ),
  pages: Schema.Array(AskFormPageSchema),
}).pipe(Schema.filter(form => findBrokenRoute(form) ?? true))

export type AskForm = typeof AskFormSchema.Type
export type AskFormEncoded = typeof AskFormSchema.Encoded
