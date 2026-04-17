import { type ColorSelector, type FallbackFillSelector, type SeriesData } from '@components/DetailedCharts/types'

export const ValueIcon = <T extends SeriesData>({
  item,
  colorSelector,
  fallbackFillSelector,
}: {
  item: T
  colorSelector: ColorSelector<T>
  fallbackFillSelector?: FallbackFillSelector<T>
}) => {
  if (fallbackFillSelector?.(item)) {
    return (
      <svg
        viewBox='0 0 12 12'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        width='12'
        height='12'
      >
        <defs>
          <pattern
            id='layer-pie-dots-pattern-legend'
            x='0'
            y='0'
            width='3'
            height='3'
            patternUnits='userSpaceOnUse'
          >
            <rect width='1' height='1' opacity={0.76} className='Layer__charts__dots-pattern-legend__dot' />
          </pattern>
        </defs>
        <rect width='12' height='12' id='layer-pie-dots-pattern-bg' rx='2' className='Layer__charts__dots-pattern-legend__bg' />
        <rect
          x='1'
          y='1'
          width='10'
          height='10'
          fill='url(#layer-pie-dots-pattern-legend)'
        />
      </svg>
    )
  }

  const colorMapping = colorSelector(item)

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
