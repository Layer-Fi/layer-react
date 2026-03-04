export const STRIPE_PATTERN_ID = 'layer-bar-stripe-pattern'
export const STRIPE_PATTERN_DARK_ID = 'layer-bar-stripe-pattern-dark'

export const getStripePatternId = (idPrefix?: string) => idPrefix ? `${idPrefix}-${STRIPE_PATTERN_ID}` : STRIPE_PATTERN_ID
export const getStripePatternDarkId = (idPrefix?: string) => idPrefix ? `${idPrefix}-${STRIPE_PATTERN_DARK_ID}` : STRIPE_PATTERN_DARK_ID

export const STRIPE_PATTERN_FILL = `url(#${STRIPE_PATTERN_ID})`
export const STRIPE_PATTERN_DARK_FILL = `url(#${STRIPE_PATTERN_DARK_ID})`

export const getStripePatternFill = (idPrefix?: string) => `url(#${getStripePatternId(idPrefix)})`
export const getStripePatternDarkFill = (idPrefix?: string) => `url(#${getStripePatternDarkId(idPrefix)})`

const StripePattern = ({ id, variant = 'light' }: { id: string, variant?: 'light' | 'dark' }) => (
  <pattern
    id={id}
    className={`Layer__stripe-pattern--${variant}`}
    x='0'
    y='0'
    width='4'
    height='4'
    patternTransform='rotate(45)'
    patternUnits='userSpaceOnUse'
  >
    <rect width='4' height='4' opacity={0.16} />
    <line x1='0' y='0' x2='0' y2='4' strokeWidth='2' />
  </pattern>
)

export const ProfitAndLossChartPatternDefs = ({ idPrefix }: { idPrefix?: string }) => (
  <defs>
    <StripePattern id={getStripePatternId(idPrefix)} variant='light' />
    <StripePattern id={getStripePatternDarkId(idPrefix)} variant='dark' />
  </defs>
)
