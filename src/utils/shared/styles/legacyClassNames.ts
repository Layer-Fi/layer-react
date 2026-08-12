type LegacyClassNameMap = Record<string, string | ReadonlyArray<string>>

function toArray(value: string | ReadonlyArray<string>) {
  return typeof value === 'string' ? [value] : value
}

/**
 * Binds a component's map of current class names to the ones v0.1.122 emitted, and returns a
 * composer that emits both. Those names are part of the package's public surface — consumers
 * style against them — so the elements that carried them keep carrying them.
 *
 * A key that is itself a class name (`Layer__…`) is emitted alongside its legacy names. Any other
 * key is a state name for a variant that is a `data-*` attribute today, and emits only its legacy
 * names:
 *
 *     const legacyClassNames = createLegacyClassNames({
 *       Layer__UI__Button: 'Layer__btn',
 *       'variant:solid': 'Layer__btn--primary',
 *     })
 *
 *     className={legacyClassNames('Layer__UI__Button', `variant:${variant}`)}
 *
 */
export function createLegacyClassNames<const TMap extends LegacyClassNameMap>(map: TMap) {
  return (...names: ReadonlyArray<keyof TMap | false | null | undefined>) =>
    names
      .filter((name): name is keyof TMap => Boolean(name))
      .flatMap((name) => {
        const key = String(name)
        return key.startsWith('Layer__')
          ? [key, ...toArray(map[name])]
          : [...toArray(map[name])]
      })
      .join(' ')
}
