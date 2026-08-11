/**
 * The design-token half of the compatibility story. `legacy-styling-tokens.css` is the fix; this
 * module is the record of what was broken, what was aliased, and what was deliberately left alone.
 *
 * A renamed class and a renamed token break a platform in very different ways. A class rename stops
 * a selector from matching, and the customer can see that in devtools. A token rename fails
 * silently: `--btn-bg-color-primary` is still accepted, still inherits, and is read by nothing, so
 * a platform's brand colour is dropped with no selector to inspect and no error to see. That is why
 * these are tracked rather than left to the audit — the audit reads selectors, and there is no
 * broken selector here to find.
 *
 * Measured by diffing the published stylesheets: 0.1.133 reads 189 custom properties, 0.1.144 reads
 * 179, and 22 stopped being read. Not all 22 are regressions; see {@link DEAD_TOKENS}.
 */

export const LEGACY_TOKEN_BASELINE_VERSION = '0.1.133'

/**
 * How a token that 0.1.144 stopped reading is being handled.
 *
 * `token-alias` — 0.1.144 reads a differently-named token for the same thing, so the new name is
 * declared as `var(--legacy, <current default>)`.
 *
 * `rule-alias` — 0.1.144 inlined a raw value instead of routing through a token, so there is no
 * token to re-point and the rule itself has to carry the fallback.
 *
 * `not-a-regression` — the token stopped being read because the thing it styled stopped existing,
 * or it only ever drove a state the current markup does not have. Aliasing it would invent
 * behaviour rather than restore it.
 *
 * `unmapped` — a real loss with no safe target. Recorded so it can be answered honestly when a
 * customer asks, rather than looking like an oversight.
 */
export type LegacyTokenDisposition = 'token-alias' | 'rule-alias' | 'not-a-regression' | 'unmapped'

export type DeadToken = {
  /** The name a pre-0.1.144 platform stylesheet sets. */
  readonly token: string
  readonly disposition: LegacyTokenDisposition
  /** What 0.1.144 reads instead, or `null` when nothing does. */
  readonly replacement: string | null
  readonly note: string
}

/**
 * Every custom property 0.1.133 read and 0.1.144 does not, with its disposition. Ordered by
 * disposition so the repaired cases read first.
 */
