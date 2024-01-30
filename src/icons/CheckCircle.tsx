import * as React from 'react'
import { IconSvgProps } from './types'

const CheckCircle = ({ size = 18, ...props }: IconSvgProps) => (
  <svg
    viewBox='0 0 18 18'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
    width={size}
    height={size}
  >
    <path
      d='M16.5 8.30999V8.99999C16.4991 10.6173 15.9754 12.191 15.007 13.4864C14.0386 14.7817 12.6775 15.7293 11.1265 16.1879C9.57557 16.6465 7.91794 16.5914 6.40085 16.0309C4.88375 15.4704 3.58848 14.4346 2.70821 13.0778C1.82794 11.721 1.40984 10.116 1.51625 8.50223C1.62266 6.88841 2.2479 5.35223 3.2987 4.12279C4.34951 2.89335 5.76958 2.03653 7.34713 1.6801C8.92469 1.32367 10.5752 1.48674 12.0525 2.14499'
      stroke='currentColor'
      stroke-linecap='round'
      stroke-linejoin='round'
    />
    <path
      d='M16.5 3L9 10.5075L6.75 8.2575'
      stroke='currentColor'
      stroke-linecap='round'
      stroke-linejoin='round'
    />
  </svg>
)

export default CheckCircle
