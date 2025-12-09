interface UncategorizedIconProps {
  variant: 'desktop' | 'mobile'
}

export const UncategorizedIcon = ({ variant }: UncategorizedIconProps) => {
  const patternId = `layer-pie-dots-pattern-legend${variant === 'mobile' ? '-mobile' : ''}`
  const bgRectId = `layer-pie-dots-pattern-bg${variant === 'mobile' ? '-mobile' : ''}`

  return (
    <svg
      viewBox='0 0 12 12'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      width='12'
      height='12'
      role='img'
      aria-label='Uncategorized item indicator'
    >
      <defs>
        <pattern
          id={patternId}
          x='0'
          y='0'
          width='3'
          height='3'
          patternUnits='userSpaceOnUse'
        >
          <rect width='1' height='1' opacity={0.76} className='Layer__charts__dots-pattern-legend__dot' />
        </pattern>
      </defs>
      <rect width='12' height='12' id={bgRectId} rx='2' className='Layer__charts__dots-pattern-legend__bg' />
      <rect
        x='1'
        y='1'
        width='10'
        height='10'
        fill={`url(#${patternId})`}
      />
    </svg>
  )
}
