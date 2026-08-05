/**
 * The shape of a translation key: `<namespace>:<Owner>.<category>.<snake_case_key>`.
 * See src/assets/locales/SKILL.md.
 */

/** `usStates` is a data table of 53 state names, declared once outside any component. */
export const OWNER_EXEMPT_NAMESPACES = ['usStates']

export const PLURAL_CATEGORIES = ['zero', 'one', 'two', 'few', 'many', 'other']

export const CATEGORIES = new Set([
  'action', 'banner', 'delete', 'disclaimer', 'empty', 'error', 'label', 'placeholder', 'prompt',
  'services', 'state', 'title', 'toast', 'tooltip', 'validation',
])

/** Matches a namespaced key, and nothing else that merely contains a colon. */
export const KEY_PATTERN = String.raw`[a-z][A-Za-z]*:[A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)*`

/** The owner is every segment before the category, so it may be dotted (`Tasks.TasksHeader`). */
export const ownerOf = (key) => {
  const segments = key.slice(key.indexOf(':') + 1).split('.')
  const at = segments.findIndex(segment => CATEGORIES.has(segment))
  return at > 0 ? segments.slice(0, at).join('.') : undefined
}

/** Splits `…_one` into its base and category, or returns undefined when there is no category. */
export const splitPluralCategory = (key) => {
  const match = key.match(new RegExp(String.raw`^(.*)_(${PLURAL_CATEGORIES.join('|')})$`))
  return match ? { base: match[1], category: match[2] } : undefined
}
