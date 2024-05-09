import * as React from 'react'
import { IconSvgProps } from './types'

const Loader = ({ size = 18, ...props }: IconSvgProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 18 18'
    fill='none'
    {...props}
    width={size}
    height={size}
  >
    <path
      d='M9 1.5V4.5'
      stroke='#3E4044'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M9 13.5V16.5'
      stroke='#818388'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M3.6975 3.6975L5.82 5.82'
      stroke='#5F6166'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M12.18 12.18L14.3025 14.3025'
      stroke='#2D2F33'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M1.5 9H4.5'
      stroke='#5F6166'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M13.5 9H16.5'
      stroke='#2D2F33'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M3.6975 14.3025L5.82 12.18'
      stroke='#818388'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M12.18 5.82L14.3025 3.6975'
      stroke='#3E4044'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)

export default Loader
