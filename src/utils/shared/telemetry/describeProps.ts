import { isValidElement } from 'react'

import { type LoggedProp, PropKind } from '@schemas/common/componentUsage'

const MAX_PROPS = 60
const MAX_KEY_PATHS = 50
const MAX_KEY_DEPTH = 3

const isPlainObject = (value: object) => {
  const prototype = Object.getPrototypeOf(value) as unknown
  return prototype === Object.prototype || prototype === null
}

// `Object.entries` widens an `object` value to `any`; this is the one place that boundary is crossed.
const entriesOf = (value: object) => Object.entries(value as Record<string, unknown>)

const containsElement = (values: ReadonlyArray<unknown>) => values.some(value => isValidElement(value))

/**
 * Dotted paths of the keys inside a config prop, so a `stringOverrides` leaf or a
 * `slotProps.profitAndLoss.chart` branch can be deprecated on evidence. Names only — a value is
 * never read, only its shape, and the walk stops at `MAX_KEY_DEPTH`.
 */
const flattenKeyPaths = (value: object, prefix = '', depth = 1): string[] =>
  entriesOf(value).flatMap(([key, nested]) => {
    const path = prefix === '' ? key : `${prefix}.${key}`

    if (nested === null || typeof nested !== 'object' || depth >= MAX_KEY_DEPTH) return [path]
    if (!isPlainObject(nested) || isValidElement(nested)) return [path]

    const nestedPaths = flattenKeyPaths(nested, path, depth + 1)
    return nestedPaths.length > 0 ? nestedPaths : [path]
  })

const describeProp = (name: string, value: unknown): LoggedProp | undefined => {
  // An explicitly-`undefined` prop is indistinguishable from an absent one, and absent is the
  // answer that matters for deprecation.
  if (value === undefined) return undefined
  if (value === null) return { name, kind: PropKind.Null }

  switch (typeof value) {
    case 'boolean':
      return { name, kind: PropKind.Boolean, booleanValue: value }
    case 'string':
      return { name, kind: PropKind.String }
    case 'number':
    case 'bigint':
      return { name, kind: PropKind.Number }
    case 'function':
      return { name, kind: PropKind.Function }
    case 'symbol':
      return undefined
    default:
      break
  }

  if (isValidElement(value)) return { name, kind: PropKind.Node }

  if (Array.isArray(value)) {
    const items = value as ReadonlyArray<unknown>
    return { name, kind: containsElement(items) ? PropKind.Node : PropKind.Array }
  }

  if (!isPlainObject(value)) return { name, kind: PropKind.Object }

  return { name, kind: PropKind.Object, keys: flattenKeyPaths(value).sort().slice(0, MAX_KEY_PATHS) }
}

/** Describes the props a component was mounted with, by name and shape. No prop value is ever included. */
export function describeProps(props: object): LoggedProp[] {
  return Object.entries(props)
    .sort(([left], [right]) => left.localeCompare(right))
    .flatMap(([name, value]) => describeProp(name, value) ?? [])
    .slice(0, MAX_PROPS)
}

/** Stable identity for a component's prop combination, used to log each combination once per page load. */
export function toUsageSignature(component: string, props: ReadonlyArray<LoggedProp>) {
  return `${component}|${props.map(({ name, kind, booleanValue, keys }) =>
    [name, kind, booleanValue ?? '', keys?.join(',') ?? ''].join(':'),
  ).join(';')}`
}
