import * as React from 'react'
import { IconSvgProps } from './types'

const Loader = ({ size = 18, ...props }: IconSvgProps) => (
  <svg
    viewBox='0 0 18 18'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
    width={size}
    height={size}
  >
    <path
      d='M9 1.5V4.5'
      stroke='currentColor'
      stroke-linecap='round'
      stroke-linejoin='round'
    />
    <path
      d='M9 13.5V16.5'
      stroke='currentColor'
      stroke-linecap='round'
      stroke-linejoin='round'
    />
    <path
      d='M3.6975 3.6975L5.82 5.82'
      stroke='currentColor'
      stroke-linecap='round'
      stroke-linejoin='round'
    />
    <path
      d='M12.18 12.18L14.3025 14.3025'
      stroke='currentColor'
      stroke-linecap='round'
      stroke-linejoin='round'
    />
    <path
      d='M1.5 9H4.5'
      stroke='currentColor'
      stroke-linecap='round'
      stroke-linejoin='round'
    />
    <path
      d='M13.5 9H16.5'
      stroke='currentColor'
      stroke-linecap='round'
      stroke-linejoin='round'
    />
    <path
      d='M3.6975 14.3025L5.82 12.18'
      stroke='currentColor'
      stroke-linecap='round'
      stroke-linejoin='round'
    />
    <path
      d='M12.18 5.82L14.3025 3.6975'
      stroke='currentColor'
      stroke-linecap='round'
      stroke-linejoin='round'
    />
  </svg>
)

export default Loader
