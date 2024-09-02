import * as React from 'react'
import { IconSvgProps } from './types'

const Clock = ({ size = 15, ...props }: IconSvgProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={size}
    height={size}
    viewBox='0 0 15 15'
    fill='none'
    {...props}
  >
    <g clipPath='url(#clip0_5334_45367)'>
      <path
        d='M7.49951 13.5007C10.5371 13.5007 12.9995 11.0382 12.9995 8.00066C12.9995 4.96309 10.5371 2.50066 7.49951 2.50066C4.46195 2.50066 1.99951 4.96309 1.99951 8.00066C1.99951 11.0382 4.46195 13.5007 7.49951 13.5007Z'
        stroke='currentColor'
        strokeWidth='0.916667'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M7.49951 4.79233V8.00066H10.7078'
        stroke='currentColor'
        strokeWidth='0.916667'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </g>
    <defs>
      <clipPath id='clip0_5334_45367'>
        <rect
          width='14.6667'
          height='14.6667'
          fill='white'
          transform='translate(0.166504 0.666672)'
        />
      </clipPath>
    </defs>
  </svg>
)
export default Clock
