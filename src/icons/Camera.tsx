import * as React from 'react'
import { IconSvgProps } from './types'

const Camera = ({ size = 15, ...props }: IconSvgProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={size}
    height={size}
    viewBox='0 0 15 15'
    fill='none'
    {...props}
  >
    <g clipPath='url(#clip0_5334_45360)'>
      <path
        d='M11.166 4.33398H1.99935C1.74622 4.33398 1.54102 4.53919 1.54102 4.79232V11.209C1.54102 11.4621 1.74622 11.6673 1.99935 11.6673H11.166C11.4191 11.6673 11.6243 11.4621 11.6243 11.209V4.79232C11.6243 4.53919 11.4191 4.33398 11.166 4.33398Z'
        stroke='currentColor'
        strokeWidth='0.916667'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M11.6245 7.08399L14.3745 5.25066V10.7507L11.6245 8.91732'
        stroke='currentColor'
        strokeWidth='0.916667'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </g>
    <defs>
      <clipPath id='clip0_5334_45360'>
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
export default Camera
