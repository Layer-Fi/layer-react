import * as React from 'react'
import { IconSvgProps } from './types'

const RefreshCcw = ({ size = 18, ...props }: IconSvgProps) => (
  <svg
    viewBox='0 0 18 18'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
    width={size}
    height={size}
  >
    <path
      d='M0.75 3V7.5H5.25'
      stroke='currentColor'
      stroke-linecap='round'
      stroke-linejoin='round'
    />
    <path
      d='M17.25 15V10.5H12.75'
      stroke='currentColor'
      stroke-linecap='round'
      stroke-linejoin='round'
    />
    <path
      d='M15.3675 6.75C14.9871 5.67508 14.3407 4.71405 13.4884 3.95656C12.6361 3.19907 11.6059 2.66982 10.4938 2.41819C9.38167 2.16656 8.22393 2.20075 7.12861 2.51758C6.03328 2.8344 5.03606 3.42353 4.23 4.23L0.75 7.5M17.25 10.5L13.77 13.77C12.9639 14.5765 11.9667 15.1656 10.8714 15.4824C9.77607 15.7992 8.61833 15.8334 7.50621 15.5818C6.3941 15.3302 5.36385 14.8009 4.5116 14.0434C3.65935 13.2859 3.01288 12.3249 2.6325 11.25'
      stroke='currentColor'
      stroke-linecap='round'
      stroke-linejoin='round'
    />
  </svg>
)

export default RefreshCcw
