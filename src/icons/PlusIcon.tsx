import * as React from 'react'
import { IconSvgProps } from './types'

const PlusIcon = ({ size = 14, ...props }: IconSvgProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 16 17'
    fill='none'
    {...props}
    width={size}
    height={size}
  >
    <path
      d='M14.6667 8.49996C14.6667 4.81806 11.6819 1.83329 8.00004 1.83329C4.31814 1.83329 1.33337 4.81806 1.33337 8.49996C1.33337 12.1819 4.31814 15.1666 8.00004 15.1666C11.6819 15.1666 14.6667 12.1819 14.6667 8.49996Z'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M5.33337 8.5L10.6667 8.5'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M8 11.1666L8 5.83329'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)

export default PlusIcon
