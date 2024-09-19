import * as React from 'react'
import { IconSvgProps } from './types'

const BarChart2 = ({ size = 12, ...props }: IconSvgProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 12 12'
    fill='none'
    {...props}
    width={size}
    height={size}
  >
    <path
      d='M9.5 10V5'
      stroke='currentColor'
      stroke-linecap='round'
      stroke-linejoin='round'
    />
    <path
      d='M6.5 10V2'
      stroke='currentColor'
      stroke-linecap='round'
      stroke-linejoin='round'
    />
    <path
      d='M3.5 10V7'
      stroke='currentColor'
      stroke-linecap='round'
      stroke-linejoin='round'
    />
  </svg>
)

export default BarChart2
