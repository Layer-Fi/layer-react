import { createLegacyClassNames, type LegacyClassNameMapFor } from '@utils/shared/styles/legacyClassNames'
import { type ColorSelector, type SeriesData, type TypeColorMapping } from '@ui/Chart/seriesTypes'
import { type FallbackFillSelector } from '@blocks/DetailedChart/types'

import './valueIcon.scss'

type ValueIconClassName = 'Layer__ValueIcon__PatternDot' | 'Layer__ValueIcon__PatternBackground'

const legacyClassNames = createLegacyClassNames({
  Layer__ValueIcon__PatternDot: 'Layer__charts__dots-pattern-legend__dot',
  Layer__ValueIcon__PatternBackground: 'Layer__charts__dots-pattern-legend__bg',
} satisfies LegacyClassNameMapFor<ValueIconClassName>)

export const ValueIcon = <T extends SeriesData>({
  item,
  colorSelector,
  fallbackFillSelector,
  fallbackFillColor,
}: {
  item: T
  colorSelector: ColorSelector<T>
  fallbackFillSelector?: FallbackFillSelector<T>
  fallbackFillColor?: string
}) => {
  if (fallbackFillSelector?.(item)) {
    if (fallbackFillColor) {
      return <RegularValueIcon colorMapping={{ color: fallbackFillColor, opacity: 1 }} />
    }
    return <UncategorizedValueIcon />
  }
  return <RegularValueIcon colorMapping={colorSelector(item)} />
}

const UncategorizedValueIcon = () => {
  return (
    <svg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg' width='12' height='12'>
      <defs>
        <pattern id='layer-pie-dots-pattern-legend' x='0' y='0' width='3' height='3' patternUnits='userSpaceOnUse'>
          <rect width='1' height='1' opacity={0.76} className={legacyClassNames('Layer__ValueIcon__PatternDot')} />
        </pattern>
      </defs>
      <rect width='12' height='12' id='layer-pie-dots-pattern-bg' rx='2' className={legacyClassNames('Layer__ValueIcon__PatternBackground')} />
      <rect x='1' y='1' width='10' height='10' fill='url(#layer-pie-dots-pattern-legend)' />
    </svg>
  )
}

const RegularValueIcon = ({ colorMapping }: { colorMapping: TypeColorMapping }) => {
  return (
    <svg
      className='share-icon'
      viewBox='0 0 12 12'
      xmlns='http://www.w3.org/2000/svg'
      aria-hidden='true'
    >
      <rect
        width='12'
        height='12'
        rx='2'
        fill={colorMapping.color}
        fillOpacity={colorMapping.opacity}
      />
    </svg>
  )
}
