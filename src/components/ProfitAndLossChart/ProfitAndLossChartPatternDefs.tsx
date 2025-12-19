export const STRIPE_PATTERN_ID = 'layer-bar-stripe-pattern'
export const STRIPE_PATTERN_DARK_ID = 'layer-bar-stripe-pattern-dark'

export const STRIPE_PATTERN_FILL = `url(#${STRIPE_PATTERN_ID})`
export const STRIPE_PATTERN_DARK_FILL = `url(#${STRIPE_PATTERN_DARK_ID})`

const StripePattern = ({ id }: { id: string }) => (
  <pattern
    id={id}
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

export const ProfitAndLossChartPatternDefs = () => (
  <defs>
    <StripePattern id={STRIPE_PATTERN_ID} />
    <StripePattern id={STRIPE_PATTERN_DARK_ID} />
  </defs>
)
