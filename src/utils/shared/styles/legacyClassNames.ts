import classNames from 'classnames'

type LegacyClassNameMap = Record<string, string | ReadonlyArray<string>>

function toArray(value: string | ReadonlyArray<string>) {
  return typeof value === 'string' ? [value] : value
}

/**
 * Constrains a component's map to its own class names: every key is either one of `TClassName` or a
 * modifier of one, or a `state:`-style key naming a variant that is a `data-*` attribute today. A
 * key that is neither — a name the component does not render — fails typecheck instead of quietly
 * emitting nothing.
 *
 * Pass `TStateKey` wherever the composer is called with an interpolated key: typing it from the
 * prop's own union means dropping a variant fails typecheck at the stale entry, which a `state:`
 * wildcard cannot catch.
 */
export type LegacyClassNameMapFor<
  TClassName extends string,
  TStateKey extends string = `state:${string}`,
> = Partial<
  Record<TClassName | `${TClassName}--${string}` | TStateKey, string | ReadonlyArray<string>>
>

/**
 * Binds a component's current class names to the ones v0.1.122 emitted, and returns a composer that
 * emits both — consumers style against the old names, so the elements that carried them keep
 * carrying them.
 *
 * A `Layer__…` key is a class name and is emitted alongside its legacy names. Any other key names a
 * variant that is a `data-*` attribute today, and emits only its legacy names:
 *
 *     const legacyClassNames = createLegacyClassNames({
 *       Layer__UI__Button: 'Layer__btn',
 *       'variant:solid': 'Layer__btn--primary',
 *     })
 *
 *     className={legacyClassNames('Layer__UI__Button', `variant:${variant}`)}
 */
export function createLegacyClassNames<const TMap extends LegacyClassNameMap>(map: TMap) {
  return (...names: ReadonlyArray<keyof TMap | false | null | undefined>) =>
    names
      .filter((name): name is keyof TMap => Boolean(name))
      .flatMap((name) => {
        const key = String(name)
        const legacyNames = toArray(map[name] ?? [])
        return key.startsWith('Layer__') ? [key, ...legacyNames] : legacyNames
      })
      .join(' ')
}

/**
 * For a form field whose only dropped names are its wrapper and that wrapper's inline modifier —
 * every field `FormFieldShell` took the layout over from. Both are passed in full rather than
 * derived, so each stays greppable.
 */
export function createLegacyFieldClassNames(wrapper: string, inlineWrapper: string) {
  const legacyClassNames = createLegacyClassNames({
    'field:default': wrapper,
    'field:inline': inlineWrapper,
  })

  return ({ inline, className }: { inline?: boolean, className?: string } = {}) =>
    classNames(legacyClassNames('field:default', inline && 'field:inline'), className)
}
