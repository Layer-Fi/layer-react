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
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M9 13.5V16.5'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M3.69751 3.69751L5.82001 5.82001'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M12.1799 12.18L14.3024 14.3025'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M1.5 9H4.5'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M13.5 9H16.5'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M3.69751 14.3025L5.82001 12.18'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M12.1799 5.82001L14.3024 3.69751'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)

export default Loader
