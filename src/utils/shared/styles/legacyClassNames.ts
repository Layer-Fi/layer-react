import classNames, { type ArgumentArray } from 'classnames'

/**
 * A class name paired with the older names it replaced. Consumers style against the
 * emitted names (README tells them to), so a rename has to keep shipping the old string
 * on the same element. `legacy` entries are inert DOM hooks — no library rule targets
 * them.
 */
export type LayerClassName = {
  readonly current: string
  readonly legacy: readonly string[]
}

export const layerClassName = (
  current: string,
  ...legacy: string[]
): LayerClassName => ({ current, legacy })

export const withLegacy = (
  { current, legacy }: LayerClassName,
  ...extra: ArgumentArray
) => classNames(current || undefined, ...legacy, ...extra)