export const DEAD_TOKENS: readonly DeadToken[] = [
  {
    token: '--btn-bg-color-primary',
    disposition: 'token-alias',
    replacement: '--button-bg-default',
    note: '`.Layer__btn--primary` became `.Layer__UI__Button[data-variant="solid"]`. Same element, same role.',
  },
  {
    token: '--btn-color-primary',
    disposition: 'token-alias',
    replacement: '--button-fg-default',
    note: 'As above, for the foreground.',
  },
  {
    token: '--btn-secondary-bg-color',
    disposition: 'rule-alias',
    replacement: '.Layer__UI__Button[data-variant="outlined"] background-color',
    note: 'The outlined variant inlines `--color-base-0` rather than reading a token.',
  },
  {
    token: '--btn-secondary-color',
    disposition: 'rule-alias',
    replacement: '.Layer__UI__Button[data-variant="outlined"] color',
    note: 'The outlined variant inlines `--color-base-900` rather than reading a token.',
  },
  {
    token: '--button-border-color-ghost',
    disposition: 'rule-alias',
    replacement: '.Layer__UI__Button[data-variant="outlined"] border-color',
    note:
      'Not a legacy name at all — part of the current token set, still defined by '
      + '`internal_variables.scss`, and left unread when the outlined variant hard-coded its border. '
      + 'Aliasing it fixes a live token, not an old one.',
  },
  {
    token: '--input-placeholder-color',
    disposition: 'rule-alias',
    replacement: '::placeholder color',
    note:
      '0.1.144 dropped both the global `::placeholder` rule and the token. Restored with a '
      + '`revert-layer` fallback so only a platform that sets the token sees a change.',
  },

  {
    token: '--badge-color-info',
    disposition: 'not-a-regression',
    replacement: null,
    note:
      'Read by exactly one 0.1.133 rule — the hover background of `.Layer__badge--with-hover`, a '
      + 'variant 0.1.144 does not render. Resting colours came from `--badge-bg-color-*`, which '
      + '0.1.144 still reads. Aliasing a hover colour onto a resting one would change the design.',
  },
  {
    token: '--badge-color-success',
    disposition: 'not-a-regression',
    replacement: null,
    note: 'As `--badge-color-info`.',
  },
  {
    token: '--badge-color-warning',
    disposition: 'not-a-regression',
    replacement: null,
    note: 'As `--badge-color-info`.',
  },
  {
    token: '--badge-color-error',
    disposition: 'not-a-regression',
    replacement: null,
    note: 'As `--badge-color-info`.',
  },
  {
    token: '--background-color',
    disposition: 'not-a-regression',
    replacement: null,
    note: 'Read only by `.Layer__balance-sheet` and `.Layer__statement-of-cash-flow`, both gone.',
  },
  {
    token: '--border-radius-base',
    disposition: 'not-a-regression',
    replacement: null,
    note: 'Read only by the old `.skeleton-loader`.',
  },
  {
    token: '--base-transparent-16-light',
    disposition: 'not-a-regression',
    replacement: null,
    note: 'Read only by the old profit-and-loss chart legend.',
  },
  {
    token: '--btn-tertiary-bg-color',
    disposition: 'not-a-regression',
    replacement: null,
    note: '`.Layer__btn--tertiary` has no 0.1.144 equivalent; the variant was dropped, not renamed.',
  },
  {
    token: '--btn-tertiary-color',
    disposition: 'not-a-regression',
    replacement: null,
    note: 'As `--btn-tertiary-bg-color`.',
  },
  {
    token: '--right-adjust',
    disposition: 'not-a-regression',
    replacement: null,
    note:
      'Internal plumbing: the old bank transactions table\'s hand-computed sticky offset. 0.1.144 '
      + 'pins columns from JavaScript. See legacy-styling-bank-transactions.css.',
  },
  {
    token: '--width',
    disposition: 'not-a-regression',
    replacement: null,
    note: 'Internal layout plumbing, never part of the theming surface.',
  },
  {
    token: '--table-bg',
    disposition: 'not-a-regression',
    replacement: null,
    note: 'Internal layout plumbing, never part of the theming surface.',
  },
  {
    token: '--text-heading-page',
    disposition: 'not-a-regression',
    replacement: null,
    note: 'Read only by heading components 0.1.144 no longer renders.',
  },
  {
    token: '--text-heading-view',
    disposition: 'not-a-regression',
    replacement: null,
    note: 'As `--text-heading-page`.',
  },

  {
    token: '--label-color',
    disposition: 'unmapped',
    replacement: null,
    note:
      '0.1.133 read it for `.Layer__input-label` only. The nearest 0.1.144 equivalent, `Layer__Label`, '
      + 'is general typography used far beyond form labels and defaults to `--color-base-900` where '
      + 'this defaulted to `--color-base-700`. Aliasing would recolour unrelated text.',
  },
  {
    token: '--input-border-color',
    disposition: 'unmapped',
    replacement: null,
    note:
      '0.1.144 composes field chrome across `Layer__UI__InputGroup`, `Layer__UI__Input` and the combo '
      + 'box out of `--border-color` and raw `--color-base-*`, in focus and invalid states the old '
      + 'token never covered. No single declaration means what it used to mean.',
  },
]

const BY_TOKEN = new Map(DEAD_TOKENS.map(entry => [entry.token, entry]))

/**
 * Whether a custom property a platform sets is one 0.1.144 no longer reads. The audit uses this to
 * turn "this declaration does nothing" into a finding, which is otherwise invisible: unlike a
 * broken selector, a dead token leaves no trace in the rendered DOM.
 */
export function findDeadToken(token: string) {
  return BY_TOKEN.get(token) ?? null
}

/** Dead tokens the compatibility layer repairs, so a caller can report "handled" separately. */
export function isAliasedToken(token: string) {
  const entry = BY_TOKEN.get(token)
  return entry?.disposition === 'token-alias' || entry?.disposition === 'rule-alias'
}
