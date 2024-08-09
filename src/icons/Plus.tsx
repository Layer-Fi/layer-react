import * as React from 'react'
import { IconSvgProps } from './types'

const Plus = ({ size = 14, ...props }: IconSvgProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 14 14'
    fill='none'
    {...props}
    width={size}
    height={size}
  >
    <path
      d='M7 2.91602V11.0827'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M2.91669 7H11.0834'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)

export default Plus
